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
        <div className="mt-8 pt-8 border-t border-indigo-500/10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 animate-pulse">
            Upload Limit Reached (1/1)
          </p>
          <p className={`${t.textMuted} text-[9px] mt-2 uppercase tracking-widest`}>
            Thank you for participating!
          </p>
        </div>
      </div>
    </div>
  );
}
