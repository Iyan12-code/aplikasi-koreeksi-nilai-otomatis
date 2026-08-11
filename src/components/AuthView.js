/**
 * =========================================================
 * AUTHENTICATION VIEW: LOGIN & REGISTER (EXACT MOBILE FIELDS)
 * SmartEval Auth Component matching Android XML layouts
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderAuthView() {
  const state = store.getState();
  const isRegister = state.authMode === 'register';

  return `
    <div class="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-md z-10">
        <!-- Logo & App Header -->
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-indigo-500/25 border border-white/20">
            <i class="fa-solid fa-graduation-cap text-2xl text-white"></i>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-white">Koreksi Nilai Otomatis</h1>
          <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            ${isRegister ? 'Daftar sekarang untuk mulai mengotomatiskan penilaian tugas siswa Anda dengan presisi tinggi.' : 'Masuk ke akun pendidik Anda'}
          </p>
        </div>

        <!-- MAIN CARD CONTAINER (MATCHING MATERIAL CARD VIEW) -->
        <div class="glass-card p-6 sm:p-8 border-white/10 shadow-2xl relative">
          ${isRegister ? renderRegisterForm() : renderLoginForm()}
        </div>

        <!-- FOOTER (MATCHING MOBILE FOOTER) -->
        <div class="text-center mt-6">
          <span class="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            🛡 SECURE CLOUD &nbsp;&bull;&nbsp; ✨ AI ENHANCED
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderLoginForm() {
  return `
    <form id="formLogin" onsubmit="event.preventDefault(); window.app.handleLogin();" class="space-y-4">
      <!-- Field 1: Alamat Email -->
      <div>
        <label for="loginEmail" class="block text-xs font-bold text-slate-200 mb-1.5">Alamat Email</label>
        <div class="relative flex items-center">
          <i class="fa-solid fa-envelope absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
          <input type="email" id="loginEmail" value="guru@sekolah.sch.id" required placeholder="nama@sekolah.sch.id" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
        </div>
      </div>

      <!-- Field 2: Kata Sandi -->
      <div>
        <label for="loginPassword" class="block text-xs font-bold text-slate-200 mb-1.5">Kata Sandi</label>
        <div class="relative flex items-center">
          <i class="fa-solid fa-lock absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
          <input type="password" id="loginPassword" value="12345678" required placeholder="••••••••" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
          <button type="button" class="absolute right-3 text-slate-400 hover:text-white text-xs" onclick="window.app.togglePasswordVisibility('loginPassword')">
            <i class="fa-solid fa-eye" id="icon-loginPassword"></i>
          </button>
        </div>
      </div>

      <!-- Checkbox & Forgot Password -->
      <div class="flex items-center justify-between text-xs pt-1">
        <label class="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
          <input type="checkbox" id="loginRemember" checked class="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-indigo-500/20">
          <span>Ingat Saya</span>
        </label>
        <a href="javascript:void(0)" onclick="window.app.showForgotToast()" class="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Lupa Sandi?</a>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all mt-2">
        <span>Masuk</span> <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>

      <!-- Switch to Register -->
      <div class="text-center pt-3 text-xs text-slate-400">
        Belum memiliki akun?
        <button type="button" class="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors" onclick="window.app.setAuthMode('register')">
          Daftar Sekarang
        </button>
      </div>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form id="formRegister" onsubmit="event.preventDefault(); window.app.handleRegister();" class="space-y-3.5">
      <!-- Field 1: Nama Lengkap -->
      <div>
        <label for="regFullName" class="block text-xs font-bold text-slate-200 mb-1.5">Nama Lengkap</label>
        <div class="relative flex items-center">
          <i class="fa-solid fa-user absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
          <input type="text" id="regFullName" required placeholder="Contoh: Budi Santoso, M.Pd" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
        </div>
      </div>

      <!-- Field 2: Email Sekolah / Pribadi -->
      <div>
        <label for="regEmail" class="block text-xs font-bold text-slate-200 mb-1.5">Email Sekolah / Pribadi</label>
        <div class="relative flex items-center">
          <i class="fa-solid fa-circle-user absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
          <input type="email" id="regEmail" required placeholder="nama@sekolah.sch.id" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
        </div>
      </div>

      <!-- Field 3: Nama Institusi / Sekolah -->
      <div>
        <label for="regInstitution" class="block text-xs font-bold text-slate-200 mb-1.5">Nama Institusi / Sekolah</label>
        <div class="relative flex items-center">
          <i class="fa-solid fa-school absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
          <input type="text" id="regInstitution" required placeholder="Nama SMA/SMP/Universitas" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
        </div>
      </div>

      <!-- Field 4: Kata Sandi -->
      <div>
        <label for="regPassword" class="block text-xs font-bold text-slate-200 mb-1.5">Kata Sandi</label>
        <div class="relative flex items-center">
          <i class="fa-solid fa-lock absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
          <input type="password" id="regPassword" required placeholder="••••••••" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
          <button type="button" class="absolute right-3 text-slate-400 hover:text-white text-xs" onclick="window.app.togglePasswordVisibility('regPassword')">
            <i class="fa-solid fa-eye" id="icon-regPassword"></i>
          </button>
        </div>
      </div>

      <!-- Field 5: Konfirmasi Sandi -->
      <div>
        <label for="regConfirmPassword" class="block text-xs font-bold text-slate-200 mb-1.5">Konfirmasi Sandi</label>
        <div class="relative flex items-center">
          <i class="fa-solid fa-shield-halved absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
          <input type="password" id="regConfirmPassword" required placeholder="••••••••" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
          <button type="button" class="absolute right-3 text-slate-400 hover:text-white text-xs" onclick="window.app.togglePasswordVisibility('regConfirmPassword')">
            <i class="fa-solid fa-eye" id="icon-regConfirmPassword"></i>
          </button>
        </div>
      </div>

      <!-- Checkbox Terms -->
      <div class="flex items-start gap-2 pt-1">
        <input type="checkbox" id="regTerms" required checked class="mt-0.5 rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-indigo-500/20">
        <label for="regTerms" class="text-[11px] text-slate-400 cursor-pointer select-none">
          Saya setuju dengan <a href="javascript:void(0)" class="text-indigo-400 underline">Ketentuan Layanan</a> dan <a href="javascript:void(0)" class="text-indigo-400 underline">Kebijakan Privasi</a>.
        </label>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all mt-3">
        <span>Daftar</span> <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>

      <!-- Switch to Login -->
      <div class="text-center pt-2 text-xs text-slate-400">
        Sudah memiliki akun?
        <button type="button" class="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors" onclick="window.app.setAuthMode('login')">
          Masuk
        </button>
      </div>
    </form>
  `;
}
