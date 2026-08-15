/**
 * =========================================================
 * REACTIVE CENTRAL STATE STORE (WITH KISI-KISI INTEGRATION)
 * SmartEval OMR & AI Modular Architecture
 * =========================================================
 */

import { 
  initTursoDb, 
  saveAssessmentToTurso, 
  loadAssessmentFromTurso, 
  saveUserToTurso, 
  loadUsersFromTurso 
} from '../services/tursoService.js';

const STORAGE_KEY = 'smarteval_state';
const AUTH_KEY = 'smarteval_user';
const USERS_DB_KEY = 'smarteval_registered_users';

export const OFFICIAL_IPS_KISI_KISI = {
  subject: "Ilmu Pengetahuan Sosial (IPS) Kelas VI",
  materials: [
    "Letak geografis",
    "Letak geografis Indonesia",
    "Letak geografis Indonesia",
    "Manfaat letak strategis Indonesia",
    "Persebaran fauna di Indonesia",
    "Persebaran fauna di Indonesia",
    "Indonesia sebagai negara agraris",
    "Bentuk kegiatan Ekonomi",
    "Indonesia sebagai negara maritim",
    "Kegiatan ekonomi di dataran rendah",
    "Dampak negatif interaksi manusia dengan lingkungan",
    "Tujuan bangsa Eropa",
    "Perlawanan Bangsa Indonesia",
    "Pergerakan Nasional",
    "Rumusan Dasar Negara",
    "Manfaat letak strategis Indonesia",
    "Kegiatan ekonomi di dataran tinggi",
    "Rumusan Dasar Negara",
    "Karakteristik geografis negara ASEAN",
    "Kehidupan sosial budaya di negara ASEAN",
    "Potensi ekonomi negara ASEAN",
    "Persamaan karakteristik geografis negara ASEAN",
    "Kehidupan sosial budaya masyarakat modern",
    "Tokoh dan Penemuannya",
    "Dampak penemuan alat modern"
  ],
  indicators: [
    "Disajikan tabel, peserta didik dapat menentukan kondisi geografis negara Indonesia",
    "Disajikan gambar, peserta didik dapat mengidentifikasi asal suku bangsa yang mendiami pulau besar di Indonesia secara tepat",
    "Disajikan Peta Indonesia, peserta didik dapat mengidentifikasi letak geografis Indonesia dengan tepat",
    "Disajikan pernyataan, peserta didik mampu mengidentifikasi manfaat letak strategis Indonesia",
    "Disajikan gambar hewan, peserta didik dapat menentukan habitat fauna tersebut dengan benar",
    "Disajikan tabel, peserta didik dapat menganalisis fauna yang dilindungi wilayah Indonesia bagian Barat",
    "Disajikan sebuah ilustrasi, peserta didik dapat mengidentifikasi karakteristik Indonesia sebagai negara agraris/maritim secara tepat",
    "Disajikan gambar, peserta didik dapat menentukan kegiatan ekonomi dalam gambar dengan benar",
    "Disajikan sebuah ilustrasi, peserta didik dapat mengidentifikasi karakteristik Indonesia sebagai negara maritim secara tepat",
    "Disajikan gambar dataran rendah, peserta didik dapat mengidentifikasi kegiatan ekonomi di wilayah tersebut dengan benar",
    "Disajikan gambar penebangan hutan, peserta didik dapat menentukan dampak negatif dari gambar tersebut dengan tepat",
    "Disajikan beberapa pernyataan, peserta didik dapat mengidentifikasi tujuan bangsa Eropa ke Indonesia secara tepat",
    "Disajikan gambar tokoh pahlawan, peserta didik dapat menjodohkan antara nama pahlawan dan bentuk perlawanannya dengan benar",
    "Disajikan ilustrasi, peserta didik dapat menentukan organisasi pergerakan nasional beserta tokohnya",
    "Disajikan pernyataan usulan dasar negara dari berbagai tokoh, peserta didik dapat menentukan usulan yang disampaikan oleh Ir. Soekarno dengan tepat",
    "Disajikan pernyataan, peserta didik mampu mengidentifikasi manfaat letak strategis Indonesia",
    "Disajikan tabel dataran tinggi, peserta didik dapat mengidentifikasi kegiatan ekonomi di wilayah tersebut dengan benar",
    "Disajikan pernyataan usulan dasar negara, peserta didik dapat menentukan usulan dasar negara yang disampaikan tokoh bangsa dengan tepat",
    "Disajikan peta negara ASEAN, peserta didik dapat menentukan nama negara ASEAN yang ditunjukkan dalam peta dengan tepat",
    "Disajikan 4 pernyataan tentang karakteristik salah satu negara ASEAN (Singapura), peserta didik dapat menunjukkan 2 pernyataan yang berhubungan dengan tepat",
    "Peserta didik dapat menentukan negara anggota ASEAN penghasil beras terbesar di Asia dengan benar",
    "Peserta didik dapat menentukan salah satu persamaan karakteristik geografis negara-negara ASEAN dengan tepat",
    "Peserta didik dapat menentukan salah satu ciri masyarakat modern dengan benar",
    "Disajikan deskripsi tentang Garrett Augustus Morgan, peserta didik dapat menentukan nama alat yang ditemukan oleh tokoh tersebut dengan benar",
    "Disajikan ilustrasi, peserta didik dapat menjelaskan dampak positif penemuan alat transportasi modern pada bidang ekonomi secara tepat"
  ],
  kds: [
    "3.1 Karakteristik Geografis Indonesia",
    "3.1 Karakteristik Geografis Indonesia",
    "3.1 Karakteristik Geografis Indonesia",
    "3.1 Karakteristik Geografis Indonesia",
    "3.1 Karakteristik Geografis Indonesia",
    "3.1 Karakteristik Geografis Indonesia",
    "3.1 Karakteristik Geografis Indonesia",
    "3.2 Bentuk Interaksi Manusia",
    "3.1 Karakteristik Geografis Indonesia",
    "3.2 Bentuk Interaksi Manusia",
    "3.2 Bentuk Interaksi Manusia",
    "3.3 Penyebab Penjajahan & Kemerdekaan",
    "3.3 Penyebab Penjajahan & Kemerdekaan",
    "3.3 Penyebab Penjajahan & Kemerdekaan",
    "3.3 Penyebab Penjajahan & Kemerdekaan",
    "3.1 Karakteristik Geografis Indonesia",
    "3.2 Bentuk Interaksi Manusia",
    "3.3 Penyebab Penjajahan & Kemerdekaan",
    "3.1 Karakteristik Geografis & Sosial ASEAN",
    "3.1 Karakteristik Geografis & Sosial ASEAN",
    "3.1 Karakteristik Geografis & Sosial ASEAN",
    "3.1 Karakteristik Geografis & Sosial ASEAN",
    "3.2 Perubahan Sosial Budaya Modernisasi",
    "3.2 Perubahan Sosial Budaya Modernisasi",
    "3.2 Perubahan Sosial Budaya Modernisasi"
  ],
  levels: [
    "L1", "L1", "L2", "L2", "L1", "L3", "L1", "L1", "L1", "L2", "L2", "L1", "L1", "L1", "L2", "L2", "L2", "L2", "L1", "L2", "L1", "L2", "L1", "L1", "L1"
  ]
};

