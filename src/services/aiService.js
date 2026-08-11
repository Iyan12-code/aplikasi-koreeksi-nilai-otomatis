/**
 * =========================================================
 * AI DIAGNOSTIC ENGINE (Groq LLaMA 3.3 Versatile)
 * SmartEval AI Service - Dynamic Question Count
 * =========================================================
 */

export function buildDiagnosticPrompt(exam, studentName, omrResult, questionMaterials) {
  const { subject, kkm, totalQuestions = 25 } = exam;
  const { score, correctCount, wrongCount, detectedAnswers } = omrResult;

  const wrongQuestions = [];
  const correctQuestions = [];

  const effectiveTotal = Math.min(totalQuestions, detectedAnswers ? detectedAnswers.length : totalQuestions);

  if (detectedAnswers) {
    for (let i = 0; i < effectiveTotal; i++) {
      const a = detectedAnswers[i];
      const mat = (questionMaterials && questionMaterials[i]) ? questionMaterials[i] : `Indikator Soal ${i + 1}`;
      if (a.isCorrect) {
        correctQuestions.push(`Soal ${a.questionNumber} (Materi: ${mat})`);
      } else {
        wrongQuestions.push(`Soal ${a.questionNumber} [Kunci: ${a.correctAnswer}, Jawaban Siswa: ${a.studentAnswer}] -> Indikator Materi: ${mat}`);
      }
    }
  }

  return `
Anda adalah seorang Dosen dan Pakar Evaluasi Pembelajaran Kurikulum Nasional. Berikan analisis diagnostik profesional, objektif, berbasis data, dan terstruktur untuk siswa berikut:

--- DATA ASESMEN SISWA ---
* Nama Siswa: ${studentName}
* Mata Pelajaran: ${subject}
* Total Soal Pilihan Ganda: ${effectiveTotal} Butir Soal
* Nilai Akhir: ${score} / 100 (KKM: ${kkm}) -> Status: ${score >= kkm ? 'TUNTAS' : 'BELUM TUNTAS / REMEDIAL'}
* Jawaban Benar: ${correctCount} butir
* Jawaban Salah: ${wrongCount} butir
* Rincian Butir Soal Salah beserta Indikator Kisi-kisinya:
${wrongQuestions.length > 0 ? wrongQuestions.map(w => '  - ' + w).join('\n') : '  - Tidak ada kesalahan (Sempurna)'}

--- PETUNJUK PENYUSUNAN LAPORAN (6 STRUKTUR BAKU) ---
Tulis laporan dalam format Markdown yang rapi dengan heading yang jelas:

### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Bandingkan capaian skor (${score}) terhadap KKM (${kkm}) secara ringkas dan lugas.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
Bedah secara spesifik nomor-nomor soal yang dijawab salah oleh siswa di atas beserta nama indikator pembelajarannya. Analisis kemungkinan miskonsepsi atau kelemahan konsep spesifik yang dialami siswa.

### 3. Rekomendasi Spesifik Berdasarkan Indikator Materi
Uraikan langkah perbaikan materi yang harus difokuskan oleh siswa pada topik-topik yang belum dikuasai.

### 4. Rekomendasi Strategi Pembelajaran Untuk Guru di Kelas
Berikan masukan pedagogik konkret bagi guru dalam membimbing siswa tersebut di kelas (misal: scaffolding, media visual, latihan bertingkat).

### 5. Rekomendasi Belajar Mandiri Untuk Siswa
Saran latihan terarah, manajemen waktu pengerjaan soal, dan metode belajar efektif di rumah.

### 6. Program Tindak Lanjut: ${score >= kkm ? 'PENGAYAAN' : 'REMEDIAL'}
Rencana aksi konkret: ${score >= kkm ? 'Bentuk soal HOTS atau proyek penalaran lanjutan.' : 'Mekanisme bimbingan remedial dan asesmen ulang pada indikator yang salah.'}

Gunakan Bahasa Indonesia baku, akademik, solutif, dan hindari generalisasi klise.
`.trim();
}

