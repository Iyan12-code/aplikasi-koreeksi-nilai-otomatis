/**
 * =========================================================
 * EXCEL PARSER & EXPORTER (SheetJS)
 * SmartEval Excel Integration Module
 * =========================================================
 */

/**
 * Parse Student Names from Uploaded Excel File
 * @param {File} file 
 * @returns {Promise<Array<string>>}
 */
async function parseStudentsFromExcel(file) {
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

                // Scan rows for column header "nama"
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

                // Default fallback to Column B (index 1) and Row 5 if not found
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
 * Export Full Excel Report with 2 AI Paragraphs (Pengayaan & Remedial)
 */
function exportFullExcelReport(historyList, examData, latestAiText) {
    if (!historyList || historyList.length === 0) {
        alert("Belum ada riwayat koreksi yang tersimpan untuk diekspor!");
        return;
    }

    const { subject, kkm } = examData;

    // 1. Create Worksheet Data Table
    const data = [];
    data.push([`LAPORAN HASIL EVALUASI & KOREKSI LJK SISWA`]);
    data.push([`Mata Pelajaran: ${subject}`, ``, `Batas KKM: ${kkm}`, ``, `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`]);
    data.push([]); // Empty row

    // Table Header
    data.push([
        "No",
        "Nama Siswa",
        "Mata Pelajaran",
        "Jumlah Benar",
        "Jumlah Salah",
        "Nilai Akhir",
        "Status KKM",
        "Waktu Koreksi"
    ]);

    let tuntasList = [];
    let remedialList = [];

    // Table Rows
    historyList.forEach((item, index) => {
        const isTuntas = item.score >= kkm;
        if (isTuntas) {
            tuntasList.push(`${item.studentName} (Nilai: ${item.score})`);
        } else {
            remedialList.push(`${item.studentName} (Nilai: ${item.score})`);
        }

        data.push([
            index + 1,
            item.studentName,
            subject,
            item.correctCount,
            item.wrongCount,
            item.score,
            isTuntas ? "TUNTAS" : "REMEDIAL",
            item.date || new Date().toLocaleTimeString('id-ID')
        ]);
    });

    data.push([]);
    data.push([`REKOMENDASI & TINDAK LANJUT HASIL KOREKSI (ANALISIS DIAGNOSTIK AI)`]);
    data.push([]);

    // 2. Add Paragraph 1 (Pengayaan)
    const p1 = `1. PROGRAM PENGAYAAN (Siswa Tuntas >= KKM):\n` +
               `Daftar Siswa: ${tuntasList.length > 0 ? tuntasList.join(', ') : 'Tidak ada siswa pada kategori ini.'}\n` +
               `Rekomendasi Tindak Lanjut: Siswa yang telah mencapai KKM diberikan materi pendalaman dan latihan soal tingkat penalaran/HOTS untuk memperluas wawasan kognitif.`;
    data.push([p1]);
    data.push([]);

    // 3. Add Paragraph 2 (Remedial)
    const p2 = `2. PROGRAM REMEDIAL & ANALISIS KESALAHAN (Siswa Belum Tuntas < KKM):\n` +
               `Daftar Siswa: ${remedialList.length > 0 ? remedialList.join(', ') : 'Semua siswa telah mencapai KKM.'}\n` +
               `Rekomendasi Tindak Lanjut: Perlu pendampingan khusus dan pembelajaran ulang pada butir soal dan indikator kisi-kisi yang belum dikuasai sebelum dilakukan tes ulang.\n` +
               (latestAiText ? `\nCatatan Diagnostik AI:\n${latestAiText}` : '');
    data.push([p2]);

    // Create Workbook
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set Column Widths
    ws['!cols'] = [
        { wch: 6 },
        { wch: 25 },
        { wch: 22 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 15 },
        { wch: 18 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Koreksi");

    const cleanSub = subject.replace(/\s+/g, '_');
    const fileName = `Laporan_Koreksi_${cleanSub}_${Date.now()}.xlsx`;

    XLSX.writeFile(wb, fileName);
}
