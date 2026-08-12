/**
 * =========================================================
 * TAB 2: KUNCI JAWABAN & INDIKATOR KISI-KISI (DYNAMIC N QUESTIONS)
 * SmartEval Tab Component
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderAnswerKeyTab() {
  const state = store.getState();
  const totalQ = state.exam.totalQuestions || 25;
  const options = ['A', 'B', 'C', 'D'];

  return `
    <section class="tab-panel ${state.activeTab === 'tab-key' ? 'block' : 'hidden'}" id="tab-key">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <i class="fa-solid fa-layer-group"></i> Langkah 2 dari 5
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Input Kunci Jawaban & Indikator Materi (${totalQ} Soal)</h2>
          <p class="text-sm text-slate-400 mt-1">Atur opsi kunci jawaban (A/B/C/D) dan nama materi indikator pembelajaran untuk masing-masing butir soal.</p>
        </div>

        <!-- Quick Key Actions -->
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button type="button" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 transition-all" onclick="window.app.quickFillKeys('A')">Set Semua A</button>
          <button type="button" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 transition-all" onclick="window.app.quickFillKeys('B')">Set Semua B</button>
          <button type="button" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 transition-all" onclick="window.app.quickFillKeys('C')">Set Semua C</button>
          <button type="button" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 transition-all" onclick="window.app.quickFillKeys('D')">Set Semua D</button>
        </div>
      </div>

      <!-- BATCH MATERIAL ASSIGNER TOOLBAR -->
      <div class="glass-card p-4 md:p-5 mb-6 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-slate-900/60">
        <div class="flex items-center gap-2 mb-2.5">
          <i class="fa-solid fa-wand-magic-sparkles text-indigo-400 text-sm"></i>
          <h3 class="text-xs font-bold text-white uppercase tracking-wider">Masukan Materi Rentang Soal</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          <div class="sm:col-span-6">
            <input type="text" id="batchMaterialName" placeholder="Contoh: Operasi Aljabar Linier / Trigonometri" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
          </div>
          <div class="sm:col-span-2 flex items-center gap-1.5">
            <span class="text-xs text-slate-400 font-bold shrink-0">Dari:</span>
            <input type="number" id="batchStartQ" value="1" min="1" max="${totalQ}" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500">
          </div>
          <div class="sm:col-span-2 flex items-center gap-1.5">
            <span class="text-xs text-slate-400 font-bold shrink-0">S/d:</span>
            <input type="number" id="batchEndQ" value="${Math.min(5, totalQ)}" min="1" max="${totalQ}" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-bold text-center focus:outline-none focus:border-indigo-500">
          </div>
          <div class="sm:col-span-2">
            <button type="button" class="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5" onclick="window.app.applyBatchMaterial()">
              <i class="fa-solid fa-check"></i> Terapkan
            </button>
          </div>
        </div>
      </div>

      <!-- DYNAMIC QUESTION CARDS GRID (1 TO N) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5" id="answerKeyGrid">
        ${Array.from({ length: totalQ }).map((_, idx) => {
          const currentKey = state.answerKeys[idx] || 'A';
          const currentMat = state.questionMaterials[idx] || '';

          return `
            <div class="glass-card p-3.5 flex flex-col justify-between border-white/10 hover:border-indigo-500/40 transition-all group">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-black text-white px-2 py-0.5 rounded-md bg-white/10">
                    No. ${(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span class="text-[11px] font-bold text-indigo-400">Kunci: <strong class="text-white">${currentKey}</strong></span>
                </div>

                <!-- 4 Options Bubble (A, B, C, D) -->
                <div class="grid grid-cols-4 gap-1.5 my-2">
                  ${options.map(opt => `
                    <button type="button" class="h-8 rounded-lg font-black text-xs transition-all flex items-center justify-center ${currentKey === opt ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 scale-105' : 'bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:border-white/30'}" onclick="window.app.setKey(${idx}, '${opt}')">
                      ${opt}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Individual Material Input -->
              <div class="mt-2 pt-2 border-t border-white/5">
                <input type="text" value="${currentMat}" data-qindex="${idx}" placeholder="Materi Soal ${idx + 1}" class="q-material-input w-full bg-slate-950/60 border border-white/10 focus:border-indigo-500 rounded-lg px-2 py-1 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none transition-all">
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="mt-6 flex justify-between items-center">
        <button type="button" class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200" onclick="window.app.goToTab('tab-exam')">
          <i class="fa-solid fa-arrow-left mr-1"></i> Kembali ke Konfigurasi
        </button>
        <button type="button" class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all" onclick="window.app.goToTab('tab-omr')">
          Lanjut ke Koreksi Siswa<i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>
  `;
}