export async function callGroqAi(prompt, apiKey) {
  if (!apiKey || apiKey === 'gsk_placeholder_replace_with_real_key' || apiKey.trim().length < 10) {
    throw new Error("Groq API Key belum diatur.");
  }

  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Anda adalah Pakar Asesmen Pendidikan dan Dosen Evaluasi Pembelajaran yang menyusun laporan diagnostik berbasis data butir soal dan indikator kisi-kisi."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2048,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: Gagal menghubungi API Groq.`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "Tidak ada respon teks dari AI.";
}

export function generateLocalDiagnosticFallback(studentName, exam, omrResult, questionMaterials) {
  const { subject, kkm, totalQuestions = 25 } = exam;
  const { score, correctCount, wrongCount, detectedAnswers } = omrResult;
  const isTuntas = score >= kkm;

  const wrongList = [];
  const effectiveTotal = Math.min(totalQuestions, detectedAnswers ? detectedAnswers.length : totalQuestions);

  if (detectedAnswers) {
    for (let i = 0; i < effectiveTotal; i++) {
      const a = detectedAnswers[i];
      if (!a.isCorrect) {
        const mat = (questionMaterials && questionMaterials[i]) ? questionMaterials[i] : `Materi Soal ${i + 1}`;
        wrongList.push(`**Soal No. ${a.questionNumber}** (*Indikator: ${mat}*) - Jawaban Siswa: \`${a.studentAnswer}\`, Kunci: \`${a.correctAnswer}\``);
      }
    }
  }

  return `
### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Berdasarkan hasil koreksi lembar jawaban ${subject}, ananda **${studentName}** memperoleh nilai akhir **${score}/100** dengan menjawab benar **${correctCount}** dari **${effectiveTotal}** butir soal pilihan ganda. Dengan standar KKM **${kkm}**, siswa dinyatakan **${isTuntas ? 'TELAH TUNTAS' : 'BELUM TUNTAS / MEMERLUKAN REMEDIAL'}**.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
${wrongList.length > 0 ? `Terdapat ${wrongList.length} butir soal yang dijawab belum tepat:\n` + wrongList.map(w => `- ${w}`).join('\n') + `\n\nHal ini mengindikasikan siswa masih mengalami keraguan atau miskonsepsi prosedural pada indikator materi tersebut.` : `Siswa berhasil menjawab seluruh butir soal dengan tepat tanpa kesalahan (Skor Sempurna 100).`}

### 3. Rekomendasi Spesifik Berdasarkan Indikator Materi
${wrongList.length > 0 ? `Fokuskan penguatan konsep pada topik-topik di atas melalui pembedahan contoh soal bertahap sebelum melanjutkan ke materi berikutnya.` : `Pertahankan penguasaan konsep dengan memberikan variasi soal terapan.`}

### 4. Rekomendasi Strategi Pembelajaran Untuk Guru di Kelas
- **Scaffolding**: Berikan umpan balik langsung pada indikator yang belum dikuasai siswa.
- **Diferensiasi Pembelajaran**: Berikan pendampingan kelompok kecil untuk menuntaskan materi prasyarat.

### 5. Rekomendasi Belajar Mandiri Untuk Siswa
- Meninjau kembali langkah pengerjaan pada nomor soal yang keliru.
- Mengulang latihan mandiri dengan tingkat kesulitan bertahap.

### 6. Program Tindak Lanjut: ${isTuntas ? 'PENGAYAAN' : 'REMEDIAL'}
${isTuntas ? `Siswa diberikan materi pengayaan berupa soal-soal penalaran tingkat tinggi (HOTS).` : `Siswa dijadwalkan mengikuti sesi remedial terarah pada butir soal indikator yang salah, dilanjutkan dengan tes konfirmasi.`}
`.trim();
}
