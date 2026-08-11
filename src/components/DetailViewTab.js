/**
 * =========================================================
 * FULL-PAGE DETAIL VIEW (WITHOUT SIDEBAR - DYNAMIC N QUESTIONS)
 * SmartEval Detailed Student Assessment & AI Diagnostic View
 * =========================================================
 */

import { store } from '../state/store.js';
import { marked } from 'marked';

export function renderDetailViewTab() {
  const state = store.getState();
  const isDetailActive = state.activeTab === 'tab-detail';
  const item = state.history.find(h => h.id === state.selectedHistoryDetailId) || state.history[0];
  const kkm = state.exam.kkm || 75;
  const totalQ = state.exam.totalQuestions || 25;

  if (!isDetailActive || !item) {
    return `<section class="tab-panel hidden" id="tab-detail"></section>`;
  }

  const isTuntas = item.score >= kkm;
  const answersList = (item.answers && item.answers.length > 0)
    ? item.answers.slice(0, totalQ)
    : Array.from({ length: totalQ }).map((_, i) => ({
        questionNumber: i + 1,
        studentAnswer: '-',
        isCorrect: false
      }));

  return `
    <section class="tab-panel block w-full max-w-6xl mx-auto py-4" id="tab-detail">
      <!-- TOP NAVIGATION BAR -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button type="button" class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 transition-all group" onclick="window.app.backToHistory()">
          <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Kembali ke Riwayat Penilaian
        </button>

        <div class="flex items-center gap-2">
          <button type="button" class="px-3.5 py-2 bg-white/5 hover:bg-amber-600 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all" onclick="window.app.openEditHistoryModal(${item.id})">
            <i class="fa-solid fa-pen-to-square"></i> Edit Nilai
          </button>
          <button type="button" class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all" onclick="window.app.exportExcel()">
            <i class="fa-solid fa-file-excel"></i> Ekspor Excel ASKA (${totalQ} Soal)
          </button>
        </div>
      </div>

      <!-- STUDENT SCORE SUMMARY BANNER -->
      <div class="glass-card p-6 md:p-8 mb-6 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-slate-900/60">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30 shrink-0">
              ${item.studentName.charAt(0)}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">${item.studentName}</h2>
                <span class="px-3 py-1 rounded-full text-xs font-extrabold ${isTuntas ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'}">
                  ${isTuntas ? '✔ TUNTAS KKM' : '✖ BELUM TUNTAS'}
                </span>
              </div>
              <p class="text-xs text-slate-300 flex items-center gap-3">
                <span><i class="fa-solid fa-book-open text-indigo-400 mr-1"></i> ${item.subject} (${totalQ} Soal PG)</span>
                <span><i class="fa-regular fa-clock text-slate-400 mr-1"></i> ${item.date}</span>
              </p>
            </div>
          </div>

          <!-- Score Counter -->
          <div class="flex items-center gap-4 bg-slate-950/70 px-6 py-4 rounded-2xl border border-white/10 shrink-0">
            <div class="text-center pr-4 border-r border-white/10">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Nilai Akhir</span>
              <span class="text-3xl md:text-4xl font-black text-white">${item.score}</span>
            </div>
            <div class="space-y-1 text-xs font-bold">
              <div class="text-emerald-400 flex items-center gap-1.5">
                <i class="fa-solid fa-circle-check"></i> ${item.correctCount}/${totalQ} Benar
              </div>
              <div class="text-rose-400 flex items-center gap-1.5">
                <i class="fa-solid fa-circle-xmark"></i> ${item.wrongCount}/${totalQ} Salah
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2-COLUMN WORKSPACE: DYNAMIC N QUESTIONS MATRIX & AI REPORT -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- N Questions Result Matrix -->
        <div class="glass-card p-6 lg:col-span-1 h-fit">
          <div class="flex justify-between items-center pb-3 mb-4 border-b border-white/10">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-list-ol text-indigo-400"></i>
              <h3 class="text-sm font-bold text-white">Rincian ${totalQ} Soal</h3>
            </div>
            <span class="text-[11px] text-slate-400">${item.correctCount}/${totalQ} Benar</span>
          </div>

          <div class="grid grid-cols-4 sm:grid-cols-5 gap-1.5 bg-slate-950/70 p-3 rounded-xl border border-white/10 text-xs max-h-80 overflow-y-auto">
            ${answersList.map(ans => `
              <div class="flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-bold ${ans.isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                <span>${ans.questionNumber}. ${ans.studentAnswer}</span>
                <span>${ans.isCorrect ? '✔' : '✖'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Full AI Diagnostic Report -->
        <div class="glass-card p-6 md:p-8 lg:col-span-2">
          <div class="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-microchip text-indigo-400"></i>
              <h3 class="text-base font-bold text-white">Analisis Diagnostik AI & Rekomendasi Guru</h3>
            </div>
            <button type="button" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all" onclick="window.app.copyAiReport()">
              <i class="fa-solid fa-copy text-indigo-400"></i> Salin Laporan
            </button>
          </div>

          <div class="markdown-content bg-slate-950/70 border border-white/10 rounded-2xl p-6 md:p-8 text-sm">
            ${item.aiReport ? marked.parse(item.aiReport) : `
              <div class="text-center py-10 text-slate-500">
                <i class="fa-solid fa-robot text-3xl mb-2 block opacity-40"></i>
                <p>Belum ada catatan analisis diagnostik AI yang tersimpan untuk siswa ini.</p>
                <button type="button" class="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold" onclick="window.app.generateAIAnalysis()">
                  Jalankan Analisis AI Sekarang
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    </section>
  `;
}
