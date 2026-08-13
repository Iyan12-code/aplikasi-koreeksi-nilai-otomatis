/**
 * =========================================================
 * AI DIAGNOSTIC ENGINE (Groq LLaMA 3.3 Versatile & Dynamic Engine)
 * SmartEval AI Service - Indicator-Specific Pedagogical Analysis
 * =========================================================
 */

export function buildDiagnosticPrompt(exam, studentName, omrResult, questionMaterials = [], questionIndicators = [], questionKDs = [], questionLevels = []) {
  const { subject, kkm, totalQuestions = 25 } = exam;
  const { score, correctCount, wrongCount, detectedAnswers } = omrResult;

  const wrongQuestions = [];
  const correctQuestions = [];

  const effectiveTotal = Math.min(totalQuestions, detectedAnswers ? detectedAnswers.length : totalQuestions);

  if (detectedAnswers) {
    for (let i = 0; i < effectiveTotal; i++) {
      const a = detectedAnswers[i];
      const mat = (questionMaterials && questionMaterials[i]) ? questionMaterials[i] : `Materi Soal ${i + 1}`;
      const ind = (questionIndicators && questionIndicators[i]) ? questionIndicators[i] : mat;
      const kd = (questionKDs && questionKDs[i]) ? questionKDs[i] : '';
      const lvl = (questionLevels && questionLevels[i]) ? questionLevels[i] : 'L1';

      if (a.isCorrect) {
        correctQuestions.push(`Soal ${a.questionNumber} (Materi/TP: ${mat})`);
      } else {
        wrongQuestions.push(
          `* [SOAL NO. ${a.questionNumber}] (Pilihan Siswa: '${a.studentAnswer}', Kunci: '${a.correctAnswer}')` +
          `\n    - TP / Kompetensi Dasar: ${kd || '-'}` +
          `\n    - Materi Pokok: ${mat}` +
          `\n    - Level Kognitif: ${lvl}` +
          `\n    - Indikator Soal: "${ind}"`
        );
      }
    }
  }

  return `
Anda adalah seorang Dosen dan Pakar Evaluasi Asesmen Pendidikan Nasional. Tugas Anda adalah menyusun Laporan Diagnostik Pembelajaran yang SANGAT MENDALAM, SPESIFIK, dan BUKAN TEMPLATE UMUM untuk siswa berikut berdasarkan dokumen kisi-kisi dan kesalahan jawaban aktualnya:

=== DATA PENILAIAN SISWA ===
- Nama Siswa: ${studentName}
- Mata Pelajaran: ${subject}
- Nilai Akhir: ${score} / 100 (Standar KKM: ${kkm}) -> Status: ${score >= kkm ? 'TUNTAS' : 'BELUM TUNTAS / PERLU REMEDIAL'}
- Capaian: ${correctCount} Benar, ${wrongCount} Salah (dari total ${effectiveTotal} butir soal pilihan ganda)

=== RINCIAN BUTIR SOAL YANG SALAH BESERTA INDIKATORNYA ===
${wrongQuestions.length > 0 ? wrongQuestions.join('\n\n') : 'Siswa menjawab seluruh soal dengan benar (100% Sempurna).'}

=== INSTRUKSI KHUSUS PENYUSUNAN LAPORAN (6 STRUKTUR HARUS SPESIFIK) ===
Tulis laporan dalam format Markdown dengan 6 heading berikut. PENTING: Bagian 2, 3, 4, 5, dan 6 WAJIB mengupas secara mendalam SETIAP BUTIR SOAL/INDIKATOR yang dijawab salah oleh ${studentName} di atas:

### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Ulas pencapaian skor (${score}) terhadap KKM (${kkm}). Identifikasi persentase penguasaan kompetensi siswa secara keseluruhan.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
Untuk setiap butir soal yang salah (sebutkan nomor soal, materi, level kognitif L1/L2/L3, dan indikatornya):
- Analisis secara kritis letak miskonsepsi atau kelemahan nalar siswa yang menyebabkan ia memilih opsi yang keliru.

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
Bedah setiap indikator materi yang belum dikuasai siswa di atas:
- Jelaskan konsep inti apa yang harus diulang pemahamannya oleh ${studentName}.
- Berikan contoh konkret atau analogi materi agar siswa dapat memahami letak kekeliruannya.

### 4. Rekomendasi Metode Pembelajaran Khusus Guru di Kelas
Berikan rekomendasi metode pengajaran pedagogik yang spesifik dirancang untuk mengatasi kesalahan indikator tersebut (Contoh: jika salah pada materi rotasi/gerhana -> rekomendasikan Metode Demonstrasi Model 3D/Visual; jika salah pada energi/lingkungan -> rekomendasikan Problem-Based Learning (PBL) berbasis studi kasus; jika salah pada klasifikasi/tata surya -> rekomendasikan Concept Mapping & Inkuiri Terbimbing). Jelaskan bagaimana guru menerapkan metode tersebut di kelas untuk membantu ${studentName}.

### 5. Panduan Latihan & Belajar Mandiri Siswa di Rumah
Rancang 2-3 langkah latihan mandiri yang terarah langsung pada indikator yang salah tersebut (misalnya: penugasan pembuatan mind map, latihan 3 soal analog terstruktur, atau observasi mandiri).

### 6. Program Tindak Lanjut: ${score >= kkm ? 'PENGAYAAN' : 'REMEDIAL TERFOKUS'}
${score >= kkm 
  ? 'Rancang program pengayaan dengan soal-soal penalaran tingkat tinggi (HOTS) atau mini-riset yang memperluas kompetensi siswa.'
  : 'Rancang jadwal dan modul remedial klinis yang hanya menguji ulang indikator-indikator yang salah di atas beserta bentuk tes konfirmasi ulang (re-test).'}

Gunakan Bahasa Indonesia baku, akademik, solutif, empatik, dan bebas dari kalimat klise yang bersifat umum.
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
          content: "Anda adalah Pakar Asesmen Pendidikan dan Dosen Evaluasi Pembelajaran Kurikulum Nasional. Anda menyusun laporan diagnostik yang sangat mendalam, personal, dan mengaitkan rekomendasi metode guru dengan letak kesalahan indikator siswa."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2500,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: Gagal menghubungi API Groq.`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "Tidak ada respon teks dari AI.";
}

