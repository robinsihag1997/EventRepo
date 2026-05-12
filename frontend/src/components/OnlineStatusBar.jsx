import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OnlineStatusBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineStatus(true);
      setTimeout(() => setShowOnlineStatus(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!(!isOnline || (isOnline && showOnlineStatus))) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 transition-all duration-500 transform ${showOnlineStatus || !isOnline ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border backdrop-blur-md ${
        !isOnline 
          ? 'bg-red-500/90 border-red-400 text-white' 
          : 'bg-emerald-500/90 border-emerald-400 text-white'
      }`}>
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Offline: Connection Lost</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Connection Restored</span>
          </>
        )}
      </div>
    </div>
  );
}
