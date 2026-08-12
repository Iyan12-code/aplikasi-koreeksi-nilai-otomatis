/**
 * =========================================================
 * ROOT MAIN ENTRY POINT & EVENT BINDER (WITH ONBOARDING SPLASH)
 * SmartEval OMR & AI Modular Web Application
 * =========================================================
 */

import './style.css';
import { store } from './state/store.js';
import { showToast } from './components/Toast.js';
import { renderNavbar } from './components/Navbar.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderExamTab } from './components/ExamTab.js';
import { renderAnswerKeyTab } from './components/AnswerKeyTab.js';
import { renderOmrTab } from './components/OmrTab.js';
import { renderAiAnalysisTab } from './components/AiAnalysisTab.js';
import { renderHistoryTab } from './components/HistoryTab.js';
import { renderDetailViewTab } from './components/DetailViewTab.js';
import { renderAuthView } from './components/AuthView.js';
import { renderProfileModal } from './components/ProfileModal.js';
import { renderOnboardingSplash } from './components/OnboardingSplash.js';

import { processOmrImage } from './services/omrService.js';
import { buildDiagnosticPrompt, callGroqAi, generateLocalDiagnosticFallback } from './services/aiService.js';
import { parseStudentsFromExcel, exportFullExcelReport } from './services/excelService.js';

