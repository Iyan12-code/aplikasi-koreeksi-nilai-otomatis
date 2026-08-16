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
Anda adalah seorang guru kelas sekolah dasar yang ramah dan berpengalaman. Tugas Anda adalah menyusun laporan evaluasi belajar yang bahasanya sederhana, mudah dipahami oleh guru dan orang tua, serta langsung pada tindakan nyata di kelas untuk siswa yang bersangkutan berdasarkan data berikut:

=== DATA PENILAIAN SISWA ===
- Nama Siswa: ${studentName}
- Mata Pelajaran: ${subject}
- Nilai Akhir: ${score} / 100 (Standar KKM: ${kkm}) -> Status: ${score >= kkm ? 'TUNTAS' : 'BELUM TUNTAS / PERLU REMEDIAL'}
- Capaian: ${correctCount} Benar, ${wrongCount} Salah (dari total ${effectiveTotal} butir soal pilihan ganda)

=== RINCIAN BUTIR SOAL YANG SALAH BESERTA INDIKATORNYA ===
${wrongQuestions.length > 0 ? wrongQuestions.join('\n\n') : 'Siswa menjawab seluruh soal dengan benar (100% Sempurna).'}

=== INSTRUKSI KHUSUS PENYUSUNAN LAPORAN (6 STRUKTUR) ===
Tulis laporan dalam format Markdown dengan 6 heading berikut menggunakan kalimat yang sederhana, membumi, dan mudah dicerna oleh guru SD:

### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Jelaskan perolehan nilai siswa dibandingkan KKM dengan bahasa yang santai, jelas, dan mudah dipahami.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
Untuk setiap soal yang salah, jelaskan letak kesilapan atau bagian materi apa yang membuat siswa tertukar atau kurang teliti dalam memilih jawaban.

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
Berikan saran penjelasan sederhana agar materi pada soal yang salah tersebut dapat dicerna dengan mudah oleh guru sekolah dasar menggunakan contoh atau analogi sehari-hari.

### 4. Rekomendasi Metode Pembelajaran Khusus Guru di Kelas
Berikan saran tindakan praktis bagi guru di kelas (misalnya: guru melakukan pendampingan khusus, menggunakan alat peraga sederhana, gambar, atau benda nyata) untuk membantu siswa memahami materi yang masih keliru.

### 5. Panduan Latihan & Belajar Mandiri Siswa di Rumah
Berikan 2-3 langkah latihan ringan di rumah yang bisa dikerjakan anak bersama orang tua, seperti membaca kembali buku atau mencoba latihan soal serupa.

### 6. Program Tindak Lanjut: ${score >= kkm ? 'PENGAYAAN' : 'REMEDIAL TERFOKUS'}
${score >= kkm 
  ? 'Berikan saran pengayaan berupa latihan soal tambahan yang lebih menantang agar wawasan siswa semakin luas.'
  : 'Berikan saran jadwal bimbingan singkat (remedial) dan pengulangan latihan soal secara sederhana.'}

Gunakan Bahasa Indonesia yang baik, santun, membumi, dan ramah dibaca oleh guru SD atau orang tua murid.
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
          content: "Anda adalah guru kelas sekolah dasar yang komunikatif, ramah, dan berpengalaman dalam menyusun laporan belajar siswa dengan bahasa yang sederhana serta mudah dipahami."
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
Halo! Berdasarkan hasil tugas **${subject}**, siswa **${studentName}** mendapatkan nilai **${score}** dari KKM **${kkm}**. siswa menjawab benar **${correctCount}** soal dan keliru **${wrongCount}** soal dari total **${effectiveTotal}** butir soal. Status capaian belajar siswa dinyatakan **${isTuntas ? 'TELAH TUNTAS DAN BERHASIL' : 'BELUM TUNTAS DAN PERLU PENDAMPINGAN KHUSUS'}**.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
${wrongItems.length > 0 ? `Berdasarkan pemindaian jawaban, siswa **${studentName}** masih keliru pada bagian materi berikut:\n` + wrongItems.map(item => `
* **Soal No. ${item.num}** (Level Kognitif: \`${item.level}\`)
  - **Materi**: ${item.materi} ${item.kd ? `(${item.kd})` : ''}
  - **Indikator**: *"${item.indikator}"*
  - **Catatan**: siswa memilih jawaban **\`${item.studentAns}\`**, padahal kunci jawaban yang benar adalah **\`${item.correctAns}\`**. Sepertinya siswa tertukar atau kurang teliti pada bagian ini.
`).join('\n') : `Hebat! siswa menjawab seluruh soal dengan benar (Akurasi 100%).`}

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
${wrongItems.length > 0 ? `Agar siswa lebih paham, penjelasan materi dapat difokuskan pada:\n` + wrongItems.map(item => `
* **Penguatan Materi Soal No. ${item.num} (${item.materi})**:
  - Ajak siswa mengulang kembali membaca materi mengenai *"${item.indikator}"*. Berikan contoh benda nyatanya atau ingatkan kembali kata kunci pada materi tersebut agar tidak terkecoh.
`).join('\n') : `Pertahankan prestasi belajar siswa dengan memberikan bacaan atau latihan soal yang lebih menantang.`}

