import React from 'react';
import { CheckCircle, Zap, Sun, Moon } from 'lucide-react';

export default function WelcomeView({ t, onGetStarted, ThemeToggle }) {
  return (
    <div className={`min-h-screen ${t.pageBg} flex flex-col items-center justify-center p-4 sm:p-6 ${t.textPrimary} text-center transition-colors duration-500`}>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className={`max-w-md w-full ${t.cardBg} border ${t.cardBorder} rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl transition-colors duration-500`}>
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic mb-2">
            Selfie<span className="text-indigo-500">Booth</span>
          </h1>
          <p className={`${t.textMuted} text-[8px] sm:text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500`}>Live Event Portal</p>
        </div>

        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10 text-left">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight text-[10px] sm:text-xs italic">Capture the Moment</h3>
              <p className={`${t.textSecondary} text-[9px] sm:text-[11px] transition-colors duration-500`}>Take a quick selfie and show your style.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight text-[10px] sm:text-xs italic">Instant Live Stream</h3>
              <p className={`${t.textSecondary} text-[9px] sm:text-[11px] transition-colors duration-500`}>Photos go directly to the event wall.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="w-full py-4 sm:py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-widest"
        >
          Let’s unlock the future <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

    </div>
  );
}
