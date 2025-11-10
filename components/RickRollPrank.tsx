import React, { useState, useEffect, useRef } from 'react';
import { RICK_ROLL_VIDEO_URL } from '../constants';

const FAKE_LOADING_DURATION = 6000;
const COUNTDOWN_DURATION = 3000;

const LOADING_MESSAGES = [
    'The AI is storyboarding your scene...',
    'Rendering the final cut...',
    'Mixing the soundtrack and color grading...',
    'Applying finishing touches to your premiere...',
    'This can take a few minutes, hang tight!',
];

const RickRollPrank: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [prankStep, setPrankStep] = useState<'loading' | 'countdown' | 'reveal'>('loading');
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [countdown, setCountdown] = useState(3);
    const [needsManualPlay, setNeedsManualPlay] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Effect for the fake loading sequence
    useEffect(() => {
        if (prankStep === 'loading') {
            const messageInterval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prev);
                    return LOADING_MESSAGES[(currentIndex + 1) % LOADING_MESSAGES.length];
                });
            }, 1000);

            const timer = setTimeout(() => {
                clearInterval(messageInterval);
                setPrankStep('countdown');
            }, FAKE_LOADING_DURATION);

            return () => {
                clearInterval(messageInterval);
                clearTimeout(timer);
            };
        }
    }, [prankStep]);

    // Effect for the countdown sequence
    useEffect(() => {
        if (prankStep === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setPrankStep('reveal');
            }
        }
    }, [prankStep, countdown]);

    useEffect(() => {
        if (prankStep === 'reveal' && videoRef.current) {
            const tryPlay = async () => {
                try {
                    await videoRef.current?.play();
                    setNeedsManualPlay(false);
                } catch {
                    setNeedsManualPlay(true);
                }
            };
            tryPlay();
        }
    }, [prankStep]);

    const handleManualPlay = async () => {
        if (!videoRef.current) return;
        try {
            await videoRef.current.play();
            setNeedsManualPlay(false);
        } catch {
            setNeedsManualPlay(true);
        }
    };

    if (prankStep === 'loading') {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <h2 className="text-3xl font-bold text-yellow-300 mb-4">Generating Living Portrait...</h2>
                <div className="w-48 h-24 bg-gray-800 border-4 border-gray-600 rounded-lg p-2 mb-4 animate-pulse shadow-lg">
                    <div className="w-full h-full border-2 border-green-900 bg-green-900/50 rounded-sm text-green-300 font-mono text-xs p-1 overflow-hidden">
                        {loadingMessage}
                    </div>
                </div>
                <p className="text-white text-lg font-semibold mt-4 animate-pulse">This is some high-tech stuff!</p>
            </div>
        );
    }

    if (prankStep === 'countdown') {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="animate-reveal text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300">
                    {countdown > 0 ? countdown : '...'}
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 text-center animate-fade-in">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">SYKE!</h2>
            <div className="aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg border-2 border-white/20 mt-4 relative">
                 <video
                    ref={videoRef}
                    src={RICK_ROLL_VIDEO_URL}
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                 >
                    Your browser does not support the video tag.
                 </video>
                 {needsManualPlay && (
                    <button
                        onClick={handleManualPlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-semibold text-lg"
                    >
                        Tap to play the surprise 🎵
                    </button>
                 )}
            </div>
            <p className="text-indigo-200 text-sm mt-4">True living portraits are coming soon, I promise!</p>
            <button
                onClick={onComplete}
                className="w-full max-w-sm mx-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 mt-4"
            >
                See What's ACTUALLY Next
            </button>
        </div>
    );
};

export default RickRollPrank;