export const OFFICIAL_PRESEEDED_HISTORY = [
  {
    id: 1723600000001,
    studentName: "Ahmad Dani",
    subject: "Ilmu Pengetahuan Sosial (IPS) Kelas VI",
    score: 88,
    correctCount: 22,
    wrongCount: 3,
    date: "14/08/2026 09:30:15",
    answers: [
      { questionNumber: 1, studentAnswer: "A", correctAnswer: "A", isCorrect: true, density: 185 },
      { questionNumber: 2, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 190 },
      { questionNumber: 3, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 182 },
      { questionNumber: 4, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 178 },
      { questionNumber: 5, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 195 },
      { questionNumber: 6, studentAnswer: "C", correctAnswer: "B", isCorrect: false, density: 160 },
      { questionNumber: 7, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 188 },
      { questionNumber: 8, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 175 },
      { questionNumber: 9, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 184 },
      { questionNumber: 10, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 192 },
      { questionNumber: 11, studentAnswer: "A", correctAnswer: "B", isCorrect: false, density: 155 },
      { questionNumber: 12, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 180 },
      { questionNumber: 13, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 189 },
      { questionNumber: 14, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 194 },
      { questionNumber: 15, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 186 },
      { questionNumber: 16, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 179 },
      { questionNumber: 17, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 183 },
      { questionNumber: 18, studentAnswer: "B", correctAnswer: "B", isCorrect: true, density: 191 },
      { questionNumber: 19, studentAnswer: "A", correctAnswer: "C", isCorrect: false, density: 162 },
      { questionNumber: 20, studentAnswer: "C", correctAnswer: "C", isCorrect: true, density: 187 },
      { questionNumber: 21, studentAnswer: "D", correctAnswer: "D", isCorrect: true, density: 190 },
      { questionNumber: 22, studentAnswer: "D", correctAnswer: "D", isCorrect: true, density: 185 },
      { questionNumber: 23, studentAnswer: "D", correctAnswer: "D", isCorrect: true, density: 193 },
      { questionNumber: 24, studentAnswer: "D", correctAnswer: "D", isCorrect: true, density: 189 },
      { questionNumber: 25, studentAnswer: "D", correctAnswer: "D", isCorrect: true, density: 192 }
    ],
    aiReport: `### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Ananda **Ahmad Dani** memperoleh nilai akhir **88 / 100** (22 Benar, 3 Salah) pada Asesmen Sumatif IPS Kelas VI. Capaian ini melampaui KKM (75) sehingga siswa dinyatakan **TELAH TUNTAS**, dengan catatan perlu penguatan pada 3 butir indikator materi.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
* **Soal No. 06** (Level \`L3 - Penalaran\` | Materi: *Persebaran fauna di Indonesia*):
  - *Indikator*: "Disajikan tabel, peserta didik dapat menganalisis fauna yang dilindungi wilayah Indonesia bagian Barat"
  - *Letak Kesalahan*: Siswa memilih opsi \`C\` (Kunci: \`B\`). Siswa masih terkecoh mengelompokkan fauna tipe peralihan ke tipe Asiatis.
* **Soal No. 11** (Level \`L2 - Aplikasi\` | Materi: *Dampak negatif interaksi manusia dengan lingkungan*):
  - *Indikator*: "Disajikan gambar penebangan hutan, peserta didik dapat menentukan dampak negatif dari gambar tersebut"
  - *Letak Kesalahan*: Siswa memilih opsi \`A\` (Kunci: \`B\`). Siswa memilih dampak jangka pendek alih-alih dampak ekologis jangka panjang.
* **Soal No. 19** (Level \`L1 - Pengetahuan\` | Materi: *Karakteristik geografis negara ASEAN*):
  - *Indikator*: "Disajikan peta negara ASEAN, peserta didik dapat menentukan nama negara ASEAN yang ditunjukkan dalam peta"
  - *Letak Kesalahan*: Siswa memilih opsi \`A\` (Kunci: \`C\`). Terjadi kekeliruan membaca batas kontur negara kepulauan ASEAN.

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
* **Penguatan Soal No. 6**: Pembedahan garis Wallace dan Weber dengan latihan tabel fauna Asiatis, Peralihan, dan Australis.
* **Penguatan Soal No. 11**: Analisis studi kasus konversi lahan hutan dan rantai dampak erosi serta pemanasan global.
* **Penguatan Soal No. 19**: Pengenalan bentuk siluet peta 10 negara anggota ASEAN.

### 4. Rekomendasi Metode Pembelajaran Khusus Guru di Kelas
* **Metode Demonstrasi Peta Interaktif & Concept Mapping**: Guru menggunakan peta digital atau atlas tematik untuk menelusuri batas biogeografi fauna dan lokasi negara ASEAN bersama siswa.
* **Metode Problem-Based Learning (PBL) Berbasis Gambar**: Menghadapkan siswa pada foto kerusakan lingkungan untuk melatih analisis dampak multisektoral.

### 5. Panduan Latihan & Belajar Mandiri Siswa di Rumah
1. Membuat peta buta pembagian fauna Asiatis dan Australis di buku catatan.
2. Menghafal letak ibukota dan ciri geografis negara ASEAN menggunakan kartu kilas (*flashcard*).

### 6. Program Tindak Lanjut: PENGAYAAN TERARAH
Siswa diberikan penugasan pengayaan berupa penulisan esai singkat mengenai diplomasi lingkungan negara-negara ASEAN untuk memperluas nalar kritisnya.`
  },
  {
    id: 1723600000002,
    studentName: "Bayu Pratama",
    subject: "Ilmu Pengetahuan Sosial (IPS) Kelas VI",
    score: 96,
    correctCount: 24,
    wrongCount: 1,
    date: "14/08/2026 09:34:20",
    answers: Array.from({ length: 25 }, (_, i) => ({
      questionNumber: i + 1,
      studentAnswer: i === 13 ? 'A' : ['A','B','C','C','C','B','B','C','C','C','B','B','B','B','B','C','B','B','C','C','D','D','D','D','D'][i],
      correctAnswer: ['A','B','C','C','C','B','B','C','C','C','B','B','B','B','B','C','B','B','C','C','D','D','D','D','D'][i],
      isCorrect: i !== 13,
      density: 188
    })),
    aiReport: `### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Ananda **Bayu Pratama** meraih skor istimewa **96 / 100** (24 Benar, 1 Salah). Capaian ini sangat memuaskan (**TUNTAS TINGKAT TINGGI**) dengan penguasaan hampir sempurna di seluruh ranah materi.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
* **Soal No. 14** (Level \`L1 - Pengetahuan\` | Materi: *Pergerakan Nasional*):
  - *Indikator*: "Disajikan ilustrasi, peserta didik dapat menentukan organisasi pergerakan nasional beserta tokohnya"
  - *Letak Kesalahan*: Siswa memilih opsi \`A\` (Kunci: \`B\`). Siswa tertukar antara pendiri Budi Utomo dengan Sarekat Islam.

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
* **Penguatan Soal No. 14**: Penataan garis waktu organisasi pergerakan nasional awal abad ke-20 (Budi Utomo 1908, SI 1911, Indische Partij 1912).

### 4. Rekomendasi Metode Pembelajaran Khusus Guru di Kelas
* Guru dapat menunjuk Bayu sebagai **Tutor Sebaya (*Peer Tutor*)** untuk memimpin kelompok belajar di kelas.

### 5. Panduan Latihan & Belajar Mandiri Siswa di Rumah
* Membaca biografi singkat tokoh pergerakan nasional (Dr. Soetomo, H.O.S Tjokroaminoto).

### 6. Program Tindak Lanjut: PENGAYAAN HOTS
Diberikan tugas proyek mini: membuat infografis lini masa kemerdekaan Indonesia.`
  },
  {
    id: 1723600000003,
    studentName: "Dedi Kurniawan",
    subject: "Ilmu Pengetahuan Sosial (IPS) Kelas VI",
    score: 64,
    correctCount: 16,
    wrongCount: 9,
    date: "14/08/2026 09:42:10",
    answers: Array.from({ length: 25 }, (_, i) => ({
      questionNumber: i + 1,
      studentAnswer: [1, 3, 6, 8, 12, 16, 19, 21, 23].includes(i) ? 'A' : ['A','B','C','C','C','B','B','C','C','C','B','B','B','B','B','C','B','B','C','C','D','D','D','D','D'][i],
      correctAnswer: ['A','B','C','C','C','B','B','C','C','C','B','B','B','B','B','C','B','B','C','C','D','D','D','D','D'][i],
      isCorrect: ![1, 3, 6, 8, 12, 16, 19, 21, 23].includes(i),
      density: 170
    })),
    aiReport: `### 1. Kesimpulan Tingkat Penguasaan Kompetensi
Ananda **Dedi Kurniawan** memperoleh nilai **64 / 100** (16 Benar, 9 Salah). Skor belum mencapai KKM (75), sehingga siswa dinyatakan **BELUM TUNTAS / MEMERLUKAN REMEDIAL INTENSIF**.

### 2. Analisis Kesalahan Berdasarkan Indikator & Butir Soal
* Terdeteksi kelemahan pada materi *Suku Bangsa (No. 2)*, *Manfaat Letak Geografis (No. 4)*, *Indonesia Agraris (No. 7)*, *Negara Maritim (No. 9)*, *Tokoh Pahlawan (No. 13)*, *Kegiatan Dataran Tinggi (No. 17)*, *Karakteristik Singapura (No. 20)*, *Penghasil Beras ASEAN (No. 22)*, dan *Tokoh Penemu (No. 24)*.

### 3. Rekomendasi Penguatan Konsep Berdasarkan Indikator Materi
* Pengulangan konsep dasar istilah maritim vs agraris serta peta ekonomi ASEAN secara bertahap.

### 4. Rekomendasi Metode Pembelajaran Khusus Guru di Kelas
* **Metode Scaffolding & Pendampingan Terbimbing 1-on-1**: Guru memecah materi menjadi segmen-segmen kecil dengan bantuan kartu bergambar (*visual flashcards*).

### 5. Panduan Latihan & Belajar Mandiri Siswa di Rumah
* Mengulang membaca ringkasan bab Karakteristik Indonesia dan ASEAN selama 20 menit setiap sore.

### 6. Program Tindak Lanjut: REMEDIAL TERSTRUKTUR
* Siswa dijadwalkan mengikuti sesi remedial khusus pada 9 indikator materi di atas, dilanjutkan tes konfirmasi ulang 10 butir soal.`
  }
];

