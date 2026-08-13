/**
 * =========================================================
 * UNIVERSAL KISI-KISI PARSER (EXCEL & WORD .DOCX)
 * SmartEval Module - Supports .xlsx, .xls, .csv, .docx
 * =========================================================
 */

import XLSX from 'xlsx-js-style';
import JSZip from 'jszip';
import mammoth from 'mammoth';

/**
 * Membaca File Kisi-Kisi (Otomatis deteksi format Excel / Word)
 */
export async function parseKisiKisiFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    return await parseKisiKisiFromDocx(file);
  } else {
    return await parseKisiKisiFromExcel(file);
  }
}

/**
 * Membaca Dokumen Kisi-Kisi dari Microsoft Word (.docx)
 * Mengekstrak tabel w:tbl XML secara langsung & fallback teks mammoth
 */
export async function parseKisiKisiFromDocx(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXmlFile = zip.file('word/document.xml');

      if (!docXmlFile) {
        throw new Error("Berkas Word tidak valid atau tidak memiliki document.xml.");
      }

      const xmlText = await docXmlFile.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

      // Ambil semua tabel dalam dokumen Word
      const tables = xmlDoc.getElementsByTagName('w:tbl');
      let tableRows = [];

      if (tables && tables.length > 0) {
        // Ambil tabel terbesar (kisi-kisi biasanya tabel utama)
        let mainTable = tables[0];
        let maxRows = 0;

        for (let i = 0; i < tables.length; i++) {
          const rows = tables[i].getElementsByTagName('w:tr');
          if (rows.length > maxRows) {
            maxRows = rows.length;
            mainTable = tables[i];
          }
        }

        const trElements = mainTable.getElementsByTagName('w:tr');
        for (let r = 0; r < trElements.length; r++) {
          const row = [];
          const tcElements = trElements[r].getElementsByTagName('w:tc');
          for (let c = 0; c < tcElements.length; c++) {
            const tElements = tcElements[c].getElementsByTagName('w:t');
            let cellText = '';
            for (let t = 0; t < tElements.length; t++) {
              cellText += tElements[t].textContent;
            }
            row.push(cellText.trim());
          }
          if (row.some(cell => cell.length > 0)) {
            tableRows.push(row);
          }
        }
      }

      // Jika tidak ditemukan tabel XML, gunakan ekstraksi teks mammoth
      if (tableRows.length === 0) {
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        const lines = textResult.value.split('\n').filter(l => l.trim().length > 0);
        tableRows = lines.map(line => [line]);
      }

      // Analisis tabel 2D menggunakan algoritma semantik & heuristik
      const parsedData = processKisiKisi2DMatrix(tableRows);
      resolve(parsedData);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Membaca Dokumen Kisi-Kisi dari Excel (.xlsx / .xls / .csv)
 */
export async function parseKisiKisiFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        let targetSheetName = workbook.SheetNames[0];
        for (const name of workbook.SheetNames) {
          if (name.toLowerCase().includes('kisi') || name.toLowerCase().includes('soal')) {
            targetSheetName = name;
            break;
          }
        }

        const worksheet = workbook.Sheets[targetSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const parsedData = processKisiKisi2DMatrix(jsonRows);
        resolve(parsedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Mesin Pemroses Matriks 2D Kisi-Kisi (Universal untuk Excel & Word)
 */
function processKisiKisi2DMatrix(jsonRows) {
  let noCol = -1;
  let materiCol = -1;
  let indikatorCol = -1;
  let kdCol = -1;
  let levelCol = -1;
  let bentukCol = -1;
  let kunciCol = -1;
  let headerRowIdx = -1;

  // 1. FUZZY SEMANTIC HEADER MATCHING
  for (let r = 0; r < Math.min(jsonRows.length, 20); r++) {
    const row = jsonRows[r];
    if (!row || row.length === 0) continue;

    let matchesInThisRow = 0;

    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim().toLowerCase();
      if (!val) continue;

      // Nomor Soal
      if (val.includes('no butir') || val.includes('nomor butir') || val.includes('no. butir') ||
          val.includes('no soal') || val.includes('nomor soal') || val.includes('no. soal') ||
          val.includes('no urut') || val === 'no' || val === 'nomor' || val === 'nom') {
        if (noCol === -1 || val.includes('soal') || val.includes('butir')) {
          noCol = c;
          matchesInThisRow++;
        }
      }

      // Materi Pokok
      if (val.includes('materi') || val.includes('lingkup materi') || val.includes('topik') ||
          val.includes('bahan kajian') || val.includes('pokok bahasan') || val.includes('sub materi')) {
        materiCol = c;
        matchesInThisRow++;
      }

      // Indikator Soal
      if (val.includes('indikator') || val.includes('iktp') || val.includes('kriteria') ||
          val.includes('tujuan pembelajaran') || val.includes('deskripsi soal') || val.includes('indikator soal')) {
        indikatorCol = c;
        matchesInThisRow++;
      }

      // KD / CP
      if (val.includes('kompetensi') || val.includes('kd') || val.includes('capaian') ||
          val.includes('cp') || val.includes('elemen')) {
        kdCol = c;
        matchesInThisRow++;
      }

      // Level Kognitif
      if (val.includes('level') || val.includes('kognitif') || val.includes('ranah') ||
          val.includes('taksonomi') || val.includes('l1') || val.includes('c1')) {
        levelCol = c;
        matchesInThisRow++;
      }

      // Bentuk Soal
      if (val.includes('bentuk') || val.includes('tipe') || val.includes('jenis')) {
        bentukCol = c;
        matchesInThisRow++;
      }

      // Kunci Jawaban
      if (val.includes('kunci') || val.includes('jawaban') || val.includes('opsi') || val.includes('key')) {
        kunciCol = c;
        matchesInThisRow++;
      }
    }

    if (matchesInThisRow >= 2 && headerRowIdx === -1) {
      headerRowIdx = r;
    }
  }

  const startRow = (headerRowIdx !== -1) ? headerRowIdx + 1 : 1;

  // 2. HEURISTIC CONTENT-BASED ANALYZER (Jika ada kolom yang belum terdeteksi)
  if (noCol === -1 || materiCol === -1 || indikatorCol === -1) {
    const colStats = {};

    for (let r = startRow; r < Math.min(jsonRows.length, startRow + 25); r++) {
      const row = jsonRows[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const cell = String(row[c] || '').trim();
        if (!cell) continue;

        if (!colStats[c]) colStats[c] = { numbers: 0, longText: 0, mediumText: 0, levels: 0, keys: 0, total: 0 };
        colStats[c].total++;

        if (cell.match(/^\d+$/) && parseInt(cell) >= 1 && parseInt(cell) <= 50) colStats[c].numbers++;
        if (['A', 'B', 'C', 'D'].includes(cell.toUpperCase())) colStats[c].keys++;
        if (['L1', 'L2', 'L3', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6'].includes(cell.toUpperCase())) colStats[c].levels++;
        if (cell.length > 30 || cell.toLowerCase().includes('disajikan') || cell.toLowerCase().includes('peserta didik')) colStats[c].longText++;
        if (cell.length >= 8 && cell.length <= 40) colStats[c].mediumText++;
      }
    }

    for (const [colStr, stat] of Object.entries(colStats)) {
      const col = parseInt(colStr);
      if (noCol === -1 && stat.numbers >= 3) noCol = col;
      if (kunciCol === -1 && stat.keys >= 3) kunciCol = col;
      if (levelCol === -1 && stat.levels >= 3) levelCol = col;
      if (indikatorCol === -1 && stat.longText >= 2) indikatorCol = col;
      if (materiCol === -1 && stat.mediumText >= 2 && col !== indikatorCol && col !== kdCol) materiCol = col;
    }
  }

  // Fallbacks akhir jika tabel sangat ringkas
  if (noCol === -1) noCol = 0;
  if (materiCol === -1) materiCol = Math.min(1, jsonRows[0] ? jsonRows[0].length - 1 : 1);
  if (indikatorCol === -1) indikatorCol = materiCol;

  const parsedData = {
    materials: Array(25).fill(''),
    indicators: Array(25).fill(''),
    kds: Array(25).fill(''),
    levels: Array(25).fill('L1'),
    keys: Array(25).fill('A'),
    count: 0,
  };

  let lastKd = '';
  let lastMateri = '';

  for (let r = startRow; r < jsonRows.length; r++) {
    const row = jsonRows[r];
    if (!row || row.length === 0) continue;

    // Cek bentuk soal jika ada (prioritas PG)
    if (bentukCol !== -1 && row[bentukCol]) {
      const bentukStr = String(row[bentukCol]).trim().toUpperCase();
      if (bentukStr && !bentukStr.includes('PG') && !bentukStr.includes('PILIHAN') && !bentukStr.includes('GANDA')) {
        continue; // Lewati isian/uraian
      }
    }

    // Baca nomor soal
    let qNum = null;
    if (noCol !== -1 && row[noCol] !== undefined) {
      const numMatch = String(row[noCol]).match(/\d+/);
      if (numMatch) qNum = parseInt(numMatch[0]);
    }

    // Fallback cek nomor di kolom lain
    if (!qNum || qNum < 1 || qNum > 25) {
      for (let c = 0; c < row.length; c++) {
        if (c !== materiCol && c !== indikatorCol && row[c]) {
          const match = String(row[c]).match(/^\d+$/);
          if (match && parseInt(match[0]) >= 1 && parseInt(match[0]) <= 25) {
            qNum = parseInt(match[0]);
            break;
          }
        }
      }
    }

    if (!qNum || qNum < 1 || qNum > 25) continue;
    const qIdx = qNum - 1;

    // KD & Materi (dengan inheritance otomatis jika merged cell)
    if (kdCol !== -1 && row[kdCol]) lastKd = String(row[kdCol]).trim();
    if (materiCol !== -1 && row[materiCol]) lastMateri = String(row[materiCol]).trim();

    const indikator = (indikatorCol !== -1 && row[indikatorCol]) ? String(row[indikatorCol]).trim() : '';
    const level = (levelCol !== -1 && row[levelCol]) ? String(row[levelCol]).trim() : 'L1';
    const kunci = (kunciCol !== -1 && row[kunciCol]) ? String(row[kunciCol]).trim().toUpperCase() : '';

    parsedData.materials[qIdx] = lastMateri || (indikator ? indikator.substring(0, 30) : `Materi Soal ${qNum}`);
    parsedData.indicators[qIdx] = indikator || lastMateri || `Indikator Pembelajaran Soal ${qNum}`;
    parsedData.kds[qIdx] = lastKd;
    parsedData.levels[qIdx] = level || 'L1';
    if (kunci && ['A', 'B', 'C', 'D'].includes(kunci)) {
      parsedData.keys[qIdx] = kunci;
    }

    parsedData.count++;
  }

  // Fallback sequential jika count = 0
  if (parsedData.count === 0 && jsonRows.length > startRow) {
    let seqNum = 1;
    for (let r = startRow; r < jsonRows.length && seqNum <= 25; r++) {
      const row = jsonRows[r];
      if (!row || row.length === 0) continue;
      const qIdx = seqNum - 1;
      const text = row.join(' ').trim();
      if (text.length > 5) {
        parsedData.materials[qIdx] = String(row[materiCol] || `Materi Soal ${seqNum}`).trim();
        parsedData.indicators[qIdx] = String(row[indikatorCol] || parsedData.materials[qIdx]).trim();
        parsedData.count++;
        seqNum++;
      }
    }
  }

  return parsedData;
}
