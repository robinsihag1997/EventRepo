import React from 'react';
import { Camera, RefreshCw, User, AlertCircle, X, Zap, ChevronRight } from 'lucide-react';
import bg2 from '../assets/bg-2.png';
import retakeBtnImg from '../assets/retake-btn.png';

const LOADING_MESSAGES = [
  "Analyzing facial features...",
  "Enhancing image resolution...",
  "Encrypting data transmission...",
  "Syncing with event wall...",
  "Finalizing your moment...",
  "Unlocking the future..."
];

const SlideToSubmit = ({ onComplete }) => {
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
      className="relative w-full h-16 sm:h-20 bg-[#600000] rounded-full border-2 border-[#FFD700] overflow-hidden shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center p-1.5 sm:p-2 select-none touch-none"
    >
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-12"
        style={{ opacity: 1 - (sliderValue / 50) }}
      >
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#FFD700] text-center leading-tight drop-shadow-md">
          Slide to unlock the future
        </span>
      </div>
      
      <div 
        className="h-12 w-12 sm:h-15 sm:w-15 bg-gradient-to-b from-[#FFE066] to-[#FFD700] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.5)] cursor-grab active:cursor-grabbing z-10 transition-transform"
        style={{ 
          transform: `translateX(${(sliderValue / 100) * (containerRef.current ? containerRef.current.offsetWidth - (window.innerWidth < 640 ? 60 : 76) : 0)}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-[#600000] stroke-[3]" />
      </div>

      <div 
        className="absolute left-0 top-0 h-full bg-[#FFD700]/20 pointer-events-none transition-all"
        style={{ width: `${sliderValue}%` }}
      />
    </div>
  );
};

export default function CaptureView({
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
  retake
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
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center transition-all duration-500 overflow-x-hidden"
      style={{ 
        backgroundImage: `url(${bg2})`,
        fontFamily: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif'
      }}
    >
      <div className="w-full max-w-xl px-4 sm:px-6 py-8 sm:py-12 bg-black/20 min-h-screen backdrop-blur-[2px] flex flex-col">

        {/* Header */}
        <header className="mb-8 sm:mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-white drop-shadow-lg">
              Selfie<span className="text-[#FFD700]">Booth</span>
            </h1>
            <p className="text-[#FFD700] text-[10px] font-black tracking-widest uppercase opacity-80">Live Event Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#600000]/60 px-4 py-2 rounded-full border border-[#FFD700]/30 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse shadow-[0_0_5px_#FFD700]" />
                <span className="text-[10px] font-black uppercase text-[#FFD700]">Live</span>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-[#FFD700] border-2 border-white rounded-2xl flex items-center gap-3 text-[#600000] shadow-[0_0_20px_rgba(255,215,0,0.4)] animate-in slide-in-from-top duration-300">
            <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
            <p className="text-[10px] font-black uppercase tracking-wider">{error}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-8">
            {/* 1. Identity */}
            <div>
              <label className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em] mb-3 block ml-1">
                01. Identity
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]/50 group-focus-within:text-[#FFD700] transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="YOUR FULL NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#600000]/40 border-2 border-[#FFD700]/20 focus:border-[#FFD700] outline-none rounded-2xl py-5 pl-12 pr-4 text-sm text-white font-bold tracking-wider placeholder-[#FFD700]/30 transition-all duration-300 uppercase backdrop-blur-md"
                />
              </div>
            </div>

            {/* 2. Capture */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em] mb-3 block ml-1">
                02. Capture
              </label>

              <div className="relative aspect-square bg-[#300000]/60 rounded-3xl sm:rounded-[2.5rem] border-2 border-[#FFD700]/30 overflow-hidden shadow-2xl flex items-center justify-center backdrop-blur-sm">
                {!isCameraOpen && !preview && (
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="w-20 h-20 bg-[#600000]/80 rounded-full flex items-center justify-center border-2 border-[#FFD700]/30 group-hover:border-[#FFD700] transition-all duration-300 shadow-xl">
                      <Camera className="w-8 h-8 text-[#FFD700]/70 group-hover:text-[#FFD700] transition-colors" />
                    </div>
                    <span className="text-[10px] font-black text-[#FFD700]/70 uppercase tracking-widest">Enable Camera</span>
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-sm">
                        <span className="text-8xl font-black text-[#FFD700] animate-ping drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">{countdown}</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#600000] border border-[#FFD700]/50 px-3 py-1 rounded font-black text-[10px] flex items-center gap-2 text-[#FFD700]">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]" /> REC
                    </div>
                    <button onClick={stopCamera} className="absolute top-4 right-4 p-2 bg-[#600000]/80 border border-[#FFD700]/30 text-[#FFD700] rounded-lg">
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
                    className="w-20 h-20 rounded-full border-[4px] border-[#FFD700]/50 p-1 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center transition-all duration-300">
                      <Zap className="w-8 h-8 text-[#600000] stroke-[2.5]" />
                    </div>
                  </button>
                </div>
              )}

              {preview && !loading && (
                <div className="pt-4 space-y-6">
                  <SlideToSubmit onComplete={handleUpload} />
                  <button 
                    onClick={retake} 
                    className="w-full transition-transform active:scale-95 hover:brightness-110"
                  >
                    <img src={retakeBtnImg} alt="Retake" className="w-48 sm:w-56 mx-auto h-auto" />
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-4 pt-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-[#FFD700]/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em] animate-pulse h-4">
                      {LOADING_MESSAGES[msgIndex]}
                    </p>
                    <p className="text-white/60 text-[8px] uppercase tracking-widest">Please wait</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

