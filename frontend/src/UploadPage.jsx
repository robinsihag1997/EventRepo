import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle, User, AlertCircle, X, Zap, Sun, Moon } from 'lucide-react';
import axios from 'axios';

/**
 * Professional Event Upload Page
 * Cross-browser compatible with Dark/Light mode toggle
 */
export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('selfie_booth_theme');
    return saved ? saved === 'dark' : true;
  });

  // Theme classes
  const t = {
    // Backgrounds
    pageBg: darkMode ? 'bg-black' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-neutral-900' : 'bg-white',
    cardBorder: darkMode ? 'border-neutral-800' : 'border-gray-200',
    inputBg: darkMode ? 'bg-neutral-900' : 'bg-gray-100',
    inputBorder: darkMode ? 'border-neutral-800' : 'border-gray-300',
    inputText: darkMode ? 'text-white' : 'text-gray-900',
    inputPlaceholder: darkMode ? 'placeholder:text-neutral-700' : 'placeholder:text-gray-400',
    // Text
    textPrimary: darkMode ? 'text-neutral-100' : 'text-gray-900',
    textSecondary: darkMode ? 'text-neutral-400' : 'text-gray-500',
    textMuted: darkMode ? 'text-neutral-500' : 'text-gray-400',
    textLabel: darkMode ? 'text-neutral-600' : 'text-gray-400',
    // Camera area
    cameraBg: darkMode ? 'bg-neutral-900' : 'bg-gray-100',
    cameraBtnBg: darkMode ? 'bg-black' : 'bg-white',
    cameraBtnBorder: darkMode ? 'border-neutral-800' : 'border-gray-300',
    cameraBtnIcon: darkMode ? 'text-neutral-600' : 'text-gray-400',
    // Header badge
    badgeBg: darkMode ? 'bg-neutral-900' : 'bg-white',
    badgeBorder: darkMode ? 'border-neutral-800' : 'border-gray-200',
    badgeText: darkMode ? 'text-neutral-400' : 'text-gray-500',
    // Success page
    successBg: darkMode ? 'bg-neutral-950' : 'bg-gray-50',
    successCardBg: darkMode ? 'bg-neutral-900' : 'bg-white',
    successBtnBg: darkMode ? 'bg-white text-black' : 'bg-gray-900 text-white',
    // Error
    errorBg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
    errorBorder: darkMode ? 'border-red-500/20' : 'border-red-200',
    errorText: darkMode ? 'text-red-400' : 'text-red-600',
    // Close button
    closeBg: darkMode ? 'bg-black/50' : 'bg-white/70',
    // Theme toggle
    toggleBg: darkMode ? 'bg-neutral-800' : 'bg-gray-200',
    toggleIcon: darkMode ? 'text-yellow-400' : 'text-indigo-600',
    // Retake
    retakeText: darkMode ? 'text-neutral-600' : 'text-gray-400',
    // Footer
    footerOpacity: darkMode ? 'opacity-30' : 'opacity-40',
    // Shutter border
    shutterBorder: darkMode ? 'border-white/10' : 'border-gray-300',
    shutterFill: darkMode ? 'bg-white' : 'bg-indigo-600',
    shutterIcon: darkMode ? 'text-black' : 'text-white',
  };

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('selfie_booth_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Cleanup camera on unmount
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCountdown(null);
  }, [stream]);

  useEffect(() => {
    const status = localStorage.getItem('company_event_uploaded');
    if (status === 'true') {
      setIsUploaded(true);
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      const video = videoRef.current;
      video.srcObject = stream;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Camera play error:", e);
          setTimeout(() => {
            video.play().catch(() => { });
          }, 300);
        });
      }
    }
  }, [isCameraOpen, stream]);

  async function startCamera() {
    setError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported in this browser. Please use Chrome, Firefox, or Safari.');
      return;
    }

    const constraintsList = [
      { video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: "user" }, audio: false },
      { video: true, audio: false }
    ];

    for (const constraints of constraintsList) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        setIsCameraOpen(true);
        return;
      } catch (err) {
        console.warn("Camera constraint failed, trying fallback:", err.name);
        continue;
      }
    }
    setError('Could not access camera. Please allow camera permissions and try again.');
  }

  function startCapture() {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  }

  function capturePhoto() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const vw = video.videoWidth || video.clientWidth || 640;
      const vh = video.videoHeight || video.clientHeight || 480;
      canvas.width = vw;
      canvas.height = vh;
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.setTransform(1, 0, 0, 1, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(dataUrl);

      try {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setImage(file);
      } catch (e) {
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/jpeg' });
        blob.name = "selfie.jpg";
        setImage(blob);
      }
      stopCamera();
    }
  }

  function retake() {
    setImage(null);
    setPreview('');
    startCamera();
  }

  async function handleUpload() {
    if (!name.trim()) return setError('Please enter your name.');
    if (!image) return setError('Please capture image.');
    setLoading(true);
    setError('');

    try {
      const compressedBlob = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 1200;
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
              'image/jpeg', 0.7
            );
          } catch (err) { reject(err); }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = preview;
      });

      const compressedFile = new File([compressedBlob], 'photo.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('name', name);
      formData.append('file', compressedFile);

      await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.setItem('company_event_uploaded', 'true');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Theme Toggle Button ───
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-full ${t.toggleBg} transition-all duration-300 hover:scale-110 active:scale-95`}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun className={`w-4 h-4 ${t.toggleIcon} transition-colors duration-300`} />
      ) : (
        <Moon className={`w-4 h-4 ${t.toggleIcon} transition-colors duration-300`} />
      )}
    </button>
  );

  // ─── Success Screen ───
  if (isUploaded || success) {
    return (
      <div className={`min-h-screen ${t.successBg} flex flex-col items-center justify-center p-6 ${t.textPrimary} text-center transition-colors duration-500`}>
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className={`max-w-md w-full ${t.successCardBg} border ${t.cardBorder} rounded-[2.5rem] p-10 shadow-2xl transition-colors duration-500`}>
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4 italic uppercase tracking-tighter">Selfie Shared!</h2>
          <p className={`${t.textSecondary} mb-8 text-sm leading-relaxed transition-colors duration-500`}>
            Nice one, <span className={`${t.textPrimary} font-bold`}>{name}</span>! Your photo is now live in the gallery.
          </p>
          <button
            onClick={() => { setIsUploaded(false); setSuccess(false); setName(''); setImage(null); setPreview(''); }}
            className={`w-full py-4 px-6 ${t.successBtnBg} font-black uppercase tracking-widest rounded-2xl transition-all duration-300 active:scale-95`}
          >
            Take Another
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Page ───
  return (
    <div className={`min-h-screen ${t.pageBg} ${t.textPrimary} font-sans overflow-x-hidden flex flex-col items-center transition-colors duration-500`}>
      <div className="w-full max-w-xl px-6 py-12">

        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
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

            <div className={`relative aspect-square ${t.cameraBg} rounded-[2.5rem] border ${t.cardBorder} overflow-hidden shadow-2xl flex items-center justify-center transition-colors duration-500`}>
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
                  <Upload className="w-6 h-6" /> POST TO GALLERY
                </button>
                <button onClick={retake} className={`w-full text-[10px] font-black ${t.retakeText} uppercase tracking-widest flex items-center justify-center gap-2`}>
                  <RefreshCw className="w-3 h-3" /> Change Photo
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
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}