/**
 * =========================================================
 * GROQ AI LLAMA 3.3 INTEGRATION & DIAGNOSTIC PROMPT BUILDER
 * SmartEval Diagnostic AI Engine
 * =========================================================
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Get Saved Groq API Key
 */
function getGroqApiKey() {
    return localStorage.getItem("groq_api_key") || "";
}

/**
 * Save Groq API Key
 */
function setGroqApiKey(key) {
    localStorage.setItem("groq_api_key", key.trim());
}

/**
 * Build Deep Topic-Specific Diagnostic Prompt
 */
function buildDiagnosticPrompt(examData, studentName, omrResult, materialBlocks) {
    const { subject, kkm } = examData;
    const { score, correctCount, wrongCount, detectedAnswers } = omrResult;

    let sb = [];
    sb.push("ANDA ADALAH KONSULTAN & GURU AHLI PENDIDIKAN PROFESIONAL.");
    sb.push("Lakukan analisis diagnostik mendalam hasil belajar siswa berdasarkan data resmi ujian berikut:\n");

    sb.push("====================================================");
    sb.push("IDENTITAS SISWA & HASIL UJIAN");
    sb.push("====================================================");
    sb.push(`Mata Pelajaran  : ${subject}`);
    sb.push(`Nama Siswa      : ${studentName}`);
    sb.push(`Nilai Akhir     : ${score} / 100`);
    sb.push(`Batas KKM       : ${kkm}`);
    sb.push(`Jumlah Benar    : ${correctCount}`);
    sb.push(`Jumlah Salah    : ${wrongCount}`);
    sb.push(`Status Kelulusan: ${score >= kkm ? "TUNTAS (>= KKM)" : "BELUM TUNTAS / REMEDIAL (< KKM)"}\n`);

    sb.push("====================================================");
    sb.push("PEMETAAN MATERI KISI-KISI RESMI (5 BLOK SOAL)");
    sb.push("====================================================");
    sb.push(`- Soal 01 - 05: ${materialBlocks[0] || "Aljabar & Operasi Hitung"}`);
    sb.push(`- Soal 06 - 10: ${materialBlocks[1] || "Pecahan & Desimal"}`);
    sb.push(`- Soal 11 - 15: ${materialBlocks[2] || "Geometri & Bangun Datar"}`);
    sb.push(`- Soal 16 - 20: ${materialBlocks[3] || "Statistika & Pengolahan Data"}`);
    sb.push(`- Soal 21 - 25: ${materialBlocks[4] || "Pengukuran & Satuan"}\n`);

    sb.push("====================================================");
    sb.push("RINCIAN JAWABAN SISWA PER BUTIR SOAL");
    sb.push("====================================================");

    let wrongQuestions = [];
    detectedAnswers.forEach(item => {
        let blockIdx = Math.floor((item.questionNumber - 1) / 5);
        let matName = materialBlocks[blockIdx] || `Materi Blok ${blockIdx + 1}`;
        
        sb.push(`Soal ${item.questionNumber.toString().padStart(2, '0')} | Materi: ${matName} | Jawaban Siswa: ${item.studentAnswer} | Kunci: ${item.correctAnswer} | Status: ${item.isCorrect ? "BENAR" : "SALAH"}`);
        
        if (!item.isCorrect) {
            wrongQuestions.push({
                number: item.questionNumber,
                material: matName,
                studentAns: item.studentAnswer,
                correctAns: item.correctAnswer
            });
        }
    });

    sb.push("\n");
    if (score < kkm) {
        sb.push(`TUGAS UTAMA: Nilai siswa (${score}) berada DI BAWAH KKM (${kkm}). Buat DIAGNOSTIK KESALAHAN MATERI dan RANCANGAN PROGRAM REMEDIAL.`);
    } else {
        sb.push(`TUGAS UTAMA: Nilai siswa (${score}) telah MEMENUHI KKM (${kkm}). Buat ANALISIS PENGUASAAN MATERI dan RANCANGAN PROGRAM PENGAYAAN.`);
    }

    sb.push("\nOUTPUT WAJIB MENGGUNAKAN FORMAT STRUKTUR BERIKUT SECARA DETAIL:\n");
    sb.push("# HASIL DIAGNOSTIK DAN ANALISIS KESALAHAN BELAJAR SISWA\n");
    sb.push("### 1. Kesimpulan Penguasaan Materi");
    sb.push(`- Jelaskan capaian nilai siswa (${score}) terhadap KKM (${kkm}) serta evaluasi kesiapan belajarnya secara ringkas (1 paragraf).\n`);

    sb.push("### 2. Analisis Kesalahan Berdasarkan Kisi-kisi & Indikator Soal");
    sb.push("- Untuk setiap materi kisi-kisi yang memiliki soal salah (misal: Aljabar, Geometri, dll.):");
    sb.push("  * Sebutkan Nama Materi & Nomor Soal yang Salah.");
    sb.push("  * Bedah letak kesalahan konseptual atau miskonsepsi siswa pada nomor soal tersebut berdasarkan indikator kisi-kisi.");
    sb.push("- Untuk materi yang seluruh soalnya benar, sebutkan sebagai kekuatan/materi yang telah dikuasai dengan tuntas.\n");

    sb.push("### 3. Rekomendasi Spesifik Berdasarkan Materi & Analisis Kesalahan");
    sb.push("- Berikan saran konkret per materi yang belum dikuasai (contoh format: 'Rekomendasi pada materi [Nama Materi]: Siswa agar dapat [saran langkah belajar/latihan terarah]...').\n");

    sb.push("### 4. Rekomendasi Strategi Pembelajaran Untuk Guru di Kelas");
    sb.push("- Berikan saran metode pengajaran aktif (misal: pendekatan kontekstual, scaffolding 3 level, media alat peraga visual) yang dapat diterapkan guru di kelas untuk mengatasi kelemahan siswa pada indikator tersebut.\n");

    sb.push("### 5. Rekomendasi Belajar Mandiri Untuk Siswa");
    sb.push("- Berikan 2-3 langkah praktis belajar di rumah yang mudah dipahami siswa.\n");

    if (score < kkm) {
        sb.push("### 6. Program Tindak Lanjut: Remedial");
        sb.push("- Rancang aktivitas remedial khusus yang fokus pada materi dan butir soal yang belum tuntas.\n");
    } else {
        sb.push("### 6. Program Tindak Lanjut: Pengayaan");
        sb.push("- Rancang aktivitas pengayaan materi lanjutan atau pemecahan soal tipe HOTS bagi siswa yang sudah tuntas.\n");
    }

    sb.push("ATURAN PENULISAN:");
    sb.push("- Gunakan bahasa Indonesia formal, mendalam, dan kaya wawasan pendidikan.");
    sb.push("- WAJIB menyebutkan nama materi dari dokumen kisi-kisi secara eksplisit pada poin 2 dan 3.");

    return sb.join("\n");
}

/**
 * Call Groq Cloud API for Inference
 */
async function callGroqAi(prompt) {
    const apiKey = getGroqApiKey();
    if (!apiKey) {
        throw new Error("Groq API Key belum diatur! Silakan klik tombol 'API Key Groq' di pojok kanan atas.");
    }

    const payload = {
        model: DEFAULT_MODEL,
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.6,
        max_tokens: 2500
    };

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
