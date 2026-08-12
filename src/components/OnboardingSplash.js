/**
 * =========================================================
 * FULL-PAGE ONBOARDING SPLASH SCREEN
 * SmartEval Dedicated Standalone Welcome & 5-Step Guide Page
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderOnboardingSplash() {
  const state = store.getState();
  const user = state.currentUser || {
    fullName: 'Budi Santoso, M.Pd',
    institution: 'SMA Negeri 1 Jakarta'
  };

  const steps = [
    {
      num: '01',
      icon: 'fa-user-graduate',
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/25',
      badge: 'Langkah 1',
      title: 'Input Data Siswa',
      desc: 'Atur mata pelajaran, standar KKM, jumlah butir soal, dan unggah daftar nama siswa via Excel.',
    },
    {
      num: '02',
      icon: 'fa-key',
      gradient: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/25',
      badge: 'Langkah 2',
      title: 'Kunci & Kisi-kisi',
      desc: 'Tentukan opsi kunci jawaban (A–D) dan indikator materi kompetensi per nomor butir soal.',
    },
    {
      num: '03',
      icon: 'fa-camera',
      gradient: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/25',
      badge: 'Langkah 3',
      title: 'Koreksi OMR AI',
      desc: 'Unggah lembar LJK siswa dan klik tombol "Jalankan Koreksi Otomatis" untuk sensor instan.',
    },
    {
      num: '04',
      icon: 'fa-robot',
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/25',
      badge: 'Langkah 4',
      title: 'Analisis Diagnostik',
      desc: 'Dapatkan evaluasi kelemahan siswa & saran pembelajaran remedial dari AI LLaMA 3.3.',
    },
    {
      num: '05',
      icon: 'fa-file-excel',
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/25',
      badge: 'Langkah 5',
      title: 'Riwayat & Ekspor',
      desc: 'Rekapitulasi nilai seluruh kelas dan unduh laporan resmi berformat Microsoft Excel ASKA.',
    },
  ];

  return `
    <div class="min-h-screen w-full bg-slate-950 flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative overflow-x-hidden cursor-pointer select-none animate-fade-in" id="fullSplashPage" onclick="window.app.dismissOnboardingSplash()">
      
      <!-- Background Ambient Glow Effects -->
      <div class="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] bg-pink-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- 1. TOP HEADER & GREETING -->
      <div class="max-w-6xl w-full mx-auto z-10 pt-2 sm:pt-4 text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4 shadow-sm">
          <i class="fa-solid fa-graduation-cap text-indigo-400"></i>
          <span>SMARTEVAL AI &bull; PANDUAN RINGKAS ASESMEN</span>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Selamat Datang, <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">${user.fullName}</span>! 👋
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          ${user.institution} &bull; Sistem evaluasi pembelajaran otomatis dengan sensor OMR presisi tinggi dan diagnostik AI terintegrasi.
        </p>
      </div>

      <!-- 2. THE 5-STEP WORKFLOW CARDS (GRID 5 COLS / RESPONSIVE) -->
      <div class="max-w-6xl w-full mx-auto z-10 my-6 sm:my-8">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          ${steps.map((s, idx) => `
            <div class="glass-card p-5 border-white/10 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between rounded-2xl group shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-11 h-11 rounded-2xl bg-gradient-to-br ${s.gradient} ${s.shadow} text-white flex items-center justify-center text-lg font-black shadow-md group-hover:scale-110 transition-transform">
                    <i class="fa-solid ${s.icon}"></i>
                  </div>
                  <span class="text-xs font-mono font-black text-slate-500 tracking-wider">${s.num}</span>
                </div>

                <span class="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">${s.badge}</span>
                <h3 class="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2">${s.title}</h3>
                <p class="text-[11px] text-slate-400 leading-relaxed">${s.desc}</p>
              </div>

              <div class="pt-3 mt-3 border-t border-white/5 flex items-center text-[10px] text-slate-500 group-hover:text-indigo-300 transition-colors">
                <span>Tahap ${idx + 1} dari 5</span>
                <i class="fa-solid fa-arrow-right ml-auto text-[8px]"></i>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 3. BOTTOM INTERACTIVE BAR & CLICK ANYWHERE PROMPT -->
      <div class="max-w-6xl w-full mx-auto z-10 pb-2 sm:pb-4 text-center">
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          
          <!-- Pulsing Instruction Alert -->
          <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/15 animate-pulse">
            <i class="fa-solid fa-hand-pointer text-indigo-400 text-sm"></i>
            <span>Tekan atau klik di mana saja pada layar untuk langsung masuk ke Halaman Utama</span>
          </div>

          <!-- Direct Start Button -->
          <button type="button" class="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all shrink-0 hover:scale-105" onclick="event.stopPropagation(); window.app.dismissOnboardingSplash();">
            <span>Mulai Asesmen</span>
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        <div class="mt-4">
          <span class="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            🛡 SECURE CLOUD &nbsp;&bull;&nbsp; ✨ AI LLaMA 3.3 ENHANCED &nbsp;&bull;&nbsp; 📱 MULTI-DEVICE READY
          </span>
        </div>
      </div>

    </div>
  `;
}
