/**
 * =========================================================
 * UNIVERSAL KISI-KISI PARSER (EXCEL & WORD .DOCX)
 * SmartEval Universal Module - Supports KURMER, K13, & Custom Blueprints
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

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return await parseKisiKisiFromDocx(file);
  } else {
    return await parseKisiKisiFromExcel(file);
  }
}

/**
 * Membaca Dokumen Kisi-Kisi dari Microsoft Word (.docx)
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

      const tables = xmlDoc.getElementsByTagName('w:tbl');
      let allTableRows = [];

      // Ekstraksi teks non-tabel (metadata header seperti Mata Pelajaran)
      let headerMetadata = [];
      const paragraphs = xmlDoc.getElementsByTagName('w:p');
      for (let p = 0; p < Math.min(paragraphs.length, 30); p++) {
        const text = paragraphs[p].textContent.trim();
        if (text.length > 0) headerMetadata.push(text);
      }

      if (tables && tables.length > 0) {
        // Ekstraksi baris dari semua tabel
        for (let t = 0; t < tables.length; t++) {
          const trElements = tables[t].getElementsByTagName('w:tr');
          for (let r = 0; r < trElements.length; r++) {
            const row = [];
            const tcElements = trElements[r].getElementsByTagName('w:tc');
            for (let c = 0; c < tcElements.length; c++) {
              const tElements = tcElements[c].getElementsByTagName('w:t');
              let cellText = '';
              for (let i = 0; i < tElements.length; i++) {
                cellText += tElements[i].textContent;
              }
              row.push(cellText.trim());
            }
            if (row.some(cell => cell.length > 0)) {
              allTableRows.push(row);
            }
          }
        }
      }

      // Jika tidak ada tabel XML, gunakan ekstraksi teks mammoth
      if (allTableRows.length === 0) {
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        const lines = textResult.value.split('\n').filter(l => l.trim().length > 0);
        allTableRows = lines.map(line => [line]);
      }

      const parsedData = processUniversalKisiKisiMatrix(allTableRows, headerMetadata.join(' '));
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
          if (name.toLowerCase().includes('kisi') || name.toLowerCase().includes('soal') || name.toLowerCase().includes('sat')) {
            targetSheetName = name;
            break;
          }
        }

        const worksheet = workbook.Sheets[targetSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const parsedData = processUniversalKisiKisiMatrix(jsonRows);
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
 * Mesin Pemroses Universal Matriks Kisi-Kisi (Kurikulum Merdeka & Kurikulum 2013)
 */
