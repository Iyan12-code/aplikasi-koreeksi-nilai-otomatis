/**
 * =========================================================
 * REACTIVE CENTRAL STATE STORE (AUTHENTICATION ENFORCED)
 * SmartEval OMR & AI Modular Architecture
 * =========================================================
 */

const STORAGE_KEY = 'smarteval_state';
const AUTH_KEY = 'smarteval_user';
const USERS_DB_KEY = 'smarteval_registered_users';

class Store {
  constructor() {
    this.state = {
      isAuthenticated: false, // Default to FALSE so unauthenticated visitors see Login Page
      authMode: 'login',      // 'login' | 'register'
      currentUser: null,
      activeTab: 'tab-exam',
      selectedHistoryDetailId: null,
      isOpenCvReady: false,
      isAiLoading: false,
      exam: {
        subject: 'Matematika Kelas 6',
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
      questionMaterials: [
        'Operasi Hitung Aljabar', 'Operasi Hitung Aljabar', 'Persamaan Linier Satu Variabel', 'Persamaan Linier Satu Variabel', 'Sistem Persamaan Linier Dua Variabel',
        'Operasi Pecahan Biasa & Campuran', 'Operasi Pecahan Biasa & Campuran', 'Konversi Pecahan ke Desimal & Persen', 'Perbandingan & Skala', 'Perbandingan & Skala',
        'Sifat & Keliling Bangun Datar', 'Luas Bangun Datar Segiempat & Segitiga', 'Luas Bangun Datar Gabungan', 'Teorema Pythagoras Dasar', 'Teorema Pythagoras Terapan',
        'Penyajian Data Tabel & Diagram Batang', 'Membaca Diagram Lingkaran', 'Rata-rata (Mean) Data Tunggal', 'Median & Modus Data Tunggal', 'Peluang Kejadian Sederhana',
        'Satuan Panjang, Massa, & Waktu', 'Konversi Satuan Luas & Volume', 'Debit & Kecepatan Rata-rata', 'Aritmatika Sosial (Untung, Rugi, Diskon)', 'Bunga Tunggal & Pajak'
      ],
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

  // PROFILE ACTIONS
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
      institution: user.institution || 'SMA Negeri 1 Jakarta',
      role: user.role || 'Guru Mata Pelajaran',
      username: user.username || user.email.split('@')[0] || 'guru',
      status: 'Aktif'
    };
    this.setState({
      isAuthenticated: true,
      currentUser: fullUser,
      activeTab: 'tab-exam'
    });
    localStorage.setItem(AUTH_KEY, JSON.stringify(fullUser));
  }

  register(user) {
    const fullUser = {
      fullName: user.fullName,
      email: user.email,
      institution: user.institution,
      role: 'Guru Mata Pelajaran',
      username: user.email.split('@')[0] || 'guru',
      status: 'Aktif'
    };

    // Save to users DB
    try {
      const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
      db.push(fullUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    } catch (e) {}

    this.setState({
      isAuthenticated: true,
      currentUser: fullUser,
      activeTab: 'tab-exam'
    });
    localStorage.setItem(AUTH_KEY, JSON.stringify(fullUser));
  }

  logout() {
    this.setState({
      isAuthenticated: false,
      currentUser: null,
      authMode: 'login'
    });
    localStorage.removeItem(AUTH_KEY);
  }

  setActiveTab(tabId) {
    this.setState({ activeTab: tabId });
  }

  setSelectedHistoryDetailId(id) {
    this.setState({ selectedHistoryDetailId: id, activeTab: 'tab-detail' });
  }

  setOpenCvReady(ready) {
    this.setState({ isOpenCvReady: ready });
  }

  setAiLoading(loading) {
    this.setState({ isAiLoading: loading });
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

  setTotalQuestions(count) {
    const num = Math.max(1, Math.min(100, parseInt(count) || 25));
    const currentKeys = [...this.state.answerKeys];
    const currentMats = [...this.state.questionMaterials];

    const newKeys = [];
    const newMats = [];

    for (let i = 0; i < num; i++) {
      newKeys.push(currentKeys[i] || 'A');
      newMats.push(currentMats[i] || `Indikator Materi Soal ${i + 1}`);
    }

    this.setState({
      exam: { ...this.state.exam, totalQuestions: num },
      answerKeys: newKeys,
      questionMaterials: newMats,
      currentOmrResult: null,
    });
  }

  setStudents(students) {
    this.setState({
      students,
      activeStudentIndex: 0,
    });
  }

  setActiveStudentIndex(index) {
    if (index >= 0 && index < this.state.students.length) {
      this.setState({ activeStudentIndex: index });
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

  setAllQuestionMaterials(materials) {
    this.setState({ questionMaterials: materials });
  }

  setOmrResult(result) {
    this.setState({ currentOmrResult: result });
  }

  setLatestAiText(text) {
    this.setState({ latestAiText: text, isAiLoading: false });
  }

  updateHistoryItem(id, updatedFields) {
    const updated = this.state.history.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    this.setState({ history: updated });
  }

  deleteHistoryItem(id) {
    const updated = this.state.history.filter(item => item.id !== id);
    this.setState({ history: updated });
  }

  clearHistory() {
    this.setState({ history: [] });
  }

  setGroqApiKey(key) {
    localStorage.setItem('groq_api_key', key.trim());
    this.setState({ groqApiKey: key.trim() });
  }

  savePersistedState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        exam: this.state.exam,
        students: this.state.students,
        answerKeys: this.state.answerKeys,
        questionMaterials: this.state.questionMaterials,
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
          if (!this.state.exam.totalQuestions) this.state.exam.totalQuestions = 25;
        }
        if (parsed.students) this.state.students = parsed.students;
        if (parsed.answerKeys && Array.isArray(parsed.answerKeys)) {
          this.state.answerKeys = parsed.answerKeys;
        }
        if (parsed.questionMaterials && Array.isArray(parsed.questionMaterials)) {
          this.state.questionMaterials = parsed.questionMaterials;
        }
        if (parsed.history && Array.isArray(parsed.history)) {
          this.state.history = parsed.history;
        }
      }
    } catch (e) {}
  }
}

export const store = new Store();