class Store {
  constructor() {
    this.state = {
      isAuthenticated: true,
      authMode: 'login',
      currentUser: {
        fullName: 'Budi Santoso, M.Pd',
        email: 'guru@sekolah.id',
        institution: 'SD Negeri 01 Pagi',
        role: 'Guru Kelas VI',
        username: 'guru',
        status: 'Aktif'
      },
      showOnboardingSplash: false,
      activeTab: 'tab-exam',
      selectedHistoryDetailId: null,
      isOpenCvReady: false,
      isAiLoading: false,
      exam: {
        subject: 'Ilmu Pengetahuan Sosial (IPS) Kelas VI',
        kkm: 75,
        totalQuestions: 25,
      },
      students: [
        'Ahmad Dani', 'Bayu Pratama', 'Citra Lestari', 'Dedi Kurniawan',
        'Eka Putri', 'Fajar Nugraha', 'Gita Savitri', 'Hadi Saputra',
      ],
      activeStudentIndex: 0,
      answerKeys: [
        'A', 'B', 'C', 'C', 'C',
        'B', 'B', 'C', 'C', 'C',
        'B', 'B', 'B', 'B', 'B',
        'C', 'B', 'B', 'C', 'C',
        'D', 'D', 'D', 'D', 'D',
      ],
      questionMaterials: [...OFFICIAL_IPS_KISI_KISI.materials],
      questionIndicators: [...OFFICIAL_IPS_KISI_KISI.indicators],
      questionKDs: [...OFFICIAL_IPS_KISI_KISI.kds],
      questionLevels: [...OFFICIAL_IPS_KISI_KISI.levels],
      currentOmrResult: null,
      latestAiText: '',
      history: [...OFFICIAL_PRESEEDED_HISTORY],
      groqApiKey: localStorage.getItem('groq_api_key') || 'gsk_placeholder_replace_with_real_key',
    };

    this.listeners = [];
    this.loadPersistedState();
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.savePersistedState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // PROFILE & ONBOARDING ACTIONS
  dismissOnboardingSplash() {
    this.setState({ showOnboardingSplash: false });
  }

  updateUserProfile(updatedData) {
    const updatedUser = { ...this.state.currentUser, ...updatedData };
    this.setState({ currentUser: updatedUser });
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    saveUserToTurso(updatedUser);
  }

  // AUTH ACTIONS
  setAuthMode(mode) {
    this.setState({ authMode: mode });
  }

  login(user) {
    const fullUser = {
      fullName: user.fullName || 'Budi Santoso, M.Pd',
      email: user.email,
      institution: user.institution || 'SD Negeri 01 Pagi',
      role: user.role || 'Guru Kelas VI',
      username: user.username || user.email.split('@')[0] || 'guru',
      status: 'Aktif'
    };
    this.setState({
      isAuthenticated: true,
      currentUser: fullUser,
      activeTab: 'tab-exam',
      showOnboardingSplash: true,
    });
    localStorage.setItem(AUTH_KEY, JSON.stringify(fullUser));

    // Sinkronisasi data asesmen dari Turso Cloud Database
    loadAssessmentFromTurso(fullUser.email).then(cloudData => {
      if (cloudData) {
        this.setState({
          exam: cloudData.exam || this.state.exam,
          students: (cloudData.students && cloudData.students.length > 0) ? cloudData.students : this.state.students,
          answerKeys: cloudData.answerKeys || this.state.answerKeys,
          questionMaterials: cloudData.questionMaterials || this.state.questionMaterials,
          questionIndicators: cloudData.questionIndicators || this.state.questionIndicators,
          questionKDs: cloudData.questionKDs || this.state.questionKDs,
          questionLevels: cloudData.questionLevels || this.state.questionLevels,
          history: (cloudData.history && cloudData.history.length > 0) ? cloudData.history : this.state.history,
        });
      }
    });
  }

  register(user) {
    const fullUser = {
      fullName: user.fullName,
      email: user.email,
      institution: user.institution,
      role: 'Guru Kelas VI',
      username: user.email.split('@')[0] || 'guru',
      status: 'Aktif'
    };

    const users = this.getRegisteredUsers();
    users.push({ ...fullUser, password: user.password });
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    saveUserToTurso({ ...fullUser, password: user.password });

    this.setState({
      isAuthenticated: true,
      currentUser: fullUser,
      activeTab: 'tab-exam',
      showOnboardingSplash: true,
    });
    localStorage.setItem(AUTH_KEY, JSON.stringify(fullUser));
  }

  logout() {
    this.setState({
      isAuthenticated: false,
      currentUser: null,
      activeTab: 'tab-exam',
      showOnboardingSplash: false,
    });
    localStorage.removeItem(AUTH_KEY);
  }

  getRegisteredUsers() {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // STATE ACTIONS
  setActiveTab(tabName) {
    this.setState({ activeTab: tabName });
  }

  setSelectedHistoryDetailId(id) {
    this.setState({
      selectedHistoryDetailId: id,
      activeTab: 'tab-detail',
    });
  }

  setSubject(subject) {
    this.setState({
      exam: { ...this.state.exam, subject },
    });
  }

  setKkm(kkm) {
    this.setState({
      exam: { ...this.state.exam, kkm: parseInt(kkm) || 75 },
    });
  }

  setTotalQuestions(totalQuestions) {
    const totalQ = 25; // Locked to 25
    let currentKeys = [...this.state.answerKeys];
    if (currentKeys.length < totalQ) {
      currentKeys = [...currentKeys, ...Array(totalQ - currentKeys.length).fill('A')];
    }

    this.setState({
      exam: { ...this.state.exam, totalQuestions: totalQ },
      answerKeys: currentKeys.slice(0, totalQ),
    });
  }

  setStudents(students) {
    this.setState({
      students: students.length > 0 ? students : ['Siswa 1'],
      activeStudentIndex: 0,
    });
  }

  setActiveStudentIndex(index) {
    if (index >= 0 && index < this.state.students.length) {
      const studentName = this.state.students[index];
      const savedHistory = this.state.history.find(h => h.studentName === studentName);

      if (savedHistory) {
        this.setState({
          activeStudentIndex: index,
          currentOmrResult: {
            score: savedHistory.score,
            correctCount: savedHistory.correctCount,
            wrongCount: savedHistory.wrongCount,
            detectedAnswers: savedHistory.answers || [],
          },
          latestAiText: savedHistory.aiReport || '',
        });
      } else {
        this.setState({
          activeStudentIndex: index,
          currentOmrResult: null,
          latestAiText: '',
        });
      }
    }
  }

  setAnswerKey(index, choice) {
    const updated = [...this.state.answerKeys];
    updated[index] = choice;
    this.setState({ answerKeys: updated });
  }

  setAnswerKeys(keys) {
    this.setState({ answerKeys: keys });
  }

  setQuestionMaterial(index, materialName) {
    const updated = [...this.state.questionMaterials];
    updated[index] = materialName;
    this.setState({ questionMaterials: updated });
  }

  setQuestionIndicator(index, indicatorText) {
    const updated = [...this.state.questionIndicators];
    updated[index] = indicatorText;
    this.setState({ questionIndicators: updated });
  }

  setAllQuestionMaterials(materials) {
    this.setState({ questionMaterials: materials });
  }

  // KISI-KISI IMPORT & PRESET ACTIONS
  setKisiKisiData({ materials, indicators, kds, levels, keys, subject }) {
    const updates = {};
    if (materials && Array.isArray(materials)) updates.questionMaterials = materials.slice(0, 25);
    if (indicators && Array.isArray(indicators)) updates.questionIndicators = indicators.slice(0, 25);
    if (kds && Array.isArray(kds)) updates.questionKDs = kds.slice(0, 25);
    if (levels && Array.isArray(levels)) updates.questionLevels = levels.slice(0, 25);
    if (keys && Array.isArray(keys)) updates.answerKeys = keys.slice(0, 25);
    if (subject) updates.exam = { ...this.state.exam, subject };

    this.setState(updates);
  }

  applyOfficialIpsPreset() {
    this.setKisiKisiData({
      materials: [...OFFICIAL_IPS_KISI_KISI.materials],
      indicators: [...OFFICIAL_IPS_KISI_KISI.indicators],
      kds: [...OFFICIAL_IPS_KISI_KISI.kds],
      levels: [...OFFICIAL_IPS_KISI_KISI.levels],
      subject: OFFICIAL_IPS_KISI_KISI.subject,
    });
  }

  setOmrResult(result) {
    const studentName = this.state.students[this.state.activeStudentIndex] || "Siswa";
    const historyIndex = this.state.history.findIndex(h => h.studentName === studentName);

    if (historyIndex !== -1 && result) {
      const updatedHistory = [...this.state.history];
      updatedHistory[historyIndex] = {
        ...updatedHistory[historyIndex],
        score: result.score,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        answers: result.detectedAnswers,
        date: new Date().toLocaleString('id-ID'),
      };
      this.setState({
        currentOmrResult: result,
        history: updatedHistory,
      });
    } else {
      this.setState({ currentOmrResult: result });
    }
  }

  setAiLoading(isLoading) {
    this.setState({ isAiLoading: isLoading });
  }

  setLatestAiText(text) {
    const studentName = this.state.students[this.state.activeStudentIndex] || "Siswa";
    const historyIndex = this.state.history.findIndex(h => h.studentName === studentName);

    if (historyIndex !== -1) {
      const updatedHistory = [...this.state.history];
      updatedHistory[historyIndex] = {
        ...updatedHistory[historyIndex],
        aiReport: text,
      };
      this.setState({
        latestAiText: text,
        isAiLoading: false,
        history: updatedHistory,
      });
    } else {
      this.setState({
        latestAiText: text,
        isAiLoading: false,
      });
    }
  }

  setGroqApiKey(key) {
    this.setState({ groqApiKey: key });
    localStorage.setItem('groq_api_key', key);
  }

  deleteHistoryItem(id) {
    this.setState({
      history: this.state.history.filter(item => item.id !== id),
    });
  }

  updateHistoryItem(id, updatedFields) {
    const updatedHistory = this.state.history.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });

    const activeStudentName = this.state.students[this.state.activeStudentIndex];
    const editedItem = updatedHistory.find(item => item.id === id);

    if (editedItem && editedItem.studentName === activeStudentName) {
      this.setState({
        history: updatedHistory,
        currentOmrResult: {
          score: editedItem.score,
          correctCount: editedItem.correctCount,
          wrongCount: editedItem.wrongCount,
          detectedAnswers: editedItem.answers || (this.state.currentOmrResult ? this.state.currentOmrResult.detectedAnswers : []),
        },
        latestAiText: editedItem.aiReport || this.state.latestAiText,
      });
    } else {
      this.setState({ history: updatedHistory });
    }
  }

