/**
 * =========================================================
 * AI DIAGNOSTIC ENGINE (Groq LLaMA 3.3 Versatile & Dynamic Engine)
 * SmartEval AI Service - Indicator & Level-Specific Pedagogical Analysis
 * =========================================================
 */

export function buildDiagnosticPrompt(exam, studentName, omrResult, questionMaterials = [], questionIndicators = [], questionKDs = [], questionLevels = []) {
  const { subject, kkm, totalQuestions = 25 } = exam;
  const { score, correctCount, wrongCount, detectedAnswers } = omrResult;

  const wrongQuestions = [];
  const effectiveTotal = Math.min(totalQuestions, detectedAnswers ? detectedAnswers.length : totalQuestions);

  if (detectedAnswers) {
    for (let i = 0; i < effectiveTotal; i++) {
      const a = detectedAnswers[i];
      const mat = (questionMaterials && questionMaterials[i]) ? questionMaterials[i] : `Materi Soal ${i + 1}`;
      const ind = (questionIndicators && questionIndicators[i]) ? questionIndicators[i] : mat;
      const kd = (questionKDs && questionKDs[i]) ? questionKDs[i] : '';
      const lvl = (questionLevels && questionLevels[i]) ? questionLevels[i] : 'L1';

      if (!a.isCorrect) {
        wrongQuestions.push(
          `* [SOAL NO. ${a.questionNumber}] (Pilihan Siswa: '${a.studentAnswer}', Kunci Jawaban Benar: '${a.correctAnswer}')` +
          `\n    - Tujuan Pembelajaran / KD: ${kd || '-'}` +
          `\n    - Materi Pokok: ${mat}` +
          `\n    - Level Kognitif: ${lvl}` +
          `\n    - Deskripsi Indikator Soal: "${ind}"`
        );
      }
    }
  }

  return `
Anda adalah seorang guru kelas SD yang komunikatif, ramah, dan berpengalaman. Tugas Anda adalah menyusun Laporan Evaluasi Belajar Siswa yang bahasanya SANGAT SEDERHANA, PRAKTIS, MUDAH DIPAHAMI GURU SD & ORANG TUA, SERTA BEBAS DARI ISTILAH ASING/TEORI KAMPUS berdasarkan data berikut:

=== DATA PENILAIAN SISWA ===
- Nama Siswa: ${studentName}
- Mata Pelajaran: ${subject}
- Nilai Akhir: ${score} / 100 (Standar KKM: ${kkm}) -> Status: ${score >= kkm ? 'TUNTAS' : 'BELUM TUNTAS / PERLU REMEDIAL'}
- Capaian: ${correctCount} Benar, ${wrongCount} Salah (dari total ${effectiveTotal} butir soal pilihan ganda)

=== RINCIAN BUTIR SOAL YANG SALAH BESERTA INDIKATORNYA ===
${wrongQuestions.length > 0 ? wrongQuestions.join('\n\n') : 'Siswa menjawab seluruh soal dengan benar (100% Sempurna).'}

=== ATURAN BAHASA WAJIB (PENTING!) ===
1. DILARANG KERAS menggunakan istilah bahasa Inggris atau istilah kampus yang rumit (DILARANG menggunakan kata: scaffolding, problem-based learning, inkuiri terbimbing, concept mapping, peer tutor, re-test, distractor, kognitif, HOTS, biogeografi, komparasi, dll).
2. Gantilah dengan bahasa sehari-hari guru SD:
   - Gunakan "Bimbingan langkah demi langkah dari yang mudah" (bukan scaffolding).
   - Gunakan "Belajar lewat contoh kejadian nyata di sekitar anak" (bukan problem-based learning).
   - Gunakan "Membuat catatan rangkuman ringkas atau bagan sederhana" (bukan concept mapping).
   - Gunakan "Menggunakan gambar, foto, atau benda nyata di kelas" (bukan demonstrasi visual 3D).
   - Gunakan "Latihan ulangan singkat 3 sampai 5 soal" (bukan re-test/asesmen klinis).
3. ATURAN KHUSUS UNTUK POIN 5 (Panduan Latihan Siswa di Rumah):
   - WAJIB berikan 1 kegiatan rumah yang BERVARIASI DAN BERBEDA untuk SETIAP nomor soal yang salah (Soal No. X).
   - Variasikan kegiatan rumahnya: ada yang menggunakan kartu tebak-tebakan kata kunci, ada yang mewarnai/menandai gambar di buku, ada yang menceritakan kembali secara lisan kepada orang tua, dan ada yang mendiskusikan contoh kejadian di rumah.
   - DILARANG KERAS mengulang kalimat saran kegiatan rumah yang sama antar-soal!

=== INSTRUKSI KHUSUS PENYUSUNAN LAPORAN (6 STRUKTUR BAKU) ===
Tulis laporan dalam format Markdown dengan 6 heading berikut:

### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Jelaskan perolehan nilai siswa dibandingkan KKM dengan bahasa yang santai, jelas, dan memotivasi.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
Rincikan per nomor soal yang salah (Soal No. X). Jelaskan letak kesilapan siswa secara spesifik berdasarkan Indikator Soal dan Level Kognitifnya (L1/L2/L3).

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
Rincikan per nomor soal yang salah (Soal No. X). Berikan penjelasan konsep kunci yang harus ditekankan ulang agar siswa paham.

### 4. Rekomendasi Cara Mengajar Guru di Kelas
Rincikan per nomor soal yang salah (Soal No. X). Berikan 1 cara mengajar yang konkret dan spesifik berdasarkan teks Indikator Soal tersebut.

### 5. Panduan Latihan Siswa di Rumah
Rincikan per nomor soal yang salah (Soal No. X). Berikan 1 bentuk kegiatan belajar rumah yang UNIK dan BERVARIASI bersama orang tua (kartu tebak-tebakan, rangkuman gambar, cerita lisan, atau pengamatan di rumah).

### 6. Rencana Tindak Lanjut: ${score >= kkm ? 'PENGAYAAN' : 'REMEDIAL'}
${score >= kkm 
  ? 'Berikan saran pengayaan berupa latihan soal cerita tambahan yang seru dan menantang agar wawasan siswa semakin luas.'
  : 'Berikan saran jadwal bimbingan remedial singkat (sekitar 15-20 menit) di mana guru menjelaskan ulang materi yang masih salah, lalu memberikan 3-5 soal latihan sederhana untuk memastikan anak sudah benar-benar paham.'}

Gunakan Bahasa Indonesia yang santun, sederhana, membumi, dan ramah dibaca oleh guru SD maupun orang tua murid.
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
          content: "Anda adalah guru kelas SD yang ramah, bijak, dan berpengalaman. Anda selalu menulis laporan belajar siswa menggunakan Bahasa Indonesia yang sangat sederhana, membumi, praktis, dan tanpa istilah asing. Pada Poin 5, Anda selalu memberikan rekomendasi kegiatan rumah yang bervariasi dan tidak pernah mengulang kalimat yang sama."
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
 * Pembangkit Diagnostik Berbasis Data Riil (Fallback Cerdas Berbasis Indikator & Level Soal)
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

  // Larik Kegiatan Rumah Bervariasi (8 Pilihan Kegiatan Unik)
  const homeActivitiesTemplates = [
    (materi) => `Orang tua membuat 3 kartu pertanyaan sederhana mengenai kata kunci **${materi}** dan mengajak **${studentName}** bermain tebak-tebakan selama 10 menit.`,
    (materi) => `Orang tua mendampingi **${studentName}** mewarnai atau menandai bagian penting terkait materi **${materi}** di buku paket sekolah.`,
    (materi) => `**${studentName}** diajak menceritakan kembali pemahamannya mengenai **${materi}** secara santai kepada orang tua sebelum tidur.`,
    (materi) => `Mendiskusikan contoh kejadian sehari-hari di sekitar rumah yang berhubungan langsung dengan materi **${materi}**.`,
    (materi) => `**${studentName}** menuliskan 3 poin utama materi **${materi}** di kertas memo berwarna untuk ditempel di dekat meja belajar.`,
    (materi) => `Membimbing **${studentName}** menggambar diagram atau bagan sederhana tentang **${materi}** di buku latihan.`,
    (materi) => `Orang tua membimbing **${studentName}** membaca ulang 1 halaman materi **${materi}** lalu mencoba menjawab 2 soal latihan serupa.`,
    (materi) => `Mengamati benda atau peristiwa nyata di sekitar rumah yang memperlihatkan contoh materi **${materi}**.`
  ];

  return `
### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Halo! Berdasarkan hasil tugas **${subject}**, siswa **${studentName}** mendapatkan nilai **${score}** dari KKM **${kkm}**. Siswa menjawab benar **${correctCount}** soal dan keliru **${wrongCount}** soal dari total **${effectiveTotal}** butir soal. Status capaian belajar siswa dinyatakan **${isTuntas ? 'TELAH TUNTAS DAN BERHASIL' : 'BELUM TUNTAS DAN PERLU PENDAMPINGAN KHUSUS'}**.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
${wrongItems.length > 0 ? `Berdasarkan pemindaian jawaban, rincian kesilapan siswa **${studentName}** adalah sebagai berikut:\n` + wrongItems.map(item => {
  let alasanKesalahan = "";
  if (item.level === 'L1') {
    alasanKesalahan = `Siswa memilih opsi **\`${item.studentAns}\`** (Kunci: **\`${item.correctAns}\`**). Sepertinya siswa belum hafal atau tertukar antara nama istilah pada materi **${item.materi}**.`;
  } else if (item.level === 'L2') {
    alasanKesalahan = `Siswa memilih opsi **\`${item.studentAns}\`** (Kunci: **\`${item.correctAns}\`**). Siswa sudah mengenal konsepnya tetapi kurang teliti saat menerapkannya pada indikator *"${item.indikator}"*.`;
  } else {
    alasanKesalahan = `Siswa memilih opsi **\`${item.studentAns}\`** (Kunci: **\`${item.correctAns}\`**). Siswa terburu-buru sehingga terkecoh oleh kalimat soal penalaran pada materi **${item.materi}**.`;
  }

  return `* **Soal No. ${item.num}** (Level Kognitif: \`${item.level}\`)
  - **Materi**: ${item.materi} ${item.kd ? `(${item.kd})` : ''}
  - **Indikator**: *"${item.indikator}"*
  - **Analisis Kesilapan**: ${alasanKesalahan}`;
}).join('\n') : `Hebat! Siswa menjawab seluruh soal dengan benar (Akurasi 100%).`}

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
${wrongItems.length > 0 ? `Berikut penguatan konsep spesifik yang perlu ditekankan ulang kepada **${studentName}**:\n` + wrongItems.map(item => {
  let penjelasaKonsep = "";
  if (item.level === 'L1') {
    penjelasaKonsep = `Fokuskan pada pengenalan istilah dasar dan kata kunci penting mengenai *"${item.indikator}"* agar siswa tidak tertukar lagi.`;
  } else if (item.level === 'L2') {
    penjelasaKonsep = `Berikan contoh penerapan nyata terkait materi **${item.materi}** agar siswa paham cara menghubungkan teori dengan pertanyaan soal.`;
  } else {
    penjelasaKonsep = `Ajak siswa mendiskusikan hubungan sebab-akibat pada indikator *"${item.indikator}"* agar nalar berpikirnya semakin terasah.`;
  }

  return `* **Materi Soal No. ${item.num} (${item.materi})**:
  - ${penjelasaKonsep}`;
}).join('\n') : `Pertahankan prestasi belajar siswa dengan memberikan bacaan atau latihan soal yang lebih menantang.`}

### 4. Rekomendasi Cara Mengajar Guru di Kelas
${wrongItems.length > 0 ? `Berikut adalah saran tindakan khusus yang dapat dilakukan guru di kelas untuk mendampingi **${studentName}** pada setiap soal yang keliru:\n` + wrongItems.map(item => {
  const indLower = item.indikator.toLowerCase();
  let metodeSaran = "";

  if (indLower.includes('tabel')) {
    metodeSaran = `Guru mengajak **${studentName}** melatih cara membaca baris dan kolom tabel pada materi **${item.materi}** dengan menandai kata kunci penting menggunakan pensil warna.`;
  } else if (indLower.includes('gambar') || indLower.includes('peta') || indLower.includes('foto') || indLower.includes('ilustrasi')) {
    metodeSaran = `Guru menunjukkan gambar atau foto nyata terkait materi **${item.materi}** di depan kelas, lalu mengajak **${studentName}** menunjuk bagian-bagian utamanya.`;
  } else if (indLower.includes('menentukan') || indLower.includes('menyebutkan') || indLower.includes('mengidentifikasi')) {
    metodeSaran = `Guru melakukan tanya-jawab singkat mengenai kata kunci materi **${item.materi}** dan membimbing siswa menyusun catatan ringkas sederhana.`;
  } else if (indLower.includes('menganalisis') || indLower.includes('membandingkan') || indLower.includes('dampak')) {
    metodeSaran = `Guru mengajak **${studentName}** berdiskusi menggunakan contoh cerita sederhana di sekitar kita tentang sebab-akibat pada materi **${item.materi}**.`;
  } else {
    metodeSaran = `Guru membimbing **${studentName}** mengerjakan latihan soal bertahap dari yang paling mudah pada materi **${item.materi}** sampai siswa percaya diri.`;
  }

  return `* **Materi Soal No. ${item.num} (${item.materi})**:\n  - ${metodeSaran}`;
}).join('\n') : `* Guru dapat mengarahkan siswa **${studentName}** untuk membantu teman sekelasnya yang lain.`}

### 5. Panduan Latihan Siswa di Rumah
${wrongItems.length > 0 ? `Saran kegiatan bervariasi yang bisa dikerjakan **${studentName}** di rumah bersama orang tua:\n` + wrongItems.map((item, idx) => {
  const actFn = homeActivitiesTemplates[idx % homeActivitiesTemplates.length];
  return `* **Soal No. ${item.num} (${item.materi})**:\n  - ${actFn(item.materi)}`;
}).join('\n') : `1. Membaca materi bab berikutnya sebagai persiapan belajar mandiri.`}

### 6. Rencana Tindak Lanjut: ${isTuntas ? 'PENGAYAAN' : 'REMEDIAL'}
${isTuntas ? `
* **Program Pengayaan**: Berikan soal cerita tambahan atau tantangan seru agar kemampuannya semakin tuntas pada mata pelajaran **${subject}**.
` : `
* **Jadwal Remedial**: Guru meluangkan waktu sekitar 15–20 menit untuk memberikan bimbingan bertahap dan latihan ulang yang lebih pelan kepada ananda **${studentName}** pada materi yang masih keliru sebelum melanjutkan ke pelajaran berikutnya.
`}
`.trim();
}