function processUniversalKisiKisiMatrix(jsonRows, externalMetadataText = '') {
  // 1. Ekstraksi Mata Pelajaran dari metadata dokumen
  let extractedSubject = '';
  const searchCorpus = externalMetadataText + ' ' + jsonRows.slice(0, 15).map(r => (Array.isArray(r) ? r.join(' ') : '')).join(' ');
  const subjectMatch = searchCorpus.match(/mata\s*pelajaran\s*[:=\-]?\s*([A-Za-z0-9\s\(\)]+?)(?=\n|kurikulum|alokasi|jumlah|tahun|kota|kelas|$)/i);
  if (subjectMatch && subjectMatch[1]) {
    extractedSubject = subjectMatch[1].replace(/\r|\n/g, '').trim();
  }

  // 2. Temukan Baris Header Tabel Sejati
  let headerRowIdx = -1;
  for (let r = 0; r < Math.min(jsonRows.length, 25); r++) {
    const row = jsonRows[r];
    if (!row || row.length === 0) continue;

    const rowStr = row.map(c => String(c || '').toLowerCase()).join(' ');
    const hasNumCol = row.some(c => {
      const v = String(c || '').toLowerCase();
      return v.includes('no') || v.includes('soal') || v.includes('butir');
    });
    const hasContentCol = row.some(c => {
      const v = String(c || '').toLowerCase();
      return v.includes('indikator') || v.includes('materi') || v.includes('tujuan') || v.includes('kompetensi') || v.includes('kd') || v.includes('tp') || v.includes('cp');
    });

    if (hasNumCol && hasContentCol) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) headerRowIdx = 0;

  const cols = {
    no: -1,
    materi: -1,
    indikator: -1,
    kd_tp: -1,
    level: -1,
    bentuk: -1,
    kunci: -1,
  };

  const headerRow = jsonRows[headerRowIdx] || [];

  // 3. Pemetaan Kolom Cerdas
  for (let c = 0; c < headerRow.length; c++) {
    const val = String(headerRow[c] || '').trim().toLowerCase();
    if (!val) continue;

    // Prioritas kolom Nomor Soal (misal: 'NO. SOAL' atau 'NO BUTIR' mengalahkan 'NO.' nomor TP)
    if (val.includes('no soal') || val.includes('no. soal') || val.includes('nomor soal') || val.includes('no butir') || val.includes('nomor butir') || val.includes('no. butir')) {
      cols.no = c;
    } else if (cols.no === -1 && (val === 'no.' || val === 'no' || val === 'nomor' || val === 'nom')) {
      cols.no = c;
    }

    // Bentuk / Jenis Soal
    if (val.includes('jenis') || val.includes('bentuk') || val.includes('tipe') || val.includes('jenis soal') || val.includes('bentuk soal')) {
      cols.bentuk = c;
    }

    // Level Kognitif
    if (val.includes('level') || val.includes('kognitif') || val.includes('ranah') || val.includes('taksonomi')) {
      cols.level = c;
    }

    // Indikator Soal
    if (val.includes('indikator') || val.includes('iktp') || val.includes('kriteria') || val.includes('indikator soal') || val.includes('indikator pembelajaran')) {
      cols.indikator = c;
    }

    // Materi Pokok
    if (val.includes('materi') || val.includes('materi pokok') || val.includes('lingkup materi') || val.includes('topik') || val.includes('bahan kajian')) {
      cols.materi = c;
    }

    // Tujuan Pembelajaran (Kurikulum Merdeka) / Kompetensi Dasar (K13)
    if (val.includes('tujuan') || val.includes('tujuan pembelajaran') || val.includes('tp') || val.includes('kompetensi') || val.includes('kd') || val.includes('capaian') || val.includes('cp')) {
      cols.kd_tp = c;
    }

    // Kunci Jawaban
    if (val.includes('kunci') || val.includes('kunci jawaban') || val.includes('jawaban') || val.includes('opsi') || val.includes('key')) {
      cols.kunci = c;
    }
  }

  // Jika tidak ada kolom materi terpisah tetapi ada Tujuan Pembelajaran / KD (seperti KURMER), gunakan KD/TP sebagai Materi!
  if (cols.materi === -1 && cols.kd_tp !== -1) {
    cols.materi = cols.kd_tp;
  } else if (cols.kd_tp === -1 && cols.materi !== -1) {
    cols.kd_tp = cols.materi;
  }

  // Fallbacks jika kolom tidak bernama standar
  if (cols.no === -1) cols.no = 0;
  if (cols.materi === -1) cols.materi = Math.min(1, headerRow.length - 1);
  if (cols.indikator === -1) cols.indikator = cols.materi;

  const parsedData = {
    subject: extractedSubject,
    materials: Array(25).fill(''),
    indicators: Array(25).fill(''),
    kds: Array(25).fill(''),
    levels: Array(25).fill('L1'),
    keys: Array(25).fill('A'),
    count: 0,
  };

  let lastKd = '';
  let lastMateri = '';

  const startRow = headerRowIdx + 1;

  for (let r = startRow; r < jsonRows.length; r++) {
    const row = jsonRows[r];
    if (!row || row.length === 0) continue;

    // Filter bentuk/jenis soal (hanya proses soal bertipe PG / Pilihan Ganda, abaikan B/S, Isian, Uraian, Menjodohkan)
    if (cols.bentuk !== -1 && cols.bentuk < row.length && row[cols.bentuk]) {
      const bStr = String(row[cols.bentuk]).trim().toUpperCase();
      if (bStr && !bStr.includes('PG') && !bStr.includes('PILIHAN') && !bStr.includes('GANDA')) {
        continue;
      }
    }

    // Ekstraksi Nomor Soal
    let qNum = null;
    if (cols.no !== -1 && cols.no < row.length && row[cols.no] !== undefined) {
      const match = String(row[cols.no]).match(/\d+/);
      if (match) qNum = parseInt(match[0]);
    }

    // Fallback cek nomor di kolom lain jika kosong
    if (!qNum || qNum < 1 || qNum > 25) {
      for (let c = row.length - 1; c >= 0; c--) {
        if (c !== cols.materi && c !== cols.indikator && row[c]) {
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

    // KD / Tujuan Pembelajaran & Materi dengan pewarisan sel gabungan (Merged Cells)
    if (cols.kd_tp !== -1 && cols.kd_tp < row.length && row[cols.kd_tp]) {
      const txt = String(row[cols.kd_tp]).trim();
      if (txt) lastKd = txt;
    }
    if (cols.materi !== -1 && cols.materi < row.length && row[cols.materi]) {
      const txt = String(row[cols.materi]).trim();
      if (txt) lastMateri = txt;
    }

    const indikator = (cols.indikator !== -1 && cols.indikator < row.length && row[cols.indikator]) ? String(row[cols.indikator]).trim() : '';

    // Normalisasi Level Kognitif: 1 -> L1, 2 -> L2, 3 -> L3
    let level = 'L1';
    if (cols.level !== -1 && cols.level < row.length && row[cols.level]) {
      const rawLvl = String(row[cols.level]).trim().toUpperCase();
      if (rawLvl === '1' || rawLvl === 'L1' || rawLvl === 'C1' || rawLvl === 'C2') level = 'L1';
      else if (rawLvl === '2' || rawLvl === 'L2' || rawLvl === 'C3') level = 'L2';
      else if (rawLvl === '3' || rawLvl === 'L3' || rawLvl === 'C4' || rawLvl === 'C5' || rawLvl === 'C6') level = 'L3';
      else level = rawLvl;
    }

    const kunci = (cols.kunci !== -1 && cols.kunci < row.length && row[cols.kunci]) ? String(row[cols.kunci]).trim().toUpperCase() : '';

    // Format judul ringkas materi pokok jika menggunakan Tujuan Pembelajaran
    let materiTitle = lastMateri;
    if (!materiTitle && lastKd) {
      materiTitle = lastKd.length > 40 ? lastKd.substring(0, 37) + '...' : lastKd;
    }

    parsedData.materials[qIdx] = materiTitle || `Materi Soal ${qNum}`;
    parsedData.indicators[qIdx] = indikator || lastMateri || lastKd || `Indikator Soal ${qNum}`;
    parsedData.kds[qIdx] = lastKd;
    parsedData.levels[qIdx] = level || 'L1';
    if (kunci && ['A', 'B', 'C', 'D'].includes(kunci)) {
      parsedData.keys[qIdx] = kunci;
    }

    parsedData.count++;
  }

  // Fallback sequential jika tabel sangat tidak teratur
  if (parsedData.count === 0 && jsonRows.length > startRow) {
    let seqNum = 1;
    for (let r = startRow; r < jsonRows.length && seqNum <= 25; r++) {
      const row = jsonRows[r];
      if (!row || row.length === 0) continue;
      const qIdx = seqNum - 1;
      const text = row.join(' ').trim();
      if (text.length > 5) {
        parsedData.materials[qIdx] = String(row[cols.materi] || `Materi Soal ${seqNum}`).trim();
        parsedData.indicators[qIdx] = String(row[cols.indikator] || parsedData.materials[qIdx]).trim();
        parsedData.count++;
        seqNum++;
      }
    }
  }

  return parsedData;
}
