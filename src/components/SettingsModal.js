/**
 * =========================================================
 * GROQ API KEY SETTINGS MODAL COMPONENT
 * SmartEval UI Component
 * =========================================================
 */

import { store } from '../state/store.js';

export function renderSettingsModal() {
  const state = store.getState();

  return `
    <div class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 hidden" id="settingsModal">
      <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-[modalPop_0.25s_ease-out]">
        <div class="p-5 border-b border-white/10 flex justify-between items-center">
          <div class="flex items-center gap-2.5">
            <i class="fa-solid fa-key text-indigo-400"></i>
            <h3 class="text-base font-bold text-white">Pengaturan Groq API Key</h3>
          </div>
          <button class="text-slate-400 hover:text-white text-xl leading-none" id="btnCloseSettingsModal">&times;</button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label for="inputGroqApiKey" class="block text-xs font-bold text-slate-300 mb-1.5">
              Groq API Key (Dapatkan gratis di console.groq.com)
            </label>
            <div class="relative flex items-center">
              <input type="password" id="inputGroqApiKey" class="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pr-10 transition-all" placeholder="gsk_..." value="${state.groqApiKey}">
              <button type="button" class="absolute right-3 text-slate-400 hover:text-white" id="btnToggleApiKeyEye">
                <i class="fa-solid fa-eye text-xs"></i>
              </button>
            </div>
            <small class="text-[11px] text-slate-400 mt-2 block leading-relaxed">
              API key disimpan secara lokal di browser Anda untuk memproses inferensi AI LLaMA 3.3 70B secara langsung.
            </small>
          </div>
        </div>

        <div class="p-5 border-t border-white/10 flex justify-end gap-2.5 bg-slate-950/40">
          <button class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-all" id="btnCancelSettings">Batal</button>
          <button class="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all" id="btnSaveSettings">Simpan Pengaturan</button>
        </div>
      </div>
    </div>
  `;
}
