import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function SuccessView({ t, name, onReset, ThemeToggle }) {
  return (
    <div className={`min-h-screen ${t.successBg} flex flex-col items-center justify-center p-6 ${t.textPrimary} text-center transition-colors duration-500`}>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className={`max-w-md w-full ${t.successCardBg} border ${t.cardBorder} rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl transition-colors duration-500`}>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 italic uppercase tracking-tighter">Selfie Shared!</h2>
        <p className={`${t.textSecondary} mb-8 text-sm leading-relaxed transition-colors duration-500`}>
          Nice one, <span className={`${t.textPrimary} font-bold`}>{name}</span>! Your photo is now live in the gallery.
        </p>
        <button
          onClick={onReset}
          className={`w-full py-4 px-6 ${t.successBtnBg} font-black uppercase tracking-widest rounded-2xl transition-all duration-300 active:scale-95`}
        >
          Take Another
        </button>
      </div>
    </div>
  );
}
