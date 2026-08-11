/**
 * =========================================================
 * TAB 3: PEMINDAIAN, DAFTAR SISWA KELAS & KOREKSI OMR AI
 * SmartEval Tab Component (DYNAMIC N QUESTIONS)
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderOmrTab() {
  const state = store.getState();
  const omr = state.currentOmrResult;
  const kkm = state.exam.kkm || 75;
  const totalQ = state.exam.totalQuestions || 25;
  const currentStudentName = state.students[state.activeStudentIndex] || 'Siswa';

  // Calculate Class Grading Progress
  const totalStudents = state.students.length;
  const gradedStudentNames = new Set(state.history.map(h => h.studentName));
  const gradedCount = state.students.filter(s => gradedStudentNames.has(s)).length;
  const progressPct = totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0;
  const isClassComplete = totalStudents > 0 && gradedCount === totalStudents;

  // Group questions dynamically by unique material/indicator name
  const topicMap = {};
  state.questionMaterials.slice(0, totalQ).forEach((matName, qIdx) => {
    const key = (matName || `Materi Soal ${qIdx + 1}`).trim();
    if (!topicMap[key]) {
      topicMap[key] = {
        name: key,
        questionIndices: [],
      };
    }
    topicMap[key].questionIndices.push(qIdx);
  });

  const topicList = Object.values(topicMap);

  return `
    <section class="tab-panel ${state.activeTab === 'tab-omr' ? 'block' : 'hidden'}" id="tab-omr">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <i class="fa-solid fa-layer-group"></i> Langkah 3 dari 5
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Pemindaian & Koreksi OMR Siswa (${totalQ} Soal)</h2>
          <p class="text-sm text-slate-400 mt-1">Pilih nama siswa dari daftar kelas, unggah lembar LJK, lalu simpan nilai untuk diekspor ke Excel.</p>
        </div>

        <!-- Tombol Cepat Ekspor Excel Langsung di Tab Koreksi -->
        <button type="button" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all shrink-0" onclick="window.app.exportExcel()">
          <i class="fa-solid fa-file-excel text-base"></i> Ekspor Laporan Excel (${gradedCount}/${totalStudents} Siswa)
        </button>
      </div>

      <!-- BANNER PROGRES KELAS -->
      <div class="glass-card p-5 mb-6 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-slate-900/60">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
              <i class="fa-solid fa-users-viewfinder"></i>
            </div>
            <div>
              <h3 class="text-xs font-bold text-white uppercase tracking-wider">Progres Koreksi Kelas (${state.exam.subject})</h3>
              <p class="text-xs text-slate-400">
                <strong class="text-white">${gradedCount}</strong> dari <strong class="text-white">${totalStudents}</strong> siswa telah selesai dikoreksi (${progressPct}%)
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${isClassComplete ? `
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 animate-pulse">
                <i class="fa-solid fa-circle-check"></i> Seluruh Kelas Selesai!
              </span>
            ` : `
              <span class="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                Tersisa ${totalStudents - gradedCount} Siswa
              </span>
            `}
          </div>
        </div>

        <div class="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 rounded-full" style="width: ${progressPct}%;"></div>
        </div>
      </div>

      <!-- DAFTAR SISWA KELAS (INTERACTIVE ROSTER) -->
      <div class="glass-card p-5 mb-6">
        <div class="flex justify-between items-center pb-3 mb-3.5 border-b border-white/10">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-address-book text-indigo-400"></i>
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-300">Pilih Siswa yang Sedang Dikoreksi:</h3>
          </div>
          <span class="text-xs text-slate-400">Klik nama siswa untuk mulai mengoreksi LJK-nya</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1" id="studentRosterContainer">
          ${state.students.map((name, idx) => {
            const isSelected = idx === state.activeStudentIndex;
            const historyData = state.history.find(h => h.studentName === name);
            const isGraded = !!historyData;
            const isTuntas = isGraded && historyData.score >= kkm;

            return `
              <button type="button" class="flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]' : (isGraded ? 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/5' : 'bg-slate-950/60 border-dashed border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-white')}" onclick="window.app.selectStudent(${idx})">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}">
                    ${idx + 1}
                  </span>
                  <div class="min-w-0">
                    <strong class="text-xs block truncate ${isSelected ? 'text-white' : 'text-slate-200'}">${name}</strong>
                    <span class="text-[10px] block ${isGraded ? (isTuntas ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold') : 'text-slate-500'}">
                      ${isGraded ? `Nilai: ${historyData.score} (${isTuntas ? 'Tuntas' : 'Remedial'})` : 'Belum Dikoreksi'}
                    </span>
                  </div>
                </div>

                <div class="shrink-0 ml-2">
                  ${isGraded ? (isTuntas ? '<i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i>' : '<i class="fa-solid fa-circle-exclamation text-rose-400 text-sm"></i>') : '<i class="fa-regular fa-circle text-slate-600 text-sm"></i>'}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- WORKSPACE KOREKSI OMR SISWA AKTIF -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Area Input Foto LJK Siswa Aktif -->
        <div class="glass-card p-6">
          <div class="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-file-image text-indigo-400"></i>
              <div>
                <h3 class="text-sm font-bold text-white">Unggah Lembar LJK (${totalQ} Soal): <span class="text-indigo-300 font-extrabold underline">${currentStudentName}</span></h3>
              </div>
            </div>
          </div>

          <!-- Dropzone Foto LJK -->
          <div class="border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-2xl p-8 text-center cursor-pointer transition-all group" id="ljkDropzone">
            <div class="w-14 h-14 rounded-full bg-indigo-500/10 group-hover:scale-110 flex items-center justify-center text-indigo-400 text-2xl mx-auto mb-3 transition-transform">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h4 class="text-sm font-bold text-white">Pilih / Tarik Foto Lembar LJK Milik ${currentStudentName}</h4>
            <p class="text-xs text-slate-400 mt-1">Mendukung format JPG, JPEG, atau PNG (${totalQ} Soal)</p>
            <input type="file" id="ljkFileInput" accept="image/*" class="hidden">
          </div>

          <!-- Preview Wrapper -->
          <div class="relative max-h-80 rounded-2xl overflow-hidden border border-white/10 bg-black mt-4 hidden" id="ljkPreviewWrapper">
            <img id="ljkPreviewImg" src="" alt="LJK Preview" class="w-full h-full object-contain">
            <button type="button" class="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/70 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors" id="btnResetLjkImg" title="Ganti Foto">
              <i class="fa-solid fa-arrows-rotate text-xs"></i>
            </button>
          </div>

          <button type="button" class="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all" id="btnRunOmr">
            <i class="fa-solid fa-brain"></i> Jalankan Koreksi Otomatis (${totalQ} Soal)
          </button>
        </div>

        <!-- Area Hasil Sensor OMR & Nilai Siswa Aktif -->
        <div class="glass-card p-6">
          <div class="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-square-poll-vertical text-indigo-400"></i>
              <h3 class="text-sm font-bold text-white">Hasil Koreksi: <span class="text-indigo-300 font-extrabold">${currentStudentName}</span></h3>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center text-xs" onclick="window.app.prevStudent()" title="Siswa Sebelumnya">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <span class="text-xs font-bold text-slate-400 px-2">Siswa ${state.activeStudentIndex + 1} / ${totalStudents}</span>
              <button type="button" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center text-xs" onclick="window.app.nextStudent()" title="Siswa Berikutnya">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Score Banner -->
          <div class="bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 p-5 rounded-2xl shadow-inner flex justify-between items-center mb-4">
            <div>
              <span class="text-xs font-semibold text-slate-400 block">Nilai Siswa (${currentStudentName})</span>
              <div class="flex items-baseline gap-1.5 mt-0.5">
                <span class="text-4xl font-extrabold text-white leading-none">${omr ? omr.score : 0}</span>
                <span class="text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <span class="text-xs font-extrabold mt-1 block ${omr ? (omr.score >= kkm ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-400'}">
                ${omr ? (omr.score >= kkm ? `✔ TUNTAS KKM (≥ ${kkm})` : `✖ BELUM TUNTAS (< ${kkm})`) : 'Belum Dikoreksi'}
              </span>
            </div>
            <div class="space-y-2">
              <div class="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/5 text-xs font-bold text-emerald-400 flex items-center gap-2">
                <i class="fa-solid fa-circle-check"></i> <span>${omr ? omr.correctCount : 0}/${totalQ} Benar</span>
              </div>
              <div class="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/5 text-xs font-bold text-rose-400 flex items-center gap-2">
                <i class="fa-solid fa-circle-xmark"></i> <span>${omr ? omr.wrongCount : 0}/${totalQ} Salah</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Topic Mastery Progress Bars -->
          <div class="mb-4">
            <h4 class="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <i class="fa-solid fa-chart-simple text-indigo-400"></i> Penguasaan per Indikator Pembelajaran:
            </h4>
            <div class="space-y-2 max-h-44 overflow-y-auto p-1">
              ${topicList.map(topic => {
                const totalTopicQ = topic.questionIndices.length;
                let correctTopicQ = 0;

                if (omr && omr.detectedAnswers) {
                  topic.questionIndices.forEach(qIdx => {
                    const ans = omr.detectedAnswers[qIdx];
                    if (ans && ans.isCorrect) correctTopicQ++;
                  });
                }

                const pct = omr ? Math.round((correctTopicQ / totalTopicQ) * 100) : 0;
                const isMastered = pct >= 75;
                const qRangeText = topic.questionIndices.map(i => i + 1).join(', ');

                return `
                  <div>
                    <div class="flex justify-between text-[11px] font-semibold mb-1">
                      <span class="text-slate-300 truncate max-w-[220px]" title="${topic.name}">${topic.name} <span class="text-slate-500">(Soal ${qRangeText})</span></span>
                      <span class="${isMastered ? 'text-emerald-400' : 'text-rose-400'} font-bold shrink-0">${pct}% (${correctTopicQ}/${totalTopicQ} Soal)</span>
                    </div>
                    <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700 ${isMastered ? 'bg-emerald-500' : 'bg-rose-500'}" style="width: ${pct}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Dynamic Question Result Matrix Grid (1 to N) -->
          <h4 class="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-list-ol text-indigo-400"></i> Rincian ${totalQ} Butir Soal (${currentStudentName}):
          </h4>
          <div class="grid grid-cols-4 sm:grid-cols-5 gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-white/10 text-xs max-h-48 overflow-y-auto">
            ${Array.from({ length: totalQ }).map((_, idx) => {
              const item = (omr && omr.detectedAnswers) ? omr.detectedAnswers[idx] : null;
              const isCorrect = item ? item.isCorrect : false;
              return `
                <div class="flex items-center justify-between px-2 py-1 rounded text-[11px] font-bold ${item ? (isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20') : 'bg-white/5 text-slate-500'}">
                  <span>${idx + 1}. ${item ? item.studentAnswer : '-'}</span>
                  <span>${item ? (isCorrect ? '✔' : '✖') : ''}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-5">
            <button type="button" class="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 transition-all shadow-sm" onclick="window.app.saveToHistory()">
              <i class="fa-solid fa-floppy-disk"></i> Simpan Nilai ${currentStudentName}
            </button>
            <button type="button" class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all" onclick="window.app.goToTab('tab-analysis'); window.app.generateAIAnalysis();">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Analisis AI <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
