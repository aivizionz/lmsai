import React from 'react';
import { useAppStore } from '../store';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl shadow-black/20 text-sm font-medium border
            transform transition-all duration-300 animate-in slide-in-from-right-full fade-in
            ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50' : 
              toast.type === 'error' ? 'bg-red-900/90 text-red-100 border-red-700/50' : 
              'bg-indigo-900/90 text-indigo-100 border-indigo-700/50'}
          `}
        >
          <i className={`
            ${toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' : 
              toast.type === 'error' ? 'fa-solid fa-circle-exclamation text-red-400' : 
              'fa-solid fa-circle-info text-indigo-400'}
          `}></i>
          
          <span className="max-w-[240px] leading-snug">{toast.message}</span>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-white/50 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
};
