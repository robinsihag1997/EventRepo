import React from 'react';
import bg2 from '../assets/bg-2.png';
import thankyouImg from '../assets/thankyou.png';

export default function SuccessView() {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{ 
        backgroundImage: `url(${bg2})`,
        fontFamily: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif'
      }}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4 animate-in fade-in zoom-in duration-700">
        <img 
          src={thankyouImg} 
          alt="Thank You" 
          className="w-full h-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.4)] max-w-[500px] sm:max-w-[700px]"
        />
        <p className="mt-8 text-[#FFD700] text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] opacity-80 animate-pulse">
          Your moment has been captured
        </p>
      </div>
    </div>
  );
}

