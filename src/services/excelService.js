/**
 * =========================================================
 * EXCEL SERVICE (Official ASKA Template - Dynamic N Questions)
 * SmartEval Excel Module - Analisis Asesmen Sumatif Kelas Akhir
 * =========================================================
 */

import XLSX from 'xlsx-js-style';

export async function parseStudentsFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let nameColIdx = -1;
        let startRowIdx = -1;

        for (let r = 0; r < Math.min(jsonRows.length, 15); r++) {
          const row = jsonRows[r];
          if (!row) continue;
          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || '').trim().toLowerCase();
            if (cellVal.includes('nama') || cellVal.includes('siswa') || cellVal.includes('peserta')) {
              nameColIdx = c;
              startRowIdx = r + 1;
              break;
            }
          }
          if (nameColIdx !== -1) break;
        }

        if (nameColIdx === -1) nameColIdx = 1;
        if (startRowIdx === -1) startRowIdx = 4;

        const studentNames = [];
        for (let r = startRowIdx; r < jsonRows.length; r++) {
          const row = jsonRows[r];
          if (!row) continue;
          const name = String(row[nameColIdx] || '').trim();
          if (name && !name.match(/^\d+$/) && !name.toLowerCase().includes('kunci') && !name.toLowerCase().includes('nama')) {
            studentNames.push(name);
          }
        }

        resolve(studentNames);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export full official ASKA template with dynamic N Pilihan Ganda columns & colors
 */
