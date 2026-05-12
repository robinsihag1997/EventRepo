import { useState, useCallback, useEffect } from 'react';

export default function useCamera(videoRef) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');

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
  }, [stream, videoRef]);

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
  }, [isCameraOpen, stream, videoRef]);

  const startCamera = async () => {
    setError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported. Please use a modern browser.');
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
        continue;
      }
    }

    if (lastError) {
      setError(`Camera Error: ${lastError.message || 'Access failed'}`);
    }
  };

  return {
    isCameraOpen,
    setIsCameraOpen,
    stream,
    countdown,
    setCountdown,
    error,
    setError,
    startCamera,
    stopCamera
  };
}
