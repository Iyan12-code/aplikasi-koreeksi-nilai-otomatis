/**
 * =========================================================
 * SIDEBAR & MOBILE DRAWER COMPONENT
 * SmartEval UI Component (With Interactive Profile Card)
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderSidebar() {
  const state = store.getState();
  const user = state.currentUser || {
    fullName: 'Budi Santoso, M.Pd',
    email: 'guru@sekolah.sch.id',
    institution: 'SMA Negeri 1 Jakarta',
    role: 'Guru Matematika'
  };

  const totalQ = state.exam.totalQuestions || 25;

  const menuItems = [
    { id: 'tab-exam', icon: 'fa-user-graduate', title: '1. Input Data Siswa', sub: 'Daftar Siswa & Asesmen' },
    { id: 'tab-key', icon: 'fa-key', title: '2. Input Kunci & Kisi-kisi', sub: `${totalQ} Butir Indikator` },
    { id: 'tab-omr', icon: 'fa-camera', title: '3. Koreksi Lembar Jawaban Siswa', sub: 'Pemindaian Lembar LJK' },
    { id: 'tab-analysis', icon: 'fa-robot', title: '4. Analisis AI', sub: 'Deskripsi Analisis Siswa' },
    { id: 'tab-history', icon: 'fa-clock-rotate-left', title: '5. Riwayat & Ekspor', sub: 'Laporan Excel Analisis' },
  ];

  return `
    <aside class="sidebar fixed md:sticky top-0 md:top-16 left-0 h-screen md:h-[calc(100vh-4rem)] w-64 lg:w-72 shrink-0 bg-slate-950/95 md:bg-slate-950/60 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-4 md:p-5 z-50 transform -translate-x-full md:translate-x-0 transition-transform duration-300 shadow-2xl md:shadow-none" id="appSidebar">
      <div class="flex flex-col gap-2">
        <div class="md:hidden flex justify-between items-center pb-3 mb-2 border-b border-white/10">
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Navigasi Langkah</span>
          <button type="button" class="text-slate-400 hover:text-white text-lg p-1.5" id="btnCloseSidebar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3 hidden md:block">Menu Aplikasi</span>

        ${menuItems.map(item => {
          const isActive = state.activeTab === item.id;
          return `
            <button type="button" class="nav-item group flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 text-left border ${isActive ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-white shadow-lg shadow-indigo-500/10' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}" data-tab="${item.id}">
              <div class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm transition-all ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30' : 'bg-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-white/10'}">
                <i class="fa-solid ${item.icon}"></i>
              </div>
              <div class="min-w-0">
                <span class="text-xs font-bold block truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}">${item.title}</span>
                <small class="text-[10px] text-slate-400 block truncate">${item.sub}</small>
              </div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Bottom Interactive Profile Card (Matching Mobile Profile) -->
      <div class="pt-4 border-t border-white/10 mt-auto">
        <button type="button" class="w-full p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl flex items-center justify-between gap-3 text-left transition-all group" onclick="window.app.openProfileModal()" title="Kelola Profil Pendidik">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
              ${user.fullName ? user.fullName.charAt(0) : 'G'}
            </div>
            <div class="min-w-0">
              <strong class="text-xs text-white block truncate group-hover:text-indigo-300 transition-colors">${user.fullName}</strong>
              <small class="text-[10px] text-slate-400 block truncate">${user.role || 'Guru Mata Pelajaran'}</small>
            </div>
          </div>
          <i class="fa-solid fa-pen-to-square text-xs text-slate-400 group-hover:text-white transition-colors shrink-0"></i>
        </button>
      </div>
    </aside>

    <div class="sidebar-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm z-40 hidden md:hidden" id="sidebarBackdrop"></div>
  `;
}
