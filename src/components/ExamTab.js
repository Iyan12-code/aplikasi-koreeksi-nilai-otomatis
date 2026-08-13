/**
 * =========================================================
 * TAB 1: KONFIGURASI UJIAN & DATA SISWA (CLEAN & BALANCED)
 * SmartEval Tab Component
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderExamTab() {
  const state = store.getState();
  const totalQ = state.exam.totalQuestions || 25;

  return `
    <section class="tab-panel ${state.activeTab === 'tab-exam' ? 'block' : 'hidden'}" id="tab-exam">
      <div class="mb-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
          <i class="fa-solid fa-layer-group"></i> Langkah 1 dari 5
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Input Data Siswa</h2>
        <p class="text-sm text-slate-400 mt-1">Tentukan mata pelajaran, standar KKM (25 Butir Soal), dan unggah daftar nama siswa.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <!-- Card 1: Form Konfigurasi Ujian -->
        <div class="glass-card p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2.5 pb-4 mb-5 border-b border-white/10">
              <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                <i class="fa-solid fa-sliders"></i>
              </div>
              <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Input Mata pelajaran</h3>
            </div>

            <div class="space-y-5">
              <!-- Mata Pelajaran -->
              <div>
                <label for="examSubject" class="block text-xs font-bold text-slate-300 mb-2">Mata Pelajaran & Kelas</label>
                <input type="text" id="examSubject" value="${state.exam.subject}" placeholder="cth. Bahasa Indonesia Kelas VI" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                
                <div class="flex flex-wrap gap-2 mt-2.5">
                  <button type="button" class="btn-chip" data-subject="Matematika Kelas VI">
                    <i class="fa-solid fa-calculator text-[10px]"></i> Matematika
                  </button>
                  <button type="button" class="btn-chip" data-subject="Bahasa Indonesia Kelas VI">
                    <i class="fa-solid fa-book text-[10px]"></i> Bahasa Indonesia
                  </button>
                  <button type="button" class="btn-chip" data-subject="Ilmu Pengetahuan Alam (IPA)">
                    <i class="fa-solid fa-flask text-[10px]"></i> IPA
                  </button>
                  <button type="button" class="btn-chip" data-subject="Pendidikan Pancasila">
                    <i class="fa-solid fa-landmark text-[10px]"></i> PPKn
                  </button>
                </div>
              </div>

              <!-- Nilai KKM & Format Lembar Jawaban (Fixed 25 Soal) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <!-- Nilai KKM -->
                <div>
                  <label for="examKkm" class="block text-xs font-bold text-slate-300 mb-2">Nilai KKM (Ketuntasan)</label>
                  <input type="number" id="examKkm" value="${state.exam.kkm}" min="0" max="100" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                  <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 mt-2.5">
                    <span class="text-[11px] text-slate-400 block leading-snug">
                      Standar kelulusan: Nilai <strong class="text-emerald-400">≥ ${state.exam.kkm}</strong> dinyatakan <strong>TUNTAS</strong>, di bawahnya <strong>REMEDIAL</strong>.
                    </span>
                  </div>
                </div>

                <!-- Format Lembar Jawaban (25 Butir Soal Tetap) -->
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-2">Format Lembar Jawaban</label>
                  <div class="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-file-circle-check text-indigo-400 text-sm"></i>
                      <span class="text-xs font-extrabold text-indigo-300">25 Butir Soal (PG)</span>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">Standar 5 Kolom</span>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 mt-2.5">
                    <span class="text-[11px] text-slate-400 block leading-snug">
                      Terkalibrasi otomatis untuk lembar LJK 25 nomor (5 kolom × 5 baris).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-4 border-t border-white/10 flex justify-end">
            <button type="button" class="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all" onclick="window.app.goToTab('tab-key')">
              Lanjut ke Kunci & Kisi-kisi <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Card 2: Unggah Data Siswa Excel -->
        <div class="glass-card p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                  <i class="fa-solid fa-file-excel"></i>
                </div>
                <h3 class="text-xs font-extrabold text-white uppercase tracking-wider">Impor Dokumen Analisis</h3>
              </div>
              <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full" id="studentCountBadge">
                ${state.students.length} Siswa Terdaftar
              </span>
            </div>

            <!-- Drag & Dropzone Excel -->
            <div class="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl p-8 text-center cursor-pointer transition-all group" id="excelDropzone">
              <div class="w-14 h-14 rounded-full bg-emerald-500/10 group-hover:scale-110 flex items-center justify-center text-emerald-400 text-2xl mx-auto mb-3 transition-transform shadow-inner">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <h4 class="text-sm font-bold text-white">Unggah Berkas Template / Daftar Siswa (.xlsx)</h4>
              <p class="text-xs text-slate-400 mt-1">Nama siswa akan diekstrak secara otomatis dari lembar kerja spreadsheet.</p>
              <input type="file" id="excelFileInput" accept=".xlsx, .xls" class="hidden">
            </div>

            <!-- Detected Students Badge -->
            <div class="mt-4 p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between ${state.students.length > 0 ? '' : 'hidden'}" id="excelFileBadge">
              <div class="flex items-center gap-2.5 min-w-0">
                <i class="fa-solid fa-circle-check text-emerald-400 text-base"></i>
                <div class="min-w-0">
                  <span class="text-xs font-bold text-slate-200 block truncate" id="excelFileName">Daftar Siswa Kelas Aktif</span>
                  <span class="text-[11px] text-slate-400" id="excelStudentCount">${state.students.length} Siswa Terdeteksi</span>
                </div>
              </div>
              <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">Siap Digunakan</span>
            </div>
          </div>

          <div class="mt-6 p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
            <i class="fa-solid fa-circle-info text-indigo-400 text-xs"></i>
            <span>Daftar siswa ini akan otomatis terhubung saat Anda melakukan koreksi OMR di Langkah 3.</span>
          </div>
        </div>
      </div>
    </section>
  `;
}