/**
 * Pembangkit Diagnostik Berbasis Data Riil (Fallback Cerdas Berbasis Indikator Soal)
 */
export function generateLocalDiagnosticFallback(studentName, exam, omrResult, questionMaterials = [], questionIndicators = [], questionKDs = [], questionLevels = []) {
  const { subject, kkm, totalQuestions = 25 } = exam;
  const { score, correctCount, wrongCount, detectedAnswers } = omrResult;
  const isTuntas = score >= kkm;

  const wrongItems = [];
  const effectiveTotal = Math.min(totalQuestions, detectedAnswers ? detectedAnswers.length : totalQuestions);

  if (detectedAnswers) {
    for (let i = 0; i < effectiveTotal; i++) {
      const a = detectedAnswers[i];
      if (!a.isCorrect) {
        const mat = (questionMaterials && questionMaterials[i]) ? questionMaterials[i] : `Materi Soal ${i + 1}`;
        const ind = (questionIndicators && questionIndicators[i]) ? questionIndicators[i] : mat;
        const kd = (questionKDs && questionKDs[i]) ? questionKDs[i] : '';
        const lvl = (questionLevels && questionLevels[i]) ? questionLevels[i] : 'L1';
        wrongItems.push({
          num: a.questionNumber,
          studentAns: a.studentAnswer,
          correctAns: a.correctAnswer,
          materi: mat,
          indikator: ind,
          kd: kd,
          level: lvl
        });
      }
    }
  }

  return `
### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Berdasarkan hasil asesmen mata pelajaran **${subject}**, ananda **${studentName}** memperoleh skor akhir **${score} / 100** dengan menjawab benar **${correctCount}** butir dan salah **${wrongCount}** butir dari total **${effectiveTotal}** butir soal. Dengan KKM yang ditetapkan sebesar **${kkm}**, capaian siswa dinyatakan **${isTuntas ? 'TELAH MENCAPAI KETUNTASAN (TUNTAS)' : 'BELUM MENCAPAI KETUNTASAN (MEMERLUKAN PROGRAM REMEDIAL)'}**.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
${wrongItems.length > 0 ? `Berdasarkan pemetaan dokumen kisi-kisi, letak kelemahan konseptual ananda **${studentName}** teridentifikasi pada butir soal berikut:\n` + wrongItems.map(item => `
* **Soal No. ${item.num}** (Level Kognitif: \`${item.level}\`)
  - **Materi / TP**: ${item.materi} ${item.kd ? `(${item.kd})` : ''}
  - **Indikator**: *"${item.indikator}"*
  - **Letak Kesalahan**: Siswa memilih opsi **\`${item.studentAns}\`** padahal kunci jawaban yang benar adalah **\`${item.correctAns}\`**. Hal ini mengindikasikan adanya miskonsepsi dalam memahami prinsip dasar pada indikator tersebut.
`).join('\n') : `Siswa berhasil menguasai seluruh indikator soal dengan sempurna (Tingkat akurasi 100%).`}

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
${wrongItems.length > 0 ? `Untuk mengatasi kelemahan spesifik di atas, langkah perbaikan materi difokuskan pada:\n` + wrongItems.map(item => `
* **Penguatan Materi Soal No. ${item.num} (${item.materi})**:
  - Siswa perlu menelaah kembali konsep inti mengenai *"${item.indikator}"*. Fokuskan pada pembedaan kata kunci dan analisis karakteristik objek yang diujikan agar siswa tidak terkecoh oleh opsi distraktor.
`).join('\n') : `Pertahankan penguasaan materi dengan terus melatih variasi soal penalaran lanjutan.`}

