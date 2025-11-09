import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Players, MashResults, StoryTone, Player } from '../types';
import { STORY_MODES, CATEGORY_INFO } from '../constants';

const ShareButtons: React.FC<{
    base64Image: string;
    fileName?: string;
    onCopyImage: () => void;
    copyStatus: string;
}> = ({ base64Image, fileName = 'mash-image.png', onCopyImage, copyStatus }) => {

    const handleSaveImage = (base64: string) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex justify-center gap-2">
            {!!navigator.clipboard?.write &&
                <button onClick={onCopyImage} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-28 text-center transition-colors">
                    {copyStatus || '🖼️ Copy Image'}
                </button>
            }
            <button onClick={() => handleSaveImage(base64Image)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-28 text-center">
                💾 Save Image
            </button>
        </div>
    );
};

const FortuneReveal: React.FC<{
    step: string, results: MashResults, players: Players, story: string | null, storyTone: StoryTone, fortuneImage: string | null, setStoryTone: (tone: StoryTone) => void, onGenerateStory: () => void, onGenerateImage: () => void, onStartPrank: () => void, showAllResults: boolean, onSlideshowComplete: () => void
}> = (props) => {
    const { step, results, players, story, storyTone, fortuneImage, setStoryTone, onGenerateStory, onGenerateImage, onStartPrank, showAllResults, onSlideshowComplete } = props;
    const [resultStep, setResultStep] = useState(0);
    const resultKeys = Object.keys(results);
    const storyRef = useRef<HTMLDivElement>(null);
    const [storyCopyStatus, setStoryCopyStatus] = useState('');
    const [imageCopyStatus, setImageCopyStatus] = useState('');

    const handleCopyStory = async (storyText: string | null) => {
        if (!storyText) return;
        if (!navigator.clipboard?.writeText) {
            alert('Copying text is not supported on your browser.');
            return;
        }
        try {
            await navigator.clipboard.writeText(storyText);
            setStoryCopyStatus('Copied!');
            setTimeout(() => setStoryCopyStatus(''), 2000);
        } catch (error) {
            console.error('Failed to copy story:', error);
            alert('Failed to copy story!');
        }
    };

    const handleSaveStory = (storyText: string | null) => {
        if (!storyText) return;
        const blob = new Blob([storyText], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'mash-story.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    const handleCopyImage = async (base64: string | null) => {
        if (!base64) return;
        if (!navigator.clipboard?.write) {
            alert('Copying images is not supported on your browser.');
            return;
        }
        try {
            const response = await fetch(`data:image/png;base64,${base64}`);
            const blob = await response.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setImageCopyStatus('Copied!');
            setTimeout(() => setImageCopyStatus(''), 2000);
        } catch (error) {
            console.error('Failed to copy image:', error);
            alert('Failed to copy image!');
        }
    };


    useEffect(() => {
        if (step === 'RESULTS_REVEAL' && !showAllResults) {
            if (resultStep >= resultKeys.length) {
                setTimeout(() => onSlideshowComplete(), 500);
                return;
            }
            const timer = setTimeout(() => {
                setResultStep(prev => prev + 1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step, resultStep, showAllResults, resultKeys.length, onSlideshowComplete]);

    const ResultsDisplay = () => (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(results).map(([key, value]) => {
              const catInfo = CATEGORY_INFO[key] || { icon: '✨', name: key }; // Fallback for custom categories
              return (
                  <div key={key} className="bg-black/20 p-3 rounded-lg text-center flex flex-col items-center justify-center h-full min-h-[100px]">
                      <div className="text-2xl mb-1">{catInfo.icon}</div>
                      <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{catInfo.name}</div>
                      <div className="text-base font-bold text-white mt-1 leading-tight">{value}</div>
                  </div>
              );
          })}
      </div>
    );

    const title = useMemo(() => {
        const baseTitle = (() => {
            if (players.mode === 'coop') return `${players.player1.name} & ${players.player2!.name}'s`;
            if (players.mode === 'sabotage') return `${players.player2!.name}'s`;
            return `${players.player1.name}'s`;
        })();
        return `${baseTitle} M.A.S.H. Fortune`;
    }, [players]);
    
    const storyButtonText = useMemo(() => {
        if (players.mode === 'coop') return "Write Our Adventure";
        if (players.mode === 'sabotage') return "Write Their Hilarious Story";
        return "Write My Adventure";
    }, [players.mode]);

    const imageButtonText = useMemo(() => {
        if (players.mode === 'coop') return "Wanna SEE your MASH Fortune Together?";
        return "Wanna SEE your MASH Fortune?";
    }, [players.mode]);

    const storyTitle = useMemo(() => {
        if (players.mode === 'coop') return "Your Co-op Adventure!";
        if (players.mode === 'sabotage') return "The Story of Their Life!";
        return "Your Grand Adventure!";
    }, [players.mode]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Base Results */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20">
                <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300">{title}</h2>
                 {!showAllResults && resultKeys[resultStep] ? (
                    <div className="min-h-[160px] flex items-center justify-center">
                        <div className="text-center animate-fade-in">
                            <div className="text-5xl mb-2">{CATEGORY_INFO[resultKeys[resultStep]]?.icon || '✨'}</div>
                            <div className="text-base font-bold text-indigo-300 uppercase tracking-wider">{CATEGORY_INFO[resultKeys[resultStep]]?.name || resultKeys[resultStep]}</div>
                            <div className="text-2xl font-bold text-white mt-1">{results[resultKeys[resultStep]]}</div>
                        </div>
                    </div>
                ) : <ResultsDisplay />}
            </div>

            {/* Story, Image, Animation Section */}
            {showAllResults && (
                 <div className="space-y-6">
                    {/* Story */}
                    <div ref={storyRef} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 text-center">
                        <h2 className="text-2xl font-bold mb-1">{storyTitle}</h2>
                        <p className="text-indigo-200 mb-4 text-sm">Choose a vibe and create your destiny!</p>
                        {!(players.mode === 'sabotage') && (
                             <div className="flex justify-center gap-1 bg-black/20 p-1 rounded-full mb-4 max-w-xs mx-auto">
                                {STORY_MODES.map(mode => <button key={mode.id} onClick={() => setStoryTone(mode.id as StoryTone)} className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 ${storyTone === mode.id ? 'bg-pink-500 text-white' : 'bg-transparent text-indigo-200 hover:bg-white/10'}`}>{mode.emoji} {mode.title}</button>)}
                            </div>
                        )}
                        {!story && <button onClick={onGenerateStory} className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:scale-105 transition-transform text-black font-bold py-2 px-6 rounded-lg text-base shadow-lg">{storyButtonText}</button>}
                        {step === 'STORY_REVEAL' && story && (
                             <>
                                <div className="mt-4 space-y-4 bg-black/20 rounded-lg text-left text-indigo-100 text-sm p-4 min-h-[100px]">
                                    <p className="whitespace-pre-wrap">{story}</p>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <button onClick={() => handleCopyStory(story)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-28 text-center transition-colors">
                                        {storyCopyStatus || '📋 Copy Story'}
                                    </button>
                                    <button onClick={() => handleSaveStory(story)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-28 text-center">
                                        💾 Save Story
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Image */}
                    {step === 'STORY_REVEAL' && story && (
                        <div className="text-center animate-fade-in">
                            <button onClick={onGenerateImage} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg">{imageButtonText}</button>
                        </div>
                    )}
                    {step === 'IMAGE_REVEAL' && fortuneImage && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 text-center">
                            <h2 className="text-2xl font-bold mb-4">Your Future Portrait!</h2>
                            <img 
                                src={`data:image/png;base64,${fortuneImage}`} 
                                alt="Fortune portrait" 
                                className="w-full aspect-[9/16] object-cover rounded-lg shadow-lg mx-auto max-w-xs" 
                            />
                            <div className="mt-4">
                               <ShareButtons 
                                   base64Image={fortuneImage} 
                                   fileName="mash-fortune.png"
                                   onCopyImage={() => handleCopyImage(fortuneImage)}
                                   copyStatus={imageCopyStatus}
                               />
                            </div>
                        </div>
                    )}


                    {/* Animation Button */}
                    {step === 'IMAGE_REVEAL' && fortuneImage && (
                        <div className="text-center">
                            <button onClick={onStartPrank} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg">Bring my MASH Fortune to LIFE!</button>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default FortuneReveal;