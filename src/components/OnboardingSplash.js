/**
 * =========================================================
 * ONBOARDING SPLASH SCREEN COMPONENT
 * SmartEval Quick Start Guide (Shown After Login/Register)
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderOnboardingSplash() {
  const state = store.getState();
  if (!state.showOnboardingSplash) return '';

  const user = state.currentUser || {
    fullName: 'Pendidik',
    institution: 'Instansi Pendidikan'
  };

  const steps = [
    {
      num: '1',
      icon: 'fa-user-graduate',
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20',
      title: '1. Input Data Siswa',
      desc: 'Atur mata pelajaran, standar KKM, jumlah butir soal, dan unggah daftar nama siswa via Excel.',
    },
    {
      num: '2',
      icon: 'fa-key',
      gradient: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-purple-500/20',
      title: '2. Kunci & Kisi-kisi',
      desc: 'Tentukan opsi kunci jawaban (A–D) dan indikator materi kompetensi per nomor soal.',
    },
    {
      num: '3',
      icon: 'fa-camera',
      gradient: 'from-purple-500 to-pink-600',
      shadow: 'shadow-pink-500/20',
      title: '3. Koreksi OMR AI',
      desc: 'Unggah lembar LJK siswa dan klik tombol "Jalankan Koreksi Otomatis" untuk sensor instan.',
    },
    {
      num: '4',
      icon: 'fa-robot',
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-orange-500/20',
      title: '4. Analisis Diagnostik',
      desc: 'Dapatkan laporan evaluasi kelemahan siswa & saran pembelajaran remedial dari AI LLaMA 3.3.',
    },
    {
      num: '5',
      icon: 'fa-file-excel',
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      title: '5. Riwayat & Ekspor',
      desc: 'Rekapitulasi nilai seluruh kelas dan unduh laporan resmi berformat Microsoft Excel ASKA.',
    },
  ];

  return `
    <div class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer animate-fade-in" id="onboardingSplashOverlay" onclick="window.app.dismissOnboardingSplash()">
      
      <!-- Background Decorative Lights -->
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>

      <div class="glass-card max-w-2xl w-full p-6 sm:p-8 border-indigo-500/30 bg-slate-900/90 shadow-2xl relative my-auto cursor-default transform transition-all animate-modal-pop" onclick="event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="text-center pb-5 mb-5 border-b border-white/10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold mb-3 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span>✨ PANDUAN PENGGUNAAN APLIKASI</span>
          </div>

          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            Selamat Datang, <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">${user.fullName}</span>! 👋
          </h2>
          <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Sistem evaluasi pembelajaran terintegrasi: Koreksi OMR presisi tinggi dan diagnostik AI otomatis.
          </p>
        </div>

        <!-- 5 STEPS GRID -->
        <div class="space-y-2.5 mb-6">
          ${steps.map(s => `
            <div class="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all group">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} ${s.shadow} text-white flex items-center justify-center text-sm font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <i class="fa-solid ${s.icon}"></i>
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">${s.title}</h4>
                <p class="text-[11px] text-slate-400 leading-snug mt-0.5">${s.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- ALERT NOTIFIKASI & ACTION BUTTON -->
        <div class="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div class="flex items-center gap-2 text-indigo-300 text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl w-full sm:w-auto justify-center sm:justify-start animate-pulse">
            <i class="fa-solid fa-hand-pointer text-xs"></i>
            <span>Tekan di mana saja pada layar untuk ke Halaman Utama</span>
          </div>

          <button type="button" class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all shrink-0" onclick="window.app.dismissOnboardingSplash()">
            <span>Mulai Asesmen</span> <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>

      </div>
    </div>
  `;
}