### 4. Rekomendasi Metode Pembelajaran Khusus Guru di Kelas
${wrongItems.length > 0 ? `Guru disarankan menerapkan strategi pembelajaran diferensiasi dengan metode pedagogik berikut untuk membimbing **${studentName}**:\n` + wrongItems.map(item => {
  let metodeSaran = "Metode Scaffolding dan Diskusi Terbimbing";
  if (item.materi.toLowerCase().includes('rotasi') || item.materi.toLowerCase().includes('gerhana') || item.materi.toLowerCase().includes('planet') || item.materi.toLowerCase().includes('tata surya') || item.materi.toLowerCase().includes('geografis') || item.materi.toLowerCase().includes('peta')) {
    metodeSaran = "**Metode Demonstrasi Visual & Model Konkret 3D** (menggunakan alat peraga/simulasi digital interaktif agar siswa melihat langsung fenomena spasial)";
  } else if (item.materi.toLowerCase().includes('energi') || item.materi.toLowerCase().includes('lingkungan') || item.materi.toLowerCase().includes('ekonomi') || item.materi.toLowerCase().includes('penebangan')) {
    metodeSaran = "**Metode Problem-Based Learning (PBL) Berbasis Studi Kasus** (memberikan lembar kerja bergambar mengenai sebab-akibat dampak lingkungan/perubahan energi)";
  } else if (item.materi.toLowerCase().includes('sejarah') || item.materi.toLowerCase().includes('tokoh') || item.materi.toLowerCase().includes('asean') || item.materi.toLowerCase().includes('proklamasi')) {
    metodeSaran = "**Metode Concept Mapping & Garis Waktu Kronologis** (membantu siswa mengasosiasikan nama tokoh, peran, dan peristiwa sejarah dalam bagan visual terstruktur)";
  } else {
    metodeSaran = "**Metode Inkuiri Terbimbing & Latihan Bertingkat** (membedah contoh soal dari tingkat konkret ke analitis)";
  }
  return `* **Untuk Mengatasi Soal No. ${item.num} (${item.materi})**:\n  - Terapkan ${metodeSaran} dalam sesi pendampingan kelompok kecil di kelas.`;
}).join('\n') : `* Guru dapat menunjuk siswa sebagai tutor sebaya (*peer tutor*) untuk membantu teman sekelas.`}

### 5. Panduan Latihan & Belajar Mandiri Siswa di Rumah
${wrongItems.length > 0 ? `Rekomendasi penugasan terarah yang dapat dikerjakan ananda **${studentName}** secara mandiri:\n` + wrongItems.map(item => `
1. Membuat ringkasan satu lembar (*mind-map*) mengenai materi **${item.materi}** dengan mencantumkan poin-poin utama dari indikator *"${item.indikator}"*.
2. Mengerjakan 2–3 soal latihan sejenis (soal analog) untuk menguji pemahaman baru pada topik tersebut.
`).join('') : `1. Mempelajari materi pada bab berikutnya secara mandiri dan membuat rangkuman pengayaan.`}

### 6. Program Tindak Lanjut: ${isTuntas ? 'PENGAYAAN' : 'REMEDIAL TERSTRUKTUR'}
${isTuntas ? `
* **Program Pengayaan**: Diberikan penugasan berbasis penalaran tingkat tinggi (HOTS) pada kompetensi **${subject}** untuk memperluas wawasan konseptual siswa.
` : `
* **Bimbingan Remedial Klinis**: Guru menjadwalkan sesi bimbingan khusus berdurasi 30 menit yang hanya membedah ${wrongItems.length} indikator materi yang keliru di atas.
* **Asesmen Ulang Konfirmasi (*Re-Test*)**: Diberikan 5 butir soal baru dengan indikator yang setara untuk memastikan tuntasnya Kompetensi Pembelajaran sebelum berpindah ke unit pelajaran berikutnya.
`}
`.trim();
}
