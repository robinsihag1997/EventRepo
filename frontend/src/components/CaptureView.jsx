import React from 'react';
import { Camera, RefreshCw, Upload, User, AlertCircle, X, Zap, ChevronRight } from 'lucide-react';

const LOADING_MESSAGES = [
  "Analyzing facial features...",
  "Enhancing image resolution...",
  "Encrypting data transmission...",
  "Syncing with event wall...",
  "Finalizing your moment...",
  "Unlocking the future..."
];

const SlideToSubmit = ({ onComplete, t }) => {
  const [sliderValue, setSliderValue] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef(null);
  const isSubmitting = React.useRef(false);

  const handleMove = React.useCallback(async (clientX) => {
    if (!isDragging || !containerRef.current || isSubmitting.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const newValue = Math.min(Math.max(((x - 32) / (width - 80)) * 100, 0), 100);
    
    if (newValue >= 98 && !isSubmitting.current) {
      isSubmitting.current = true;
      setIsDragging(false);
      setSliderValue(100);
      const success = await onComplete();
      if (success === false) {
        setSliderValue(0);
        isSubmitting.current = false;
      }
    } else if (!isSubmitting.current) {
      setSliderValue(newValue);
    }
  }, [isDragging, onComplete]);

  const handleEnd = React.useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (sliderValue < 98) {
      setSliderValue(0);
    }
  }, [isDragging, sliderValue]);

  React.useEffect(() => {
    if (isDragging) {
      const onMouseMove = (e) => handleMove(e.clientX);
      const onMouseUp = handleEnd;
      const onTouchMove = (e) => {
        if (e.cancelable) e.preventDefault();
        handleMove(e.touches[0].clientX);
      };
      const onTouchEnd = handleEnd;

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-16 sm:h-20 ${t.inputBg} rounded-2xl sm:rounded-3xl border ${t.inputBorder} overflow-hidden shadow-inner flex items-center p-1.5 sm:p-2 select-none touch-none`}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-12"
        style={{ opacity: 1 - (sliderValue / 50) }}
      >
        <span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] ${t.textMuted} text-center leading-tight`}>
          Submit to unlock the future
        </span>
      </div>
      
      <div 
        className="h-13 w-13 sm:h-16 sm:w-16 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10 transition-transform"
        style={{ 
          transform: `translateX(${(sliderValue / 100) * (containerRef.current ? containerRef.current.offsetWidth - (window.innerWidth < 640 ? 64 : 80) : 0)}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>

      <div 
        className="absolute left-0 top-0 h-full bg-indigo-600/10 pointer-events-none transition-all"
        style={{ width: `${sliderValue}%` }}
      />
    </div>
  );
};

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
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else {
      setMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
              <div className="pt-4 space-y-6">
                <SlideToSubmit onComplete={handleUpload} t={t} />
                <button onClick={retake} className={`w-full text-[10px] font-black ${t.retakeText} uppercase tracking-widest flex items-center justify-center gap-2`}>
                  <RefreshCw className="w-3 h-3" /> Retake Photo
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-4 pt-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] animate-pulse h-4">
                    {LOADING_MESSAGES[msgIndex]}
                  </p>
                  <p className={`${t.textMuted} text-[8px] uppercase tracking-widest`}>Please wait</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
