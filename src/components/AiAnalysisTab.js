/**
 * =========================================================
 * TAB 4: ANALISIS DIAGNOSTIK AI (LLaMA 3.3 via Groq)
 * SmartEval Tab Component
 * =========================================================
 */

import { store } from '../state/store.js';
import { marked } from 'marked';

export function renderAiAnalysisTab() {
  const state = store.getState();
  const currentStudentName = state.students[state.activeStudentIndex] || 'Siswa';

  return `
    <section class="tab-panel ${state.activeTab === 'tab-analysis' ? 'block' : 'hidden'}" id="tab-analysis">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <i class="fa-solid fa-layer-group"></i> Langkah 4 dari 5
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Analisis Diagnostik AI (LLaMA 3.3 via Groq)</h2>
          <p class="text-sm text-slate-400 mt-1">Evaluasi mendalam per materi indikator kisi-kisi, saran remedial, dan strategi pembelajaran guru di kelas.</p>
        </div>
        <button class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all shrink-0" onclick="window.app.generateAIAnalysis()">
          <i class="fa-solid fa-arrows-rotate"></i> Regenerasi Analisis AI
        </button>
      </div>

      <div class="glass-card p-6">
        <div class="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-full flex items-center gap-1.5">
              <i class="fa-solid fa-microchip"></i> LLaMA 3.3 70B Versatile
            </span>
            <span class="text-xs font-bold text-slate-300">Target Siswa: <span class="text-white font-extrabold">${currentStudentName}</span></span>
          </div>
          <button class="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all" onclick="window.app.copyAiReport()">
            <i class="fa-solid fa-copy text-indigo-400"></i> Salin Laporan
          </button>
        </div>

        <!-- AI Loading Spinner State -->
        ${state.isAiLoading ? `
          <div class="text-center py-16" id="aiLoadingSpinner">
            <div class="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h4 class="text-base font-bold text-white">AI sedang membedah pola kesalahan dan indikator kisi-kisi...</h4>
            <p class="text-xs text-slate-400 mt-1">Menghubungkan nomor soal salah ${currentStudentName} dengan Kompetensi Dasar & indikator pembelajaran...</p>
          </div>
        ` : `
          <!-- AI Markdown Content Output -->
          <div class="markdown-content bg-slate-950/70 border border-white/10 rounded-2xl p-6 md:p-8 text-sm" id="aiReportContent">
            ${state.latestAiText ? marked.parse(state.latestAiText) : `
              <div class="text-center py-12">
                <i class="fa-solid fa-robot text-4xl text-slate-600 mb-3 block"></i>
                <h3 class="text-base font-bold text-slate-300">Belum Ada Hasil Analisis AI</h3>
                <p class="text-xs text-slate-500 mt-1">Silakan lakukan koreksi OMR pada Tab 3, lalu klik tombol "Analisis AI Diagnostik".</p>
              </div>
            `}
          </div>
        `}

        <div class="mt-6 flex justify-end">
          <button class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all" onclick="window.app.goToTab('tab-history')">
            Buka Riwayat & Ekspor Excel <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  `;
}
