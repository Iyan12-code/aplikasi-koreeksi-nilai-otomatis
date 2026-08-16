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
Anda adalah seorang guru kelas sekolah dasar yang komunikatif, ramah, dan berpengalaman. Tugas Anda adalah menyusun Laporan Evaluasi Belajar Siswa yang bahasanya SANGAT SEDERHANA, PRAKTIS, MUDAH DIPAHAMI GURU SD & ORANG TUA, SERTA BEBAS DARI ISTILAH ASING/TEORI KAMPUS berdasarkan data berikut:

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
3. Seluruh rekomendasi harus mengalir langsung dari materi dan indikator soal yang salah pada siswa tersebut.

=== INSTRUKSI KHUSUS PENYUSUNAN LAPORAN (6 STRUKTUR BAKU) ===
Tulis laporan dalam format Markdown dengan 6 heading berikut:

### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Jelaskan perolehan nilai siswa dibandingkan KKM dengan bahasa yang santai, jelas, dan memotivasi.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
Untuk setiap butir soal yang salah (sebutkan nomor soal, materi, dan indikatornya):
Jelaskan letak kesilapan siswa, bagian materi mana yang membuat siswa tertukar, atau mengapa siswa kurang teliti dalam memilih jawaban.

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
Uraikan penjelasan sederhana untuk setiap materi yang belum dikuasai siswa di atas. Berikan contoh mudah atau perumpamaan sehari-hari agar anak paham letak kekeliruannya.

### 4. Rekomendasi Cara Mengajar Guru di Kelas
Berikan saran tindakan nyata yang bisa dilakukan guru di kelas untuk membimbing siswa pada materi yang salah tersebut (misalnya: mengajak tanya-jawab bergambar, memperlihatkan benda di sekitar kelas, atau membimbing latihan langkah demi langkah).

### 5. Panduan Latihan Siswa di Rumah
Berikan 2 sampai 3 saran latihan ringan yang bisa dikerjakan anak di rumah bersama orang tua, seperti membaca kembali catatan atau mencoba 2-3 soal latihan serupa.

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
          content: "Anda adalah guru kelas SD yang ramah, bijak, dan berpengalaman. Anda selalu menulis laporan belajar siswa menggunakan Bahasa Indonesia yang sangat sederhana, membumi, praktis, dan tanpa istilah asing atau bahasa teori yang rumit."
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
* **Program Pengayaan**: Berikan soal cerita tambahan atau tantangan seru agar kemampuannya semakin tuntas pada mata pelajaran **${subject}**.
` : `
* **Jadwal Remedial**: Guru meluangkan waktu sekitar 15–20 menit untuk memberikan bimbingan bertahap dan latihan ulang yang lebih pelan kepada ananda **${studentName}** pada materi yang masih keliru sebelum melanjutkan ke pelajaran berikutnya.
`}
`.trim();
}

//metode pembelajaran  berbasis gambar 