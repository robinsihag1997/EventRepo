import React, { useRef, useState, useEffect } from 'react';
import api from './utils/api';
import { Sun, Moon } from 'lucide-react';

// Components
import WelcomeView from './components/WelcomeView';
import CaptureView from './components/CaptureView';
import SuccessView from './components/SuccessView';
import OnlineStatusBar from './components/OnlineStatusBar';

// Hooks & Utils
import useCamera from './hooks/useCamera';
import { getTheme } from './utils/theme';

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('selfie_booth_theme');
    return saved ? saved === 'dark' : true;
  });

  const {
    isCameraOpen,
    countdown,
    setCountdown,
    error,
    setError,
    startCamera,
    stopCamera
  } = useCamera(videoRef);

  const t = getTheme(darkMode);

  useEffect(() => {
    const status = localStorage.getItem('company_event_uploaded');
    if (status === 'true') {
      setIsUploaded(true);
      setStep(3);
    }
  }, []);


  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('selfie_booth_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const startCapture = () => {
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
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.setTransform(1, 0, 0, 1, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(dataUrl);

      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      setImage(new Blob([ab], { type: 'image/jpeg' }));

      stopCamera();
    }
  };

  const handleUpload = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return false; }
    if (!image) { setError('Please capture image.'); return false; }
    setLoading(true); setError('');

    try {
      // Step 1: Compress image
      const compressedBlob = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 1200;
          let w = img.width, h = img.height;
          if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; }
          canvas.width = w; canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(b => resolve(b), 'image/jpeg', 0.7);
        };
        img.src = preview;
      });

      const file = new File([compressedBlob], 'photo.jpg', { type: 'image/jpeg' });

      // Step 2: Request signed URL
      const { data: { id, uploadUrl, s3Key } } = await api.post('/generate-upload-url', {
        name,
        contentType: file.type
      });

      // Step 3: Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      // Step 4: Save metadata
      await api.post('/save-upload', {
        id,
        name,
        s3Key
      });

      localStorage.setItem('company_event_uploaded', 'true');
      setStep(3);
      return true;
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Upload failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const ThemeToggle = () => (
    <button onClick={toggleTheme} className={`p-2.5 rounded-full ${t.toggleBg} transition-all duration-300 hover:scale-110 active:scale-95`}>
      {darkMode ? <Sun className={`w-4 h-4 ${t.toggleIcon}`} /> : <Moon className={`w-4 h-4 ${t.toggleIcon}`} />}
    </button>
  );

  return (
    <>
      <OnlineStatusBar />
      {step === 1 && <WelcomeView t={t} onGetStarted={() => { setStep(2); startCamera(); }} ThemeToggle={ThemeToggle} />}
      {step === 2 && (
        <CaptureView
          t={t} name={name} setName={setName} error={error} isCameraOpen={isCameraOpen}
          preview={preview} countdown={countdown} loading={loading} videoRef={videoRef}
          startCamera={startCamera} stopCamera={stopCamera} startCapture={startCapture}
          handleUpload={handleUpload} retake={() => { setImage(null); setPreview(''); startCamera(); }}
          ThemeToggle={ThemeToggle}
        />
      )}
      {step === 3 && <SuccessView t={t} name={name} onReset={() => setStep(1)} ThemeToggle={ThemeToggle} />}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}