### 4. Rekomendasi Cara Pembelajaran Khusus Guru di Kelas
${wrongItems.length > 0 ? `Guru melakukan pendampingan belajar ke siswa **${studentName}** karena siswa tersebut kurang pada mata pelajaran **${subject}**, khususnya pada beberapa bagian berikut:\n` + wrongItems.map(item => {
  let metodeSaran = `Guru membimbing siswa **${studentName}** untuk mengulang kembali materi **${item.materi}** menggunakan contoh benda nyata atau gambar di kelas.`;
  if (item.materi.toLowerCase().includes('rotasi') || item.materi.toLowerCase().includes('gerhana') || item.materi.toLowerCase().includes('planet') || item.materi.toLowerCase().includes('tata surya') || item.materi.toLowerCase().includes('geografis') || item.materi.toLowerCase().includes('peta')) {
    metodeSaran = `Guru membimbing siswa **${studentName}** untuk memahami materi **${item.materi}** dengan menunjukkan contoh langsung atau alat peraga sederhana agar anak lebih mudah menangkap konsepnya.`;
  } else if (item.materi.toLowerCase().includes('energi') || item.materi.toLowerCase().includes('lingkungan') || item.materi.toLowerCase().includes('ekonomi') || item.materi.toLowerCase().includes('penebangan')) {
    metodeSaran = `Guru membimbing siswa **${studentName}** menggunakan contoh cerita sehari-hari atau gambar lingkungan terkait materi **${item.materi}**.`;
  } else if (item.materi.toLowerCase().includes('sejarah') || item.materi.toLowerCase().includes('tokoh') || item.materi.toLowerCase().includes('asean') || item.materi.toLowerCase().includes('proklamasi')) {
    metodeSaran = `Guru membimbing siswa **${studentName}** menggunakan kartu bergambar atau catatan kecil berwarna untuk materi **${item.materi}**.`;
  } else {
    metodeSaran = `Guru membimbing siswa **${studentName}** mengerjakan ulang latihan secara bertahap pada materi **${item.materi}**.`;
  }
  return `* **Materi Soal No. ${item.num} (${item.materi})**:\n  - ${metodeSaran}`;
}).join('\n') : `* Guru dapat mengarahkan siswa **${studentName}** untuk membantu teman sekelasnya yang lain.`}

### 5. Panduan Latihan & Belajar Mandiri Siswa di Rumah
${wrongItems.length > 0 ? `Saran kegiatan yang bisa dikerjakan siswa **${studentName}** di rumah bersama orang tua:\n` + wrongItems.map(item => `
1. Menyalin ringkasan singkat materi **${item.materi}** di buku tulis agar lebih melekat di ingatan.
2. Mengerjakan ulang 2 sampai 3 soal latihan serupa untuk topik tersebut.
`).join('') : `1. Membaca materi bab berikutnya sebagai persiapan belajar mandiri.`}

### 6. Program Tindak Lanjut: ${isTuntas ? 'PENGAYAAN' : 'REMEDIAL TERFOKUS'}
${isTuntas ? `
* **Program Pengayaan**: Berikan soal cerita tambahan atau tantangan seru agar kemampuannya semakin terasah pada mata pelajaran **${subject}**.
` : `
* **Jadwal Remedial**: Guru meluangkan waktu sekitar 15–20 menit untuk memberikan bimbingan khusus dan latihan ulang kepada siswa **${studentName}** pada materi yang masih keliru sebelum melanjutkan ke pelajaran berikutnya.
`}
`.trim();
}

//metode pembelajaran  berbasis gambar 