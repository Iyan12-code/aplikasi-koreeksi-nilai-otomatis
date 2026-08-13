/**
 * =========================================================
 * TAB 2: KISI-KISI & KUNCI JAWABAN (100% OTOMATIS DARI DOKUMEN)
 * SmartEval Tab Component - Zero Manual Typing for Teachers
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderAnswerKeyTab() {
  const state = store.getState();
  const totalQ = 25;
  const options = ['A', 'B', 'C', 'D'];

  return `
    <section class="tab-panel ${state.activeTab === 'tab-key' ? 'block' : 'hidden'}" id="tab-key">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <i class="fa-solid fa-layer-group"></i> Langkah 2 dari 5
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Kisi-Kisi Soal & Kunci Jawaban (Otomatis)</h2>
          <p class="text-sm text-slate-400 mt-1">Cukup unggah dokumen kisi-kisi sekali. Seluruh 25 materi, indikator, level kognitif, dan kunci jawaban akan terbaca otomatis oleh sistem.</p>
        </div>

        <button type="button" class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all shrink-0" onclick="window.app.goToTab('tab-omr')">
          Lanjut ke Koreksi Siswa <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <!-- KISI-KISI AUTO-IMPORT TOOLBAR (1-CLICK UPLOAD) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <!-- Card 1: Upload Excel Kisi-Kisi -->
        <div class="glass-card p-5 lg:col-span-2 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-slate-900/60 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                  <i class="fa-solid fa-file-word text-blue-400"></i>
                </div>
                <div>
                  <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Unggah Dokumen Kisi-Kisi (Word .docx / Excel .xlsx)</h3>
                  <span class="text-[11px] text-slate-400">Ekstraksi otomatis 25 materi & indikator untuk analisis AI</span>
                </div>
              </div>
              <button type="button" class="text-[11px] text-indigo-300 hover:text-indigo-200 underline font-bold flex items-center gap-1" onclick="window.app.downloadKisiKisiTemplate()">
                <i class="fa-solid fa-download"></i> Unduh Format Template
              </button>
            </div>

            <!-- Upload Dropzone Kisi-Kisi -->
            <div class="border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 bg-slate-950/60 hover:bg-indigo-500/5 rounded-2xl p-5 text-center cursor-pointer transition-all group" id="kisiKisiDropzone">
              <div class="flex items-center justify-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-500/10 group-hover:scale-110 flex items-center justify-center text-indigo-400 text-xl transition-transform shadow-inner">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <div class="text-left">
                  <span class="text-sm font-bold text-white block">Klik atau Tarik Dokumen Kisi-Kisi (Word atau Excel) ke Sini</span>
                  <span class="text-xs text-slate-400 block mt-0.5">Mendukung berkas <strong>.docx (Word)</strong> dan <strong>.xlsx / .xls (Excel)</strong>. Sistem membaca KD, Materi, Level, & Indikator secara instan.</span>
                </div>
              </div>
              <input type="file" id="kisiKisiFileInput" accept=".docx, .xlsx, .xls, .csv" class="hidden">
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-bolt text-amber-400"></i> Zero Manual Input: AI akan langsung mengevaluasi siswa berdasarkan indikator yang diunggah.</span>
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-xs" id="kisiKisiStatusBadge">
              <i class="fa-solid fa-circle-check mr-1"></i> 25 Indikator Siap Digunakan
            </span>
          </div>
        </div>

        <!-- Card 2: Preset Resmi & Informasi -->
        <div class="glass-card p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Preset Kisi-Kisi Resmi</h3>
            </div>
            <p class="text-xs text-slate-400 mb-4 leading-relaxed">Gunakan kisi-kisi Asesmen Sumatif (ASS-SD) yang sudah terverifikasi tanpa perlu unggah dokumen:</p>
            
            <button type="button" class="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mb-2" onclick="window.app.applyIpsKisiKisiPreset()">
              <i class="fa-solid fa-book-bookmark"></i> Muat Kisi-Kisi IPS ASS-SD Resmi
            </button>
          </div>

          <div class="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-shield-check text-emerald-400"></i>
            <span>Sesuai standar kurikulum nasional 25 butir soal PG.</span>
          </div>
        </div>
      </div>

      <!-- AUTOMATED PREVIEW TABLE (READ-ONLY DISPLAY - NO MANUAL TYPING) -->
      <div class="glass-card p-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <i class="fa-solid fa-table-list text-indigo-400 text-base"></i>
            <h3 class="text-sm font-bold text-white">Daftar Materi & Indikator Pembelajaran Terbaca (${totalQ} Soal)</h3>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400">Ganti Kunci Jawaban Cepat:</span>
            <div class="inline-flex rounded-lg bg-white/5 border border-white/10 p-0.5">
              <button type="button" class="px-2 py-0.5 text-[11px] text-slate-300 hover:text-white rounded hover:bg-white/10" onclick="window.app.quickFillKeys('A')">Semua A</button>
              <button type="button" class="px-2 py-0.5 text-[11px] text-slate-300 hover:text-white rounded hover:bg-white/10" onclick="window.app.quickFillKeys('B')">Semua B</button>
              <button type="button" class="px-2 py-0.5 text-[11px] text-slate-300 hover:text-white rounded hover:bg-white/10" onclick="window.app.quickFillKeys('C')">Semua C</button>
              <button type="button" class="px-2 py-0.5 text-[11px] text-slate-300 hover:text-white rounded hover:bg-white/10" onclick="window.app.quickFillKeys('D')">Semua D</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" id="answerKeyGrid">
          ${Array.from({ length: totalQ }).map((_, idx) => {
            const currentKey = state.answerKeys[idx] || 'A';
            const currentMat = state.questionMaterials[idx] || `Materi Soal ${idx + 1}`;
            const currentInd = state.questionIndicators[idx] || currentMat;
            const currentKd = state.questionKDs[idx] || '';
            const currentLvl = state.questionLevels[idx] || 'L1';

            return `
              <div class="bg-slate-950/70 border border-white/10 hover:border-indigo-500/40 rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
                <div>
                  <!-- Header: Nomor Soal + Level + Kunci Options -->
                  <div class="flex justify-between items-center mb-2.5">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-black text-white px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30">
                        No. ${(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${currentLvl === 'L3' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : (currentLvl === 'L2' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')}">
                        ${currentLvl}
                      </span>
                    </div>

                    <!-- Kunci Jawaban Toggle (A/B/C/D) -->
                    <div class="flex items-center gap-1">
                      ${options.map(opt => `
                        <button type="button" class="w-6 h-6 rounded-md font-bold text-[11px] transition-all flex items-center justify-center ${currentKey === opt ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm' : 'bg-white/5 text-slate-400 hover:text-white'}" onclick="window.app.setKey(${idx}, '${opt}')">
                          ${opt}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Tujuan Pembelajaran / KD (Otomatis) -->
                  ${currentKd ? `
                    <div class="mb-2 p-1.5 rounded-md bg-indigo-500/5 border border-indigo-500/15">
                      <span class="text-[9px] font-bold text-indigo-300 uppercase tracking-wider block">Tujuan Pembelajaran / KD:</span>
                      <p class="text-[11px] font-semibold text-slate-200 mt-0.5 leading-snug line-clamp-2" title="${currentKd}">${currentKd}</p>
                    </div>
                  ` : `
                    <div class="mb-2">
                      <span class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Materi Pokok:</span>
                      <p class="text-xs font-bold text-white mt-0.5 leading-snug">${currentMat}</p>
                    </div>
                  `}

                  <!-- Indikator Pembelajaran (Otomatis) -->
                  <div class="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Indikator Soal:</span>
                    <p class="text-[11px] text-slate-300 leading-relaxed">${currentInd}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <button type="button" class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200" onclick="window.app.goToTab('tab-exam')">
            <i class="fa-solid fa-arrow-left mr-1"></i> Kembali ke Data Siswa
          </button>
          <button type="button" class="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all" onclick="window.app.goToTab('tab-omr')">
            Lanjut ke Koreksi Siswa <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  `;
}