  clearHistory() {
    this.setState({ history: [] });
  }

  savePersistedState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        exam: this.state.exam,
        students: this.state.students,
        answerKeys: this.state.answerKeys,
        questionMaterials: this.state.questionMaterials,
        questionIndicators: this.state.questionIndicators,
        questionKDs: this.state.questionKDs,
        questionLevels: this.state.questionLevels,
        history: this.state.history,
      }));

      // Asynchronous background Cloud Sync to Turso SQLite
      if (this.state.currentUser && this.state.currentUser.email) {
        saveAssessmentToTurso(this.state.currentUser.email, this.state);
      }
    } catch (e) {}
  }

  loadPersistedState() {
    try {
      initTursoDb();

      const authData = localStorage.getItem(AUTH_KEY);
      if (authData) {
        const user = JSON.parse(authData);
        if (user && user.email) {
          this.state.currentUser = user;
          this.state.isAuthenticated = true;
        }
      } else {
        // Default official account for instant evaluation across any device
        this.state.currentUser = {
          fullName: 'Budi Santoso, M.Pd',
          email: 'guru@sekolah.id',
          institution: 'SD Negeri 01 Pagi',
          role: 'Guru Kelas VI',
          username: 'guru',
          status: 'Aktif'
        };
        this.state.isAuthenticated = true;
      }

      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.exam) {
          this.state.exam = parsed.exam;
          this.state.exam.totalQuestions = 25;
        }
        if (parsed.students && parsed.students.length > 0) this.state.students = parsed.students;
        if (parsed.answerKeys && Array.isArray(parsed.answerKeys)) {
          this.state.answerKeys = parsed.answerKeys;
        }
        if (parsed.questionMaterials && Array.isArray(parsed.questionMaterials)) {
          this.state.questionMaterials = parsed.questionMaterials;
        }
        if (parsed.questionIndicators && Array.isArray(parsed.questionIndicators)) {
          this.state.questionIndicators = parsed.questionIndicators;
        }
        if (parsed.questionKDs && Array.isArray(parsed.questionKDs)) {
          this.state.questionKDs = parsed.questionKDs;
        }
        if (parsed.questionLevels && Array.isArray(parsed.questionLevels)) {
          this.state.questionLevels = parsed.questionLevels;
        }
        if (parsed.history && Array.isArray(parsed.history) && parsed.history.length > 0) {
          this.state.history = parsed.history;
        } else {
          this.state.history = [...OFFICIAL_PRESEEDED_HISTORY];
        }
      } else {
        this.state.history = [...OFFICIAL_PRESEEDED_HISTORY];
      }

      // Asynchronously fetch latest data from Turso Cloud Database
      if (this.state.currentUser && this.state.currentUser.email) {
        loadAssessmentFromTurso(this.state.currentUser.email).then(cloudData => {
          if (cloudData) {
            this.setState({
              exam: cloudData.exam || this.state.exam,
              students: (cloudData.students && cloudData.students.length > 0) ? cloudData.students : this.state.students,
              answerKeys: cloudData.answerKeys || this.state.answerKeys,
              questionMaterials: cloudData.questionMaterials || this.state.questionMaterials,
              questionIndicators: cloudData.questionIndicators || this.state.questionIndicators,
              questionKDs: cloudData.questionKDs || this.state.questionKDs,
              questionLevels: cloudData.questionLevels || this.state.questionLevels,
              history: (cloudData.history && cloudData.history.length > 0) ? cloudData.history : this.state.history,
            });
          }
        });
      }
    } catch (e) {
      this.state.history = [...OFFICIAL_PRESEEDED_HISTORY];
    }
  }
}

export const store = new Store();
