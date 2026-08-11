/**
 * =========================================================
 * TOP NAVIGATION BAR (CLEAN - NO GEAR SETTINGS BUTTON)
 * SmartEval Component
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderNavbar() {
  const state = store.getState();
  const user = state.currentUser || {
    fullName: 'Budi Santoso, M.Pd',
    email: 'guru@sekolah.sch.id',
    institution: 'SMA Negeri 1 Jakarta'
  };

  const stepLabels = {
    'tab-exam': 'Langkah 1/5: Konfigurasi Asesmen',
    'tab-key': 'Langkah 2/5: Kunci & Kisi-kisi',
    'tab-omr': 'Langkah 3/5: Koreksi OMR Siswa',
    'tab-analysis': 'Langkah 4/5: Analisis AI Diagnostik',
    'tab-history': 'Langkah 5/5: Riwayat & Ekspor Excel',
    'tab-detail': 'Rincian Penilaian Siswa',
  };

  const currentStepText = stepLabels[state.activeTab] || 'Dashboard Penilaian';

  return `
    <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-white/10 shadow-lg shadow-black/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo & App Title -->
        <div class="flex items-center gap-3 shrink-0">
          <button type="button" class="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors" id="btnToggleSidebar" title="Menu Sidebar">
            <i class="fa-solid fa-bars text-sm"></i>
          </button>
          
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0">
            <i class="fa-solid fa-graduation-cap text-lg text-white"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-sm md:text-base tracking-tight text-white">Koreksi Nilai Otomatis</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold hidden sm:inline-block">AI v2.4</span>
            </div>
            <span class="text-[11px] text-slate-400 block -mt-0.5 truncate max-w-[180px] sm:max-w-xs">${user.institution}</span>
          </div>
        </div>

        <!-- Center: Current Step Status Indicator -->
        <div class="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-xs font-bold text-slate-200 shadow-inner">
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span>${currentStepText}</span>
        </div>

        <!-- Right Side: User Profile (Opens Profile Management Modal) -->
        <div class="flex items-center gap-3 shrink-0">
          <button type="button" class="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group" onclick="window.app.openProfileModal()" title="Kelola Profil Pendidik">
            <div class="hidden sm:block text-right">
              <strong class="text-xs text-white block leading-tight truncate max-w-[140px] group-hover:text-indigo-300 transition-colors">${user.fullName}</strong>
              <span class="text-[10px] text-slate-400 block leading-tight truncate max-w-[140px]">${user.role || user.institution}</span>
            </div>
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-md shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
              ${user.fullName ? user.fullName.charAt(0) : 'G'}
            </div>
          </button>
        </div>
      </div>
    </header>
  `;
}
