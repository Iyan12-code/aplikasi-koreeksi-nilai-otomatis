/**
 * =========================================================
 * PROFILE MANAGEMENT MODAL (MATCHING MOBILE ACTIVITY_PROFILE)
 * SmartEval Component - Full Teacher Profile & Account Settings
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderProfileModal() {
  const state = store.getState();
  const user = state.currentUser || {
    fullName: 'Budi Santoso, M.Pd',
    email: 'guru@sekolah.sch.id',
    institution: 'SMA Negeri 1 Jakarta',
    role: 'Guru Matematika',
    username: 'budi_guru',
    status: 'Aktif'
  };

  const gradedCount = state.history.length;
  const avgScore = gradedCount > 0 
    ? Math.round(state.history.reduce((sum, h) => sum + h.score, 0) / gradedCount) 
    : 0;

  return `
    <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 hidden" id="profileModal">
      <div class="glass-card max-w-xl w-full p-6 sm:p-8 border-indigo-500/30 bg-slate-950/95 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-modal-pop">
        
        <!-- Close Button -->
        <button type="button" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" id="btnCloseProfileModal">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <!-- PROFILE HEADER CARD (MATCHING MOBILE IV_PROFILE_LARGE) -->
        <div class="flex flex-col items-center text-center pb-6 mb-6 border-b border-white/10">
          <div class="relative mb-3.5 group">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/30 border-2 border-white/20">
              ${user.fullName ? user.fullName.charAt(0) : 'G'}
            </div>
            <div class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-slate-950">
              <i class="fa-solid fa-pen text-[10px]"></i>
            </div>
          </div>

          <h3 class="text-xl font-extrabold text-white tracking-tight" id="dispProfileFullName">${user.fullName}</h3>
          <p class="text-xs text-slate-400 mt-0.5" id="dispProfileInstitution">${user.institution}</p>

          <!-- Badges (Role & Status) -->
          <div class="flex items-center gap-2 mt-3">
            <span class="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold" id="dispProfileRole">
              ${user.role || 'Guru Mata Pelajaran'}
            </span>
            <span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ${user.status || 'Aktif'}
            </span>
          </div>
        </div>

        <!-- STATISTIK ASESMEN GURU -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Siswa Terdaftar</span>
            <strong class="text-base text-white font-extrabold">${state.students.length}</strong>
          </div>
          <div class="p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
            <span class="text-[10px] text-slate-400 uppercase font-bold block">LJK Terkoreksi</span>
            <strong class="text-base text-emerald-400 font-extrabold">${gradedCount}</strong>
          </div>
          <div class="p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Rata-rata Nilai</span>
            <strong class="text-base text-indigo-400 font-extrabold">${avgScore}</strong>
          </div>
        </div>

        <!-- FORM EDIT PROFILE (MATCHING DIALOG_EDIT_PROFILE.XML) -->
        <form id="formEditProfile" onsubmit="event.preventDefault(); window.app.saveProfileChanges();" class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Informasi Profil Personal</span>
            <span class="text-[10px] text-slate-500">*Dapat diubah kapan saja</span>
          </div>

          <!-- 1. Nama Lengkap -->
          <div>
            <label for="profFullName" class="block text-xs font-bold text-slate-300 mb-1.5">Nama Lengkap & Gelar</label>
            <div class="relative flex items-center">
              <i class="fa-solid fa-user absolute left-3.5 text-slate-400 text-xs pointer-events-none"></i>
              <input type="text" id="profFullName" value="${user.fullName}" required placeholder="Contoh: Budi Santoso, M.Pd." class="w-full bg-slate-900 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
            </div>
          </div>

          <!-- 2. Nama Sekolah / Instansi -->
          <div>
            <label for="profInstitution" class="block text-xs font-bold text-slate-300 mb-1.5">Nama Sekolah / Instansi</label>
            <div class="relative flex items-center">
              <i class="fa-solid fa-school absolute left-3.5 text-slate-400 text-xs pointer-events-none"></i>
              <input type="text" id="profInstitution" value="${user.institution}" required placeholder="Contoh: SMA Negeri 1 Jakarta" class="w-full bg-slate-900 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
            </div>
          </div>

          <!-- 3. Peran / Mata Pelajaran -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="profRole" class="block text-xs font-bold text-slate-300 mb-1.5">Peran / Mata Pelajaran</label>
              <div class="relative flex items-center">
                <i class="fa-solid fa-chalkboard-user absolute left-3.5 text-slate-400 text-xs pointer-events-none"></i>
                <input type="text" id="profRole" value="${user.role || 'Guru Matematika'}" required placeholder="Contoh: Guru Matematika" class="w-full bg-slate-900 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
              </div>
            </div>

            <!-- 4. Username / Email -->
            <div>
              <label for="profEmail" class="block text-xs font-bold text-slate-300 mb-1.5">Email Sekolah</label>
              <div class="relative flex items-center">
                <i class="fa-solid fa-envelope absolute left-3.5 text-slate-400 text-xs pointer-events-none"></i>
                <input type="email" id="profEmail" value="${user.email}" required placeholder="nama@sekolah.sch.id" class="w-full bg-slate-900 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
              </div>
            </div>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
            <button type="button" class="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all" onclick="window.app.logout()">
              <i class="fa-solid fa-right-from-bracket"></i> Keluar Akun
            </button>

            <div class="flex items-center gap-2">
              <button type="button" class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all" id="btnCancelProfile">
                Batal
              </button>
              <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all">
                <i class="fa-solid fa-floppy-disk"></i> Simpan Profil
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  `;
}
