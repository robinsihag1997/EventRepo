import React from 'react';
import { CheckCircle, Zap, Sun, Moon } from 'lucide-react';

export default function WelcomeView({ t, darkMode, toggleTheme, setStep, ThemeToggle }) {
  return (
    <div className={`min-h-screen ${t.pageBg} flex flex-col items-center justify-center p-6 ${t.textPrimary} text-center transition-colors duration-500`}>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className={`max-w-md w-full ${t.cardBg} border ${t.cardBorder} rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl transition-colors duration-500`}>
        <div className="mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic mb-2">
            Selfie<span className="text-indigo-500">Booth</span>
          </h1>
          <p className={`${t.textMuted} text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase transition-colors duration-500`}>Live Event Portal</p>
        </div>
        
        <div className="space-y-6 mb-10 text-left">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <CheckCircle className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight text-sm italic">Capture the Moment</h3>
              <p className={`${t.textSecondary} text-xs transition-colors duration-500`}>Take a quick selfie and show your style.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Zap className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight text-sm italic">Instant Live Stream</h3>
              <p className={`${t.textSecondary} text-xs transition-colors duration-500`}>Photos go directly to the event wall.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full py-4 sm:py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg sm:text-xl rounded-2xl sm:rounded-3xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
        >
          Get Started <Zap className="w-5 h-5" />
        </button>
      </div>
      
      <footer className={`mt-10 text-center ${t.footerOpacity} transition-opacity duration-500`}>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase">
          Direct Hardware Link &bull; Event Security V2.1
        </p>
      </footer>
    </div>
  );
}
