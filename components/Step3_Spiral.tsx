import React, { useRef, useEffect, useState } from 'react';

interface Step3SpiralProps {
  onSpiralComplete: (magicNumber: number) => void;
}

const Step3Spiral: React.FC<Step3SpiralProps> = ({ onSpiralComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const pointsRef = useRef<{x: number, y: number}[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);

  const calculateMagicNumber = () => {
    const points = pointsRef.current;
    if (points.length < 20) return 5;

    const centerX = canvasRef.current!.width / 2;
    const centerY = canvasRef.current!.height / 2;

    const angles = points.map(p => Math.atan2(p.y - centerY, p.x - centerX));
    
    let totalRotation = 0;
    for (let i = 1; i < angles.length; i++) {
        let angleDiff = angles[i] - angles[i-1];
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        totalRotation += angleDiff;
    }

    const loops = Math.abs(Math.round(totalRotation / (2 * Math.PI)));
    // Fix: Make the number reflect the user's drawing instead of clamping to a minimum of 4.
    // Add 3 to the loops drawn for a good gameplay range (3 is the minimum if you just draw a line).
    const finalNumber = 3 + loops;
    return Math.min(12, finalNumber); // Cap at 12 to prevent super long eliminations.
  };

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (isFinished) return;
    const { x, y } = getCoordinates(event.nativeEvent);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    pointsRef.current = [{x, y}];
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (pointsRef.current.length > 20 && !isFinished) {
      finish();
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isFinished) return;
    const { x, y } = getCoordinates(event.nativeEvent);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      pointsRef.current.push({x, y});
    }
  };
  
  const finish = () => {
    setIsFinished(true);
    const magicNumber = calculateMagicNumber();
    
    let count = 0;
    const interval = setInterval(() => {
        count++;
        setRevealedNumber(count);
        if (count >= magicNumber) {
            clearInterval(interval);
            setTimeout(() => onSpiralComplete(magicNumber), 1500);
        }
    }, 150);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const container = canvas.parentElement;
    if (container) {
      const size = Math.min(container.clientWidth, 400);
      canvas.width = size;
      canvas.height = size;
    }

    ctx.strokeStyle = '#f093fb';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#f093fb';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
      <h2 className="text-3xl font-bold mb-4">Step 3: Draw Your Spiral 🌀</h2>
      <p className="text-indigo-200 mb-6">Draw a spiral from the center. When you stop, your fate will be sealed!</p>
      
      <canvas
        ref={canvasRef}
        className="touch-none bg-white/10 rounded-xl mx-auto cursor-crosshair border-2 border-white/20"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />

      {isFinished && (
         <div className="mt-6 text-center">
            <p className="text-2xl font-bold">Your Magic Number is...</p>
            <p className="text-7xl font-bold text-pink-400 animate-bounce">{revealedNumber}</p>
         </div>
      )}
    </div>
  );
};

export default Step3Spiral;