export function exportFullExcelReport(historyList, examData, latestAiText, stateStudents = [], answerKeys = []) {
  const { subject, kkm } = examData;
  const numPg = examData.totalQuestions || (answerKeys ? answerKeys.length : 25);

  const keys = (answerKeys && answerKeys.length >= numPg)
    ? answerKeys.slice(0, numPg)
    : Array(numPg).fill('A');

  const students = (stateStudents && stateStudents.length > 0)
    ? stateStudents
    : (historyList && historyList.length > 0 ? historyList.map(h => h.studentName) : ["Siswa 1"]);

  const rows = [];

  const thinBorder = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } }
  };

  // 1. Header Judul (Rows 1-3, 5)
  rows.push(["ANALISIS ASESMEN SUMATIF KELAS AKHIR (ASKA)"]);
  rows.push(["KELAS VI"]);
  rows.push(["TAHUN PELAJARAN 2025/2026"]);
  rows.push([]);
  rows.push([`MATA PELAJARAN : ${subject}`]);

  // 2. Baris Header Utama (Row 6 - Index 5)
  const headerMain = ["NO", "NAMA PESERTA", "RANK", "VALUE", "TC", "FC"];
  
  // Pilihan Ganda (Dynamic N Columns)
  headerMain.push("Pilihan Ganda");
  for (let i = 1; i < numPg; i++) headerMain.push("");

  // Benar-Salah (5 Columns)
  headerMain.push("Benar-Salah");
  for (let i = 1; i < 5; i++) headerMain.push("");

  // Menjodohkan (5 Columns)
  headerMain.push("Menjodohkan");
  for (let i = 1; i < 5; i++) headerMain.push("");

  // Isian (6 Columns)
  headerMain.push("Isian");
  for (let i = 1; i < 6; i++) headerMain.push("");

  // Uraian (6 Columns)
  headerMain.push("Uraian");
  for (let i = 1; i < 6; i++) headerMain.push("");

  // Rightmost total column
  headerMain.push("");

  rows.push(headerMain);

  // 3. Baris Sub-Header Nomor Soal (Row 7 - Index 6)
  const headerSub = ["", "", "", "", "", ""];
  // Pilihan Ganda 1 to N
  for (let i = 1; i <= numPg; i++) headerSub.push(i);
  // Benar-Salah 1 to 5
  for (let i = 1; i <= 5; i++) headerSub.push(i);
  // Menjodohkan 1 to 5
  for (let i = 1; i <= 5; i++) headerSub.push(i);
  // Isian 1 to 6
  for (let i = 1; i <= 6; i++) headerSub.push(i);
  // Uraian 1 to 6
  for (let i = 1; i <= 6; i++) headerSub.push(i);
  // Rightmost
  headerSub.push("");

  rows.push(headerSub);

  // 4. Baris Kunci Jawaban (Row 8 - Index 7)
  const keyRow = ["", "KUNCI JAWABAN", "", "", "", ""];
  // Kunci Pilihan Ganda N Soal
  for (let i = 0; i < numPg; i++) {
    keyRow.push(keys[i] || "A");
  }
  // Kosongkan bagian Benar-Salah (5), Menjodohkan (5), Isian (6), Uraian (6) + Total (1)
  for (let i = 0; i < 23; i++) {
    keyRow.push("");
  }
  rows.push(keyRow);

  // 5. Baris Data Siswa (Row 9 dst - Index 8+)
  const tuntasList = [];
  const remedialList = [];

  students.forEach((studentName, sIdx) => {
    const historyData = historyList.find(h => h.studentName === studentName);
    const score = historyData ? historyData.score : 0;
    const tc = historyData ? historyData.correctCount : 0;
    const fc = historyData ? historyData.wrongCount : 0;

    if (historyData) {
      if (score >= kkm) {
        tuntasList.push(`${studentName} (Nilai: ${score})`);
      } else {
        remedialList.push(`${studentName} (Nilai: ${score})`);
      }
    }

    const studentRow = [
      sIdx + 1,
      studentName.toUpperCase(),
      0,          // RANK
      score,      // VALUE (Nilai Akhir)
      tc,         // TC (Total Correct)
      fc          // FC (False Count / Salah)
    ];

    // Isi N Jawaban Siswa Pilihan Ganda
    if (historyData && historyData.answers && historyData.answers.length >= numPg) {
      for (let q = 0; q < numPg; q++) {
        studentRow.push(historyData.answers[q].studentAnswer || "");
      }
    } else {
      for (let q = 0; q < numPg; q++) {
        studentRow.push("");
      }
    }

    // Bagian Benar-Salah (5), Menjodohkan (5), Isian (6), Uraian (6) Dikosongkan
    for (let extra = 0; extra < 22; extra++) {
      studentRow.push("");
    }
    // Total column
    studentRow.push(score);

    rows.push(studentRow);
  });

  // 6. Rekomendasi & Tindak Lanjut Diagnostik AI
  rows.push([]);
  rows.push(["REKOMENDASI & PROGRAM TINDAK LANJUT HASIL ASESMEN (DIAGNOSTIK AI LLM)"]);
  rows.push([]);

  const p1 = `1. PROGRAM PENGAYAAN (Siswa Tuntas >= KKM):\n` +
             `Daftar Siswa: ${tuntasList.length > 0 ? tuntasList.join(', ') : 'Tidak ada siswa pada kategori ini.'}\n` +
             `Rekomendasi Tindak Lanjut: Siswa yang telah memenuhi batas KKM (${kkm}) diberikan pengayaan materi tingkat penalaran (HOTS) untuk mengoptimalkan potensi kognitif.`;
  rows.push([p1]);
  rows.push([]);

  const p2 = `2. PROGRAM REMEDIAL & ANALISIS KESALAHAN (Siswa Belum Tuntas < KKM):\n` +
             `Daftar Siswa: ${remedialList.length > 0 ? remedialList.join(', ') : 'Semua siswa telah mencapai KKM.'}\n` +
             `Rekomendasi Tindak Lanjut: Perlu bimbingan terarah dan pembelajaran remedial pada butir soal dan indikator kisi-kisi pilihan ganda yang masih salah sebelum evaluasi ulang.\n` +
             (latestAiText ? `\nCatatan Diagnostik AI:\n${latestAiText}` : '');
  rows.push([p2]);

  // Convert AOA to Worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column Widths
  const colWidths = [
    { wch: 5 },   // NO
    { wch: 28 },  // NAMA PESERTA
    { wch: 6 },   // RANK
    { wch: 8 },   // VALUE
    { wch: 5 },   // TC
    { wch: 5 },   // FC
  ];

  // Dynamic N Pilihan Ganda columns
  for (let i = 0; i < numPg; i++) {
    colWidths.push({ wch: 3.8 });
  }
  // 5 Benar-Salah, 5 Menjodohkan, 6 Isian, 6 Uraian + 1 Total
  for (let i = 0; i < 23; i++) {
    colWidths.push({ wch: 3.8 });
  }

  ws['!cols'] = colWidths;

  // Dynamic Column Indices for Merging & Styling
  const pgStartCol = 6;
  const pgEndCol = pgStartCol + numPg - 1;

  const bsStartCol = pgEndCol + 1;
  const bsEndCol = bsStartCol + 5 - 1;

  const mjStartCol = bsEndCol + 1;
  const mjEndCol = mjStartCol + 5 - 1;

  const isStartCol = mjEndCol + 1;
  const isEndCol = isStartCol + 6 - 1;

  const urStartCol = isEndCol + 1;
  const urEndCol = urStartCol + 6 - 1;

  const totCol = urEndCol + 1;
  const totalCols = totCol + 1;

  // Merges
  ws['!merges'] = [
    // Judul
    { s: { r: 0, c: 0 }, e: { r: 0, c: Math.min(30, totalCols - 1) } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: Math.min(30, totalCols - 1) } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: Math.min(30, totalCols - 1) } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 8 } },

    // Header Groups
    { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },  // NO
    { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },  // NAMA PESERTA
    { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } },  // RANK
    { s: { r: 5, c: 3 }, e: { r: 6, c: 3 } },  // VALUE
    { s: { r: 5, c: 4 }, e: { r: 6, c: 4 } },  // TC
    { s: { r: 5, c: 5 }, e: { r: 6, c: 5 } },  // FC

    // Section Spans (Row 6)
    { s: { r: 5, c: pgStartCol }, e: { r: 5, c: pgEndCol } },  // Pilihan Ganda (N)
    { s: { r: 5, c: bsStartCol }, e: { r: 5, c: bsEndCol } },  // Benar-Salah (5)
    { s: { r: 5, c: mjStartCol }, e: { r: 5, c: mjEndCol } },  // Menjodohkan (5)
    { s: { r: 5, c: isStartCol }, e: { r: 5, c: isEndCol } },  // Isian (6)
    { s: { r: 5, c: urStartCol }, e: { r: 5, c: urEndCol } },  // Uraian (6)
    { s: { r: 5, c: totCol }, e: { r: 6, c: totCol } },        // Total
  ];

  // Colors
  const C_YELLOW_BRIGHT = "FFFF00";
  const C_YELLOW_LIGHT  = "FFF59D";
  const C_GREEN_LIGHT   = "A9DFBF";
  const C_PURPLE_LIGHT  = "E1BEE7";
  const C_PEACH_LIGHT   = "FFCCBC";
  const C_AMBER_LIGHT   = "FFE082";
  const C_CYAN_SUB      = "B2EBF2";
  const C_KEY_BG        = "E0F7FA";

  const startDataRow = 8;
  const endDataRow = startDataRow + students.length - 1;

  for (let R = 0; R < rows.length; R++) {
    for (let C = 0; C < totalCols; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) {
        if (R >= 5 && R <= endDataRow) {
          ws[cellRef] = { t: "s", v: "" };
        } else {
          continue;
        }
      }

      const cell = ws[cellRef];
      if (!cell.s) cell.s = {};

      // 1. Title Rows (R: 0, 1, 2)
      if (R <= 2 && C === 0) {
        cell.s = {
          font: { bold: true, sz: 12, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // 2. Subject Row (R: 4)
      if (R === 4 && C === 0) {
        cell.s = {
          font: { bold: true, sz: 11, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: "left", vertical: "center" }
        };
      }

      // 3. Header Row (R: 5)
      if (R === 5) {
        let bg = C_YELLOW_BRIGHT;
        if (C >= 2 && C <= 5) bg = C_YELLOW_LIGHT;
        else if (C >= pgStartCol && C <= pgEndCol) bg = C_YELLOW_BRIGHT; // Pilihan Ganda
        else if (C >= bsStartCol && C <= bsEndCol) bg = C_GREEN_LIGHT;  // Benar-Salah
        else if (C >= mjStartCol && C <= mjEndCol) bg = C_PURPLE_LIGHT; // Menjodohkan
        else if (C >= isStartCol && C <= isEndCol) bg = C_PEACH_LIGHT;  // Isian
        else if (C >= urStartCol && C <= urEndCol) bg = C_AMBER_LIGHT;  // Uraian
        else if (C === totCol) bg = C_GREEN_LIGHT;

        cell.s = {
          fill: { fgColor: { rgb: bg } },
          font: { bold: true, sz: 10, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: thinBorder
        };
      }

      // 4. Subheader Row Numbers (R: 6)
      if (R === 6) {
        let bg = C_YELLOW_BRIGHT;
        if (C >= 2 && C <= 5) bg = C_YELLOW_LIGHT;
        else if (C >= pgStartCol && C <= pgEndCol) bg = C_CYAN_SUB;      // Numbers 1 to N
        else if (C >= bsStartCol && C <= bsEndCol) bg = C_GREEN_LIGHT;
        else if (C >= mjStartCol && C <= mjEndCol) bg = C_PURPLE_LIGHT;
        else if (C >= isStartCol && C <= isEndCol) bg = C_PEACH_LIGHT;
        else if (C >= urStartCol && C <= urEndCol) bg = C_AMBER_LIGHT;
        else if (C === totCol) bg = C_GREEN_LIGHT;

        cell.s = {
          fill: { fgColor: { rgb: bg } },
          font: { bold: true, sz: 9, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: thinBorder
        };
      }

      // 5. Kunci Jawaban Row (R: 7)
      if (R === 7) {
        let bg = (C >= pgStartCol && C <= pgEndCol) ? C_KEY_BG : "F5F5F5";
        cell.s = {
          fill: { fgColor: { rgb: bg } },
          font: { bold: true, sz: 9, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: thinBorder
        };
      }

      // 6. Data Rows (R: 8 to endDataRow)
      if (R >= 8 && R <= endDataRow) {
        let align = "center";
        let isBold = false;
        let bg = "FFFFFF";

        if (C === 1) align = "left";
        if (C === 3) {
          bg = C_YELLOW_LIGHT;
          isBold = true;
        }
        if (C === totCol) bg = "F5F5F5";

        cell.s = {
          fill: { fgColor: { rgb: bg } },
          font: { bold: isBold, sz: 9, name: "Calibri", color: { rgb: "000000" } },
          alignment: { horizontal: align, vertical: "center" },
          border: thinBorder
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Analisis ASKA");

  const cleanSub = subject.replace(/[\s\/\\:\*\?"<>\|]+/g, '_');
  const fileName = `Analisis_ASKA_${cleanSub}_${numPg}Soal_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
