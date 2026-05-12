import React from 'react';
import { Camera, RefreshCw, Upload, User, AlertCircle, X, Zap } from 'lucide-react';

export default function CaptureView({
  t,
  name,
  setName,
  error,
  isCameraOpen,
  preview,
  countdown,
  loading,
  videoRef,
  startCamera,
  stopCamera,
  startCapture,
  handleUpload,
  retake,
  ThemeToggle
}) {
  return (
    <div className={`min-h-screen ${t.pageBg} ${t.textPrimary} font-sans overflow-x-hidden flex flex-col items-center transition-colors duration-500`}>
      <div className="w-full max-w-xl px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <header className="mb-8 sm:mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic">
              Selfie<span className="text-indigo-500">Booth</span>
            </h1>
            <p className={`${t.textMuted} text-[10px] font-black tracking-widest uppercase transition-colors duration-500`}>Live Event Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className={`${t.badgeBg} px-4 py-2 rounded-full border ${t.badgeBorder} transition-colors duration-500`}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className={`text-[10px] font-black uppercase ${t.badgeText} transition-colors duration-500`}>Live</span>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className={`mb-6 p-4 ${t.errorBg} border ${t.errorBorder} rounded-2xl flex items-center gap-3 ${t.errorText} transition-colors duration-500`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[10px] font-black uppercase">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* 1. Identity */}
          <div>
            <label className={`text-[10px] font-black ${t.textLabel} uppercase tracking-[0.2em] mb-3 block ml-1 transition-colors duration-500`}>
              01. Identity
            </label>
            <div className="relative group">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${t.textLabel} group-focus-within:text-indigo-500 transition-colors pointer-events-none`} />
              <input
                type="text"
                placeholder="YOUR FULL NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full ${t.inputBg} border ${t.inputBorder} focus:border-indigo-500 outline-none rounded-2xl py-5 pl-12 pr-4 text-sm ${t.inputText} font-bold tracking-wider ${t.inputPlaceholder} transition-all duration-300 uppercase`}
              />
            </div>
          </div>

          {/* 2. Capture */}
          <div className="space-y-4">
            <label className={`text-[10px] font-black ${t.textLabel} uppercase tracking-[0.2em] mb-3 block ml-1 transition-colors duration-500`}>
              02. Capture
            </label>

            <div className={`relative aspect-square ${t.cameraBg} rounded-3xl sm:rounded-[2.5rem] border ${t.cardBorder} overflow-hidden shadow-2xl flex items-center justify-center transition-colors duration-500`}>
              {!isCameraOpen && !preview && (
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center gap-4 group"
                >
                  <div className={`w-20 h-20 ${t.cameraBtnBg} rounded-full flex items-center justify-center border ${t.cameraBtnBorder} group-hover:border-indigo-500 transition-all duration-300`}>
                    <Camera className={`w-8 h-8 ${t.cameraBtnIcon} group-hover:text-indigo-400 transition-colors`} />
                  </div>
                  <span className={`text-[10px] font-black ${t.textMuted} uppercase tracking-widest`}>Enable Camera</span>
                </button>
              )}

              {isCameraOpen && (
                <div className="w-full h-full relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                    className="w-full h-full object-cover"
                  />
                  {countdown && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20"
                      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                    >
                      <span className="text-8xl font-black text-white animate-ping">{countdown}</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded font-black text-[10px] flex items-center gap-2 text-white">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> REC
                  </div>
                  <button onClick={stopCamera} className={`absolute top-4 right-4 p-2 ${t.closeBg} rounded-lg`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {preview && (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              )}
            </div>

            {isCameraOpen && !countdown && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={startCapture}
                  className={`w-20 h-20 rounded-full border-[6px] ${t.shutterBorder} p-1 active:scale-90 transition-all`}
                >
                  <div className={`w-full h-full ${t.shutterFill} rounded-full flex items-center justify-center transition-colors duration-300`}>
                    <Zap className={`w-8 h-8 ${t.shutterIcon}`} />
                  </div>
                </button>
              </div>
            )}

            {preview && !loading && (
              <div className="pt-4 space-y-4">
                <button
                  onClick={handleUpload}
                  className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-3xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Upload className="w-6 h-6" /> Submit
                </button>
                <button onClick={retake} className={`w-full text-[10px] font-black ${t.retakeText} uppercase tracking-widest flex items-center justify-center gap-2`}>
                  <RefreshCw className="w-3 h-3" /> Retake Photo
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-4 pt-6 animate-pulse">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Transmitting...</span>
              </div>
            )}
          </div>
        </div>

        <footer className={`mt-20 text-center ${t.footerOpacity} transition-opacity duration-500`}>
          <p className="text-[10px] font-black tracking-[0.4em] uppercase">
            Direct Hardware Link &bull; Event Security V2.1
          </p>
        </footer>
      </div>
    </div>
  );
}