// Global App Object for inline template handlers & CRUD & Auth & Profile
window.app = {
  // ONBOARDING SPLASH HANDLERS
  dismissOnboardingSplash() {
    store.dismissOnboardingSplash();
  },

  // PROFILE MANAGEMENT HANDLERS
  openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  },

  closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  saveProfileChanges() {
    const fullName = document.getElementById('profFullName')?.value || '';
    const institution = document.getElementById('profInstitution')?.value || '';
    const role = document.getElementById('profRole')?.value || '';
    const email = document.getElementById('profEmail')?.value || '';

    if (!fullName || !institution || !email) {
      showToast("Harap lengkapi semua kolom profil!", "error");
      return;
    }

    const updated = {
      fullName: fullName.trim(),
      institution: institution.trim(),
      role: role.trim() || 'Guru Mata Pelajaran',
      email: email.trim(),
    };

    store.updateUserProfile(updated);

    // Update in users DB as well
    try {
      let db = JSON.parse(localStorage.getItem('smarteval_registered_users') || '[]');
      db = db.map(u => u.email.toLowerCase() === updated.email.toLowerCase() ? { ...u, ...updated } : u);
      localStorage.setItem('smarteval_registered_users', JSON.stringify(db));
    } catch (e) {}

    showToast("Profil pendidik berhasil diperbarui!", "success");
    this.closeProfileModal();
  },

  // AUTHENTICATION HANDLERS
  setAuthMode(mode) {
    store.setAuthMode(mode);
  },

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(`icon-${inputId}`);
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'fa-solid fa-eye-slash';
      } else {
        input.type = 'password';
        if (icon) icon.className = 'fa-solid fa-eye';
      }
    }
  },

  handleLogin() {
    const email = (document.getElementById('loginEmail')?.value || '').trim();
    const password = document.getElementById('loginPassword')?.value || '';

    if (!email || !password) {
      showToast("Harap lengkapi alamat email dan kata sandi!", "error");
      return;
    }

    // Lookup user in local database of registered users
    let foundUser = null;
    try {
      const db = JSON.parse(localStorage.getItem('smarteval_registered_users') || '[]');
      foundUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());
    } catch (e) {}

    let userToLogin;
    if (foundUser) {
      userToLogin = foundUser;
    } else {
      const prefix = email.split('@')[0] || 'guru';
      const formattedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      userToLogin = {
        fullName: `${formattedName}, S.Pd`,
        email: email,
        institution: 'SMA Negeri 1 Jakarta',
        role: 'Guru Mata Pelajaran',
        username: prefix,
        status: 'Aktif'
      };
    }

    store.login(userToLogin);
    showToast(`Selamat datang kembali, ${userToLogin.fullName}!`, "success");
  },

  handleRegister() {
    const fullName = (document.getElementById('regFullName')?.value || '').trim();
    const email = (document.getElementById('regEmail')?.value || '').trim();
    const institution = (document.getElementById('regInstitution')?.value || '').trim();
    const password = document.getElementById('regPassword')?.value || '';
    const confirmPassword = document.getElementById('regConfirmPassword')?.value || '';

    if (!fullName || !email || !institution || !password) {
      showToast("Harap lengkapi semua kolom pendaftaran!", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Konfirmasi kata sandi tidak cocok!", "error");
      return;
    }

    const newUser = {
      fullName: fullName,
      email: email,
      institution: institution,
      role: 'Guru Mata Pelajaran',
      username: email.split('@')[0] || 'guru',
      status: 'Aktif'
    };

    store.register(newUser);
    showToast(`Pendaftaran berhasil! Selamat datang, ${newUser.fullName}.`, "success");
  },

  logout() {
    if (confirm("Apakah Anda yakin ingin keluar dari akun pendidik?")) {
      store.logout();
      showToast("Anda telah keluar dari akun.", "info");
    }
  },

  showForgotToast() {
    showToast("Tautan reset kata sandi telah dikirimkan ke email Anda.", "info");
  },

  // NAVIGATION
  goToTab(tabId) {
    store.setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setKey(index, choice) {
    store.setAnswerKey(index, choice);
  },

  setMaterial(index, materialName) {
    store.setQuestionMaterial(index, materialName);
  },

  applyBatchMaterial() {
    const matNameInput = document.getElementById("batchMaterialName");
    const startQInput = document.getElementById("batchStartQ");
    const endQInput = document.getElementById("batchEndQ");

    const matName = (matNameInput?.value || '').trim();
    const state = store.getState();
    const totalQ = state.exam.totalQuestions || 25;

    const startQ = parseInt(startQInput?.value) || 1;
    const endQ = parseInt(endQInput?.value) || totalQ;

    if (!matName) {
      showToast("Harap masukkan nama materi / indikator terlebih dahulu!", "error");
      return;
    }

    const updated = [...state.questionMaterials];
    const s = Math.max(1, Math.min(totalQ, Math.min(startQ, endQ)));
    const e = Math.max(1, Math.min(totalQ, Math.max(startQ, endQ)));

    for (let i = s - 1; i <= e - 1; i++) {
      updated[i] = matName;
    }

    store.setAllQuestionMaterials(updated);
    showToast(`Materi "${matName}" diterapkan ke Soal No. ${s} – ${e}!`, "success");
  },

  quickFillKeys(mode) {
    const state = store.getState();
    const totalQ = state.exam.totalQuestions || 25;

    if (mode === 'SAMPLE') {
      const sample = [
        "A", "B", "C", "C", "C",
        "B", "B", "C", "C", "C",
        "B", "B", "B", "B", "B",
        "C", "B", "B", "C", "C",
        "D", "D", "D", "D", "D"
      ];
      const keys = Array.from({ length: totalQ }).map((_, i) => sample[i % sample.length]);
      store.setAnswerKeys(keys);
      showToast(`Kunci jawaban standar ${totalQ} soal berhasil dipasang!`, "success");
    } else {
      store.setAnswerKeys(Array(totalQ).fill(mode));
      showToast(`Seluruh ${totalQ} kunci jawaban diatur ke opsi ${mode}`, "info");
    }
  },

  prevStudent() {
    const { activeStudentIndex, students } = store.getState();
    if (activeStudentIndex > 0) {
      store.setActiveStudentIndex(activeStudentIndex - 1);
      showToast(`Beralih ke siswa: ${students[activeStudentIndex - 1]}`, "info");
    }
  },

  nextStudent() {
    const { activeStudentIndex, students } = store.getState();
    if (activeStudentIndex < students.length - 1) {
      store.setActiveStudentIndex(activeStudentIndex + 1);
      showToast(`Beralih ke siswa: ${students[activeStudentIndex + 1]}`, "info");
    }
  },

  selectStudent(index) {
    const { students } = store.getState();
    store.setActiveStudentIndex(parseInt(index));
    showToast(`Siap mengoreksi lembar LJK: ${students[parseInt(index)]}`, "info");
  },

  saveToHistory() {
    const state = store.getState();
    if (!state.currentOmrResult) {
      showToast("Lakukan koreksi OMR terlebih dahulu!", "error");
      return;
    }

    const studentName = state.students[state.activeStudentIndex] || "Siswa";
    const filteredHistory = state.history.filter(h => h.studentName !== studentName);

    const historyItem = {
      id: Date.now(),
      studentName: studentName,
      subject: state.exam.subject,
      score: state.currentOmrResult.score,
      correctCount: state.currentOmrResult.correctCount,
      wrongCount: state.currentOmrResult.wrongCount,
      date: new Date().toLocaleString('id-ID'),
      answers: state.currentOmrResult.detectedAnswers,
      aiReport: state.latestAiText,
    };

    store.setState({ history: [historyItem, ...filteredHistory] });
    showToast(`Nilai ${studentName} (${historyItem.score}/100) tersimpan ke daftar kelas!`, "success");

    // Advance to next student
    if (state.activeStudentIndex < state.students.length - 1) {
      setTimeout(() => {
        store.setActiveStudentIndex(state.activeStudentIndex + 1);
        showToast(`Beralih ke siswa berikutnya: ${state.students[state.activeStudentIndex + 1]}`, "info");
      }, 800);
    }
  },

  // DETAIL VIEW & CRUD
  openDetailHistoryPage(id) {
    store.setSelectedHistoryDetailId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  backToHistory() {
    store.setActiveTab('tab-history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openEditHistoryModal(id) {
    const state = store.getState();
    const item = state.history.find(h => h.id === id);
    if (!item) return;

    const modal = document.getElementById('historyCrudModal');
    const modalTitle = document.getElementById('crudModalTitle');
    const idInput = document.getElementById('crudHistoryId');
    const nameInput = document.getElementById('crudStudentName');
    const subjectInput = document.getElementById('crudSubject');
    const correctInput = document.getElementById('crudCorrectCount');
    const wrongInput = document.getElementById('crudWrongCount');
    const scoreInput = document.getElementById('crudScore');

    if (!modal) return;

    modalTitle.innerText = `Edit Nilai: ${item.studentName}`;
    idInput.value = item.id;
    nameInput.value = item.studentName;
    subjectInput.value = item.subject;
    correctInput.value = item.correctCount;
    wrongInput.value = item.wrongCount;
    scoreInput.value = item.score;

    modal.classList.remove('hidden');
  },

  closeHistoryModal() {
    const modal = document.getElementById('historyCrudModal');
    modal?.classList.add('hidden');
  },

  syncScoreFromCounts() {
    const state = store.getState();
    const totalQ = state.exam.totalQuestions || 25;

    const correctInput = document.getElementById('crudCorrectCount');
    const wrongInput = document.getElementById('crudWrongCount');
    const scoreInput = document.getElementById('crudScore');

    let c = parseInt(correctInput?.value) || 0;
    c = Math.max(0, Math.min(totalQ, c));
    let w = totalQ - c;

    if (wrongInput) wrongInput.value = w;
    if (scoreInput) scoreInput.value = Math.round((c / totalQ) * 100);
  },

  saveHistoryModal() {
    const idInput = document.getElementById('crudHistoryId');
    const nameInput = document.getElementById('crudStudentName');
    const subjectInput = document.getElementById('crudSubject');
    const correctInput = document.getElementById('crudCorrectCount');
    const wrongInput = document.getElementById('crudWrongCount');
    const scoreInput = document.getElementById('crudScore');

    const name = (nameInput?.value || '').trim();
    const subject = (subjectInput?.value || '').trim();
    const correct = parseInt(correctInput?.value) || 0;
    const wrong = parseInt(wrongInput?.value) || 0;
    const score = parseInt(scoreInput?.value) || 0;
    const id = idInput?.value ? parseInt(idInput.value) : null;

    if (!name) {
      showToast("Nama siswa tidak boleh kosong!", "error");
      return;
    }

    if (id) {
      store.updateHistoryItem(id, {
        studentName: name,
        subject: subject,
        correctCount: correct,
        wrongCount: wrong,
        score: score,
        date: new Date().toLocaleString('id-ID')
      });
      showToast(`Data nilai ${name} berhasil diperbarui!`, "success");
    }

    this.closeHistoryModal();
  },

  deleteHistoryItem(id) {
    const state = store.getState();
    const item = state.history.find(h => h.id === id);
    if (!item) return;

    if (confirm(`Apakah Anda yakin ingin menghapus data nilai "${item.studentName}"?`)) {
      store.deleteHistoryItem(id);
      showToast(`Data nilai ${item.studentName} telah dihapus.`, "info");
      if (state.activeTab === 'tab-detail') {
        store.setActiveTab('tab-history');
      }
    }
  },

  clearAllHistory() {
    const state = store.getState();
    if (state.history.length === 0) {
      showToast("Riwayat sudah kosong.", "info");
      return;
    }

    if (confirm("PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SELURUH riwayat penilaian kelas ini?")) {
      store.clearHistory();
      showToast("Seluruh riwayat penilaian telah dibersihkan.", "info");
    }
  },

  async generateAIAnalysis() {
    const state = store.getState();
    const totalQ = state.exam.totalQuestions || 25;
    const studentName = state.students[state.activeStudentIndex] || "Siswa";
    
    store.setAiLoading(true);

    let omr = state.currentOmrResult;
    if (!omr) {
      const wrongIndices = new Set([1, 6, 15, 20].filter(i => i < totalQ));
      const simulatedCorrect = totalQ - wrongIndices.size;
      omr = {
        score: Math.round((simulatedCorrect / totalQ) * 100),
        correctCount: simulatedCorrect,
        wrongCount: wrongIndices.size,
        detectedAnswers: state.answerKeys.slice(0, totalQ).map((k, i) => ({
          questionNumber: i + 1,
          studentAnswer: wrongIndices.has(i) ? (k === 'A' ? 'B' : 'A') : k,
          correctAnswer: k,
          isCorrect: !wrongIndices.has(i),
        })),
      };
      store.setOmrResult(omr);
    }

    try {
      const prompt = buildDiagnosticPrompt(state.exam, studentName, omr, state.questionMaterials);
      let report = "";

      try {
        report = await callGroqAi(prompt, state.groqApiKey);
        showToast("Analisis AI LLaMA 3.3 berhasil dibuat!", "success");
      } catch (err) {
        console.warn("Groq API fallback:", err);
        report = generateLocalDiagnosticFallback(studentName, state.exam, omr, state.questionMaterials);
        showToast("Menggunakan template diagnostik lokal.", "info");
      }

      store.setLatestAiText(report);
    } catch (e) {
      store.setAiLoading(false);
      showToast("Gagal memproses AI: " + e.message, "error");
    }
  },

  copyAiReport() {
    const state = store.getState();
    if (state.latestAiText) {
      navigator.clipboard.writeText(state.latestAiText);
      showToast("Laporan Analisis AI berhasil disalin ke clipboard!", "success");
    }
  },

  exportExcel() {
    const state = store.getState();
    try {
      exportFullExcelReport(state.history, state.exam, state.latestAiText, state.students, state.answerKeys);
      showToast(`Laporan Analisis ASKA Excel (${state.exam.totalQuestions || 25} Soal) berhasil diunduh!`, "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  },
};

// Root Renderer
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const state = store.getState();

  // 1. If user is not logged in, render the Auth View (Login & Register)
  if (!state.isAuthenticated) {
    app.innerHTML = renderAuthView();
    return;
  }

  // 2. If in onboarding splash mode, render the standalone FULL-PAGE Splash Screen
  if (state.showOnboardingSplash) {
    app.innerHTML = renderOnboardingSplash();
    return;
  }

  // 3. Otherwise, render the Main Dashboard View
  const isDetailView = state.activeTab === 'tab-detail';

  app.innerHTML = `
    ${renderNavbar()}
    <div class="flex-1 flex w-full">
      ${isDetailView ? '' : renderSidebar()}
      <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full ${isDetailView ? 'max-w-7xl' : 'max-w-6xl'} mx-auto overflow-y-auto">
        ${isDetailView ? renderDetailViewTab() : `
          ${renderExamTab()}
          ${renderAnswerKeyTab()}
          ${renderOmrTab()}
          ${renderAiAnalysisTab()}
          ${renderHistoryTab()}
        `}
      </main>
    </div>
    ${renderProfileModal()}
  `;

  bindEvents();
}

// Event Binder
function bindEvents() {
  // Stepper & Sidebar Navigation
  document.querySelectorAll('.step-node, .nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const tab = el.getAttribute('data-step') || el.getAttribute('data-tab');
      if (tab) store.setActiveTab(tab);
      closeMobileSidebar();
    });
  });

  // Mobile Menu Drawer
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  btnToggleSidebar?.addEventListener('click', () => {
    sidebar?.classList.remove('-translate-x-full');
    backdrop?.classList.remove('hidden');
  });

  const closeMobileSidebar = () => {
    sidebar?.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
  };

  btnCloseSidebar?.addEventListener('click', closeMobileSidebar);
  backdrop?.addEventListener('click', closeMobileSidebar);

  // Profile Modal Events
  const btnCloseProfileModal = document.getElementById('btnCloseProfileModal');
  const btnCancelProfile = document.getElementById('btnCancelProfile');
  btnCloseProfileModal?.addEventListener('click', () => window.app.closeProfileModal());
  btnCancelProfile?.addEventListener('click', () => window.app.closeProfileModal());

  // Tab 1 Inputs
  const examSubjectInput = document.getElementById('examSubject');
  const examKkmInput = document.getElementById('examKkm');
  const examTotalQuestionsInput = document.getElementById('examTotalQuestions');

  examSubjectInput?.addEventListener('input', (e) => store.setSubject(e.target.value));
  examKkmInput?.addEventListener('input', (e) => store.setKkm(e.target.value));
  examTotalQuestionsInput?.addEventListener('change', (e) => {
    const val = parseInt(e.target.value) || 25;
    store.setTotalQuestions(val);
    showToast(`Jumlah butir soal diatur: ${val} Soal`, "info");
  });

  document.querySelectorAll('.btn-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.getAttribute('data-subject');
      if (sub) {
        store.setSubject(sub);
        showToast(`Mata pelajaran diatur: ${sub}`, "success");
      }
    });
  });

  document.querySelectorAll('.btn-q-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.getAttribute('data-count'));
      if (count) {
        store.setTotalQuestions(count);
        showToast(`Jumlah butir soal diatur ke ${count} Soal`, "success");
      }
    });
  });

  // Excel Upload
  const excelDropzone = document.getElementById('excelDropzone');
  const excelFileInput = document.getElementById('excelFileInput');
  const excelFileBadge = document.getElementById('excelFileBadge');
  const excelFileName = document.getElementById('excelFileName');
  const excelStudentCount = document.getElementById('excelStudentCount');

  excelDropzone?.addEventListener('click', () => excelFileInput?.click());
  excelFileInput?.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const names = await parseStudentsFromExcel(file);
        if (names.length > 0) {
          store.setStudents(names);
          if (excelFileBadge) excelFileBadge.classList.remove('hidden');
          if (excelFileName) excelFileName.innerText = file.name;
          if (excelStudentCount) excelStudentCount.innerText = `(${names.length} Siswa Terdeteksi)`;
          showToast(`Template Berhasil Diunggah! ${names.length} siswa ditemukan.`, "success");
        }
      } catch (err) {
        showToast("Gagal membaca file Excel: " + err.message, "error");
      }
    }
  });

  // Individual Question Material Inputs
  document.querySelectorAll('.q-material-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const qIdx = parseInt(input.getAttribute('data-qindex'));
      store.setQuestionMaterial(qIdx, e.target.value);
    });
  });

  // LJK Dropzone
  const ljkDropzone = document.getElementById('ljkDropzone');
  const ljkFileInput = document.getElementById('ljkFileInput');
  const ljkPreviewWrapper = document.getElementById('ljkPreviewWrapper');
  const ljkPreviewImg = document.getElementById('ljkPreviewImg');
  const btnResetLjkImg = document.getElementById('btnResetLjkImg');

  ljkDropzone?.addEventListener('click', () => ljkFileInput?.click());
  ljkFileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0 && ljkPreviewImg) {
      const reader = new FileReader();
      reader.onload = (re) => {
        ljkPreviewImg.src = re.target.result;
        ljkDropzone?.classList.add('hidden');
        ljkPreviewWrapper?.classList.remove('hidden');
        showToast("Foto LJK berhasil dimuat, siap dikoreksi.", "info");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  btnResetLjkImg?.addEventListener('click', () => {
    ljkPreviewWrapper?.classList.add('hidden');
    ljkDropzone?.classList.remove('hidden');
    if (ljkPreviewImg) ljkPreviewImg.src = '';
  });

  // Run OMR
  const btnRunOmr = document.getElementById('btnRunOmr');
  btnRunOmr?.addEventListener('click', async () => {
    if (!ljkPreviewImg || !ljkPreviewImg.src || ljkPreviewImg.src === window.location.href) {
      showToast("Harap unggah foto LJK terlebih dahulu!", "error");
      return;
    }

    btnRunOmr.disabled = true;
    btnRunOmr.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Memproses Sensor OMR...';

    try {
      const state = store.getState();
      const result = await processOmrImage(ljkPreviewImg, state.answerKeys.slice(0, state.exam.totalQuestions || 25));
      store.setOmrResult(result);
      showToast(`Koreksi Selesai! Nilai: ${result.score}/100 (${result.correctCount} Benar, ${result.wrongCount} Salah)`, "success");
    } catch (err) {
      showToast("Error OMR: " + err.message, "error");
    } finally {
      btnRunOmr.disabled = false;
      btnRunOmr.innerHTML = '<i class="fa-solid fa-brain mr-1"></i> Jalankan Koreksi Otomatis';
    }
  });

  // History Filter
  const inputSearchHistory = document.getElementById('inputSearchHistory');
  const filterStatusHistory = document.getElementById('filterStatusHistory');

  const filterHistory = () => {
    const q = (inputSearchHistory?.value || '').toLowerCase();
    const st = filterStatusHistory?.value || 'ALL';
    const state = store.getState();
    const kkm = state.exam.kkm || 75;

    const filtered = state.history.filter(item => {
      const matchText = item.studentName.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q);
      const isTuntas = item.score >= kkm;
      if (st === 'TUNTAS' && !isTuntas) return false;
      if (st === 'REMEDIAL' && isTuntas) return false;
      return matchText;
    });

    const tbody = document.getElementById('historyTableBody');
    const badge = document.getElementById('historyCountBadge');
    if (badge) badge.innerText = filtered.length;

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center py-12 text-slate-500">Belum ada riwayat koreksi yang cocok.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map((item, idx) => `
      <tr class="hover:bg-white/[0.02] transition-colors">
        <td class="px-5 py-4 text-slate-400">${idx + 1}</td>
        <td class="px-5 py-4 font-bold text-white">${item.studentName}</td>
        <td class="px-5 py-4 text-slate-300">${item.subject}</td>
        <td class="px-5 py-4 font-bold text-emerald-400">${item.correctCount}</td>
        <td class="px-5 py-4 font-bold text-rose-400">${item.wrongCount}</td>
        <td class="px-5 py-4 font-extrabold text-white text-sm bg-yellow-400/10">${item.score}</td>
        <td class="px-5 py-4">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${item.score >= kkm ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'}">
            ${item.score >= kkm ? 'TUNTAS' : 'REMEDIAL'}
          </span>
        </td>
        <td class="px-5 py-4 text-slate-400">${item.date}</td>
        <td class="px-5 py-4">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" class="p-1.5 bg-white/5 hover:bg-indigo-600 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-all" onclick="window.app.openDetailHistoryPage(${item.id})" title="Lihat Halaman Detail Lengkap">
              <i class="fa-solid fa-eye text-xs"></i>
            </button>
            <button type="button" class="p-1.5 bg-white/5 hover:bg-amber-600 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-all" onclick="window.app.openEditHistoryModal(${item.id})" title="Edit Nilai">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button type="button" class="p-1.5 bg-white/5 hover:bg-rose-600 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-all" onclick="window.app.deleteHistoryItem(${item.id})" title="Hapus">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  inputSearchHistory?.addEventListener('input', filterHistory);
  filterStatusHistory?.addEventListener('change', filterHistory);
}

// Global Keyboard Listener for Onboarding Dismiss
window.addEventListener('keydown', (e) => {
  const state = store.getState();
  if (state.showOnboardingSplash && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) {
    store.dismissOnboardingSplash();
  }
});

// Subscribe to store updates & render
store.subscribe(() => {
  renderApp();
});

// Initial boot
document.addEventListener('DOMContentLoaded', () => {
  renderApp();

  // Check OpenCV ready
  if (typeof cv !== 'undefined' && cv.Mat) {
    store.setOpenCvReady(true);
  } else {
    window.onOpenCvReady = () => {
      store.setOpenCvReady(true);
      showToast("Engine Computer Vision OMR berhasil dimuat!", "success");
    };
  }
});
