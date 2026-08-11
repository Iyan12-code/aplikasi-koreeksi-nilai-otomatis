/**
 * =========================================================
 * TOAST NOTIFICATION COMPONENT
 * SmartEval UI Component
 * =========================================================
 */

export function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'border-l-4 border-emerald-500 bg-slate-900/95 text-white',
    error: 'border-l-4 border-rose-500 bg-slate-900/95 text-white',
    info: 'border-l-4 border-indigo-500 bg-slate-900/95 text-white',
  };

  const typeIcons = {
    success: '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
    error: '<i class="fa-solid fa-circle-xmark text-rose-400"></i>',
    info: '<i class="fa-solid fa-circle-info text-indigo-400"></i>',
  };

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10 text-sm font-semibold min-w-[280px] max-w-md transition-all duration-300 transform translate-x-10 opacity-0 ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <span class="text-base">${typeIcons[type] || typeIcons.info}</span>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-10', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
  });

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('translate-x-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
