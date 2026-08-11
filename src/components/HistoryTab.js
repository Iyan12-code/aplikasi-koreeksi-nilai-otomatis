/**
 * =========================================================
 * TAB 5: RIWAYAT & EKSPOR EXCEL (UPDATE & DELETE ONLY)
 * SmartEval Tab Component
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderHistoryTab() {
  const state = store.getState();
  const kkm = state.exam.kkm || 75;

  return `
    <section class="tab-panel ${state.activeTab === 'tab-history' ? 'block' : 'hidden'}" id="tab-history">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <i class="fa-solid fa-layer-group"></i> Langkah 5 dari 5
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Riwayat Koreksi & Ekspor Excel</h2>
          <p class="text-sm text-slate-400 mt-1">Kelola data penilaian (Lihat Detail Halaman Penuh, Edit Nilai, Hapus) dan unduh laporan resmi ASKA berwarna.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <!-- DELETE ALL: Bersihkan Riwayat -->
          <button type="button" class="px-3.5 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm" onclick="window.app.clearAllHistory()">
            <i class="fa-solid fa-trash-can"></i> Bersihkan Semua
          </button>

          <!-- EXPORT EXCEL -->
          <button type="button" class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all" onclick="window.app.exportExcel()">
            <i class="fa-solid fa-file-excel text-base"></i> Ekspor Excel ASKA
          </button>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="p-5 md:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-2.5">
            <i class="fa-solid fa-table text-indigo-400"></i>
            <h3 class="text-base font-bold text-white">Tabel Rekapitulasi Nilai Siswa (<span id="historyCountBadge">${state.history.length}</span> Data)</h3>
          </div>
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div class="relative flex-1 sm:w-64">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input type="text" id="inputSearchHistory" placeholder="Cari nama siswa / mapel..." class="w-full bg-slate-950/70 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none transition-all">
            </div>
            <select id="filterStatusHistory" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
              <option value="ALL">Semua Status</option>
              <option value="TUNTAS">Tuntas (≥ KKM)</option>
              <option value="REMEDIAL">Remedial (< KKM)</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3.5 font-bold">No</th>
                <th class="px-5 py-3.5 font-bold">Nama Peserta</th>
                <th class="px-5 py-3.5 font-bold">Mata Pelajaran</th>
                <th class="px-5 py-3.5 font-bold">Benar (TC)</th>
                <th class="px-5 py-3.5 font-bold">Salah (FC)</th>
                <th class="px-5 py-3.5 font-bold">Nilai</th>
                <th class="px-5 py-3.5 font-bold">Status KKM</th>
                <th class="px-5 py-3.5 font-bold">Waktu Koreksi</th>
                <th class="px-5 py-3.5 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5" id="historyTableBody">
              ${state.history.length === 0 ? `
                <tr>
                  <td colspan="9" class="text-center py-12 text-slate-500">
                    <i class="fa-solid fa-clipboard-question text-3xl mb-2 block opacity-40"></i>
                    Belum ada riwayat koreksi. Silakan lakukan koreksi OMR di Tab 3.
                  </td>
                </tr>
              ` : state.history.map((item, idx) => `
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
                      <!-- READ / FULL PAGE DETAIL -->
                      <button type="button" class="p-1.5 bg-white/5 hover:bg-indigo-600 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-all" onclick="window.app.openDetailHistoryPage(${item.id})" title="Lihat Halaman Detail Lengkap">
                        <i class="fa-solid fa-eye text-xs"></i>
                      </button>

                      <!-- UPDATE / EDIT -->
                      <button type="button" class="p-1.5 bg-white/5 hover:bg-amber-600 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-all" onclick="window.app.openEditHistoryModal(${item.id})" title="Edit Nilai & Data Siswa">
                        <i class="fa-solid fa-pen-to-square text-xs"></i>
                      </button>

                      <!-- DELETE -->
                      <button type="button" class="p-1.5 bg-white/5 hover:bg-rose-600 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-all" onclick="window.app.deleteHistoryItem(${item.id})" title="Hapus Data Ini">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL EDIT HISTORY (UPDATE ONLY) -->
      <div class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 hidden" id="historyCrudModal">
        <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-[modalPop_0.25s_ease-out]">
          <div class="p-5 border-b border-white/10 flex justify-between items-center bg-slate-950/40">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-pen-to-square text-amber-400"></i>
              <h3 class="text-base font-bold text-white" id="crudModalTitle">Edit Data Nilai Siswa</h3>
            </div>
            <button class="text-slate-400 hover:text-white text-xl leading-none" onclick="window.app.closeHistoryModal()">&times;</button>
          </div>

          <div class="p-6 space-y-4">
            <input type="hidden" id="crudHistoryId">

            <div>
              <label for="crudStudentName" class="block text-xs font-bold text-slate-300 mb-1.5">Nama Siswa</label>
              <input type="text" id="crudStudentName" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
            </div>

            <div>
              <label for="crudSubject" class="block text-xs font-bold text-slate-300 mb-1.5">Mata Pelajaran</label>
              <input type="text" id="crudSubject" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label for="crudCorrectCount" class="block text-xs font-bold text-slate-300 mb-1.5">Benar (TC)</label>
                <input type="number" id="crudCorrectCount" min="0" max="25" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all" oninput="window.app.syncScoreFromCounts()">
              </div>
              <div>
                <label for="crudWrongCount" class="block text-xs font-bold text-slate-300 mb-1.5">Salah (FC)</label>
                <input type="number" id="crudWrongCount" min="0" max="25" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all" oninput="window.app.syncScoreFromCounts()">
              </div>
              <div>
                <label for="crudScore" class="block text-xs font-bold text-slate-300 mb-1.5">Nilai Akhir</label>
                <input type="number" id="crudScore" min="0" max="100" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none transition-all">
              </div>
            </div>
          </div>

          <div class="p-5 border-t border-white/10 flex justify-end gap-2.5 bg-slate-950/40">
            <button type="button" class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-all" onclick="window.app.closeHistoryModal()">Batal</button>
            <button type="button" class="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all" onclick="window.app.saveHistoryModal()">Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </section>
  `;
}
