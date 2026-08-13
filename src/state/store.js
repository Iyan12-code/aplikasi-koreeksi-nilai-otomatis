/**
 * =========================================================
 * REACTIVE CENTRAL STATE STORE (WITH KISI-KISI INTEGRATION)
 * SmartEval OMR & AI Modular Architecture
 * =========================================================
 */

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

class Store {
  constructor() {
    this.state = {
      isAuthenticated: false,
      authMode: 'login',
      currentUser: null,
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
      history: [],
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
    } catch (e) {}
  }

  loadPersistedState() {
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      if (authData) {
        const user = JSON.parse(authData);
        if (user && user.email) {
          this.state.currentUser = user;
          this.state.isAuthenticated = true;
        } else {
          this.state.isAuthenticated = false;
        }
      } else {
        this.state.isAuthenticated = false;
      }

      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.exam) {
          this.state.exam = parsed.exam;
          this.state.exam.totalQuestions = 25;
        }
        if (parsed.students) this.state.students = parsed.students;
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
        if (parsed.history && Array.isArray(parsed.history)) {
          this.state.history = parsed.history;
        }
      }
    } catch (e) {}
  }
}

export const store = new Store();
