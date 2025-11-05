// Fix: Replaced incorrect HTML content with a functional React component.
import React, { useEffect, useRef } from 'react';

interface LoadingOverlayProps {
  text: string;
  playSound?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text, playSound = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let timeoutId: number;
    if (playSound && audioRef.current) {
      // Start sound after a short delay
      timeoutId = window.setTimeout(() => {
        audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
      }, 1500);
    }

    // Cleanup function to stop audio when component unmounts
    return () => {
      clearTimeout(timeoutId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [playSound]);
  
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
      {/* Cassette Animation */}
      <div className="w-24 h-16 bg-gray-700 rounded-md p-2 flex items-center justify-around shadow-lg border-2 border-gray-600">
        <div className="w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-700 rounded-full animate-spin"></div>
        </div>
        <div className="w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-700 rounded-full animate-spin [animation-direction:reverse]"></div>
        </div>
      </div>
      <p className="text-white text-xl font-semibold mt-4 animate-pulse">{text}</p>
      {playSound && <audio ref={audioRef} src="/dial-up.mp3" preload="auto" />}
    </div>
  );
};

export default LoadingOverlay;