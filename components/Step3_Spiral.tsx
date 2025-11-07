import React, { useState, useRef, useEffect } from 'react';

interface Step3SpiralProps {
  onSpiralComplete: (num: number) => void;
}

const Step3Spiral: React.FC<Step3SpiralProps> = ({ onSpiralComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const hue = useRef(0);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (revealedNumber !== null) {
      const timeoutId = setTimeout(() => {
        onSpiralComplete(revealedNumber);
      }, 2500); // Wait 2.5 seconds before moving to the next step
      return () => clearTimeout(timeoutId);
    }
  }, [revealedNumber, onSpiralComplete]);


  const getCoords = (event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, isValid: false };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      return { x: 0, y: 0, isValid: false };
    }
    
    // Fix: Scale coordinates to match canvas resolution if CSS scales it.
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
      isValid: true
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y, isValid } = getCoords(e.nativeEvent);
    if (!isValid) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      setIsDrawing(true);
      setLineCount(1); // Reset on new spiral
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y, isValid } = getCoords(e.nativeEvent);
    if (!isValid) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      hue.current = (hue.current + 3) % 360;
      ctx.strokeStyle = `hsl(${hue.current}, 100%, 60%)`;
      ctx.lineTo(x, y);
      ctx.stroke();
      setLineCount(prev => prev + 1);
    }
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const handleComplete = () => {
    const magicNumber = (lineCount % 8) + 3;
    setRevealedNumber(magicNumber);
  };
  
  const handleRedraw = () => {
    const canvas = canvasRef.current;
    if(canvas) {
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    setLineCount(0);
  };
  
  if (revealedNumber !== null) {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
            <h2 className="text-3xl font-bold text-yellow-300 mb-4">Your Magic Number Is...</h2>
            <div className="animate-reveal text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300">
                {revealedNumber}
            </div>
            <p className="text-indigo-200 text-lg mt-4 opacity-0 animate-fade-in [animation-delay:800ms]">
                This number will decide your fate!
            </p>
        </div>
    );
  }


  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 text-center flex flex-col items-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-4">Draw a Spiral!</h2>
      <p className="text-indigo-200 mb-6 max-w-sm">Draw a spiral in one continuous motion. The number of lines will determine your fate! Don't think too hard about it...</p>
      
      <div className="w-full max-w-sm aspect-square bg-black/20 rounded-lg cursor-crosshair touch-none overflow-hidden">
        <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
      </div>

      <div className="mt-6 w-full max-w-sm flex flex-col sm:flex-row gap-4">
        <button
            onClick={handleRedraw}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors"
          >
            Re-draw
        </button>
        <button
          onClick={handleComplete}
          disabled={lineCount < 10}
          className="flex-1 bg-gradient-to-r from-pink-500 to-yellow-400 text-black font-bold py-3 px-4 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Done! Reveal my Magic Number
        </button>
      </div>
    </div>
  );
};

export default Step3Spiral;