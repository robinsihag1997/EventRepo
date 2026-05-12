import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle, User, AlertCircle, X, Zap, Sun, Moon } from 'lucide-react';
import axios from 'axios';

/**
 * Professional Event Upload Page
 * Cross-browser compatible with Dark/Light mode toggle
 */
import WelcomeView from './components/WelcomeView';
import CaptureView from './components/CaptureView';
import SuccessView from './components/SuccessView';

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Welcome, 2: Upload Logic, 3: Success
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
      setStep(3);
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
      setError('Camera not supported. Please use a modern browser like Chrome or Safari.');
      return;
    }

    const constraintsList = [
      { video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: "user" }, audio: false },
      { video: true, audio: false }
    ];

    let lastError = null;
    for (const constraints of constraintsList) {
      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        setIsCameraOpen(true);
        return;
      } catch (err) {
        lastError = err;
        console.warn("Camera constraint failed:", constraints, err.name);
        continue;
      }
    }

    if (lastError) {
      if (lastError.name === 'NotAllowedError') {
        setError('Permission denied. Please clear camera block in browser settings.');
      } else if (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError') {
        setError('Camera in use. Please close other apps using the camera.');
      } else if (lastError.name === 'NotFoundError') {
        setError('No camera detected. Please plug in a camera.');
      } else {
        setError(`Camera Error: ${lastError.message || 'Access failed'}`);
      }
    } else {
      setError('Could not access camera. Please check permissions.');
    }
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
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  }

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-full ${t.toggleBg} transition-all duration-300 hover:scale-110 active:scale-95`}
    >
      {darkMode ? (
        <Sun className={`w-4 h-4 ${t.toggleIcon}`} />
      ) : (
        <Moon className={`w-4 h-4 ${t.toggleIcon}`} />
      )}
    </button>
  );

  const resetAll = () => {
    setIsUploaded(false); 
    setSuccess(false); 
    setName(''); 
    setImage(null); 
    setPreview(''); 
    localStorage.removeItem('company_event_uploaded');
    setStep(1); 
  };

  return (
    <>
      {step === 1 && (
        <WelcomeView 
          t={t} 
          setStep={setStep} 
          ThemeToggle={ThemeToggle} 
        />
      )}
      {step === 2 && (
        <CaptureView 
          t={t} 
          name={name} 
          setName={setName} 
          error={error} 
          isCameraOpen={isCameraOpen} 
          preview={preview} 
          countdown={countdown} 
          loading={loading} 
          videoRef={videoRef} 
          startCamera={startCamera} 
          stopCamera={stopCamera} 
          startCapture={startCapture} 
          handleUpload={handleUpload} 
          retake={retake} 
          ThemeToggle={ThemeToggle} 
        />
      )}
      {step === 3 && (
        <SuccessView 
          t={t} 
          name={name} 
          onReset={resetAll} 
          ThemeToggle={ThemeToggle} 
        />
      )}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}