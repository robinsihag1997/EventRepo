import React from 'react';
import bg2 from '../assets/bg-2.png';
import logo from '../assets/logo.png';
import introBtn from '../assets/intro-btn.png';

export default function WelcomeView({ onGetStarted }) {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{ 
        backgroundImage: `url(${bg2})`,
        fontFamily: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif'
      }}
    >
      <div className="flex flex-col items-center justify-between h-full py-12 sm:py-20 w-full max-w-2xl px-6">
        {/* Logo in the center */}
        <div className="flex-1 flex items-center justify-center w-full">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-full h-auto drop-shadow-2xl max-w-[300px] sm:max-w-[450px]"
          />
        </div>
        
        {/* Intro Button below the logo */}
        <div className="mt-8">
          <button 
            onClick={onGetStarted}
            className="transition-transform active:scale-95 hover:scale-105 duration-200 focus:outline-none"
          >
            <img 
              src={introBtn} 
              alt="Start" 
              className="w-48 sm:w-64 h-auto"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
