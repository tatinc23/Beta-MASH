import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Players, MashResults, StoryTone, Player, CategoryConfig } from './types';
import { generateHeadshotAvatar, editHeadshotAvatar, generateStory, generateFortuneImage, createBlinkingAnimation } from './services/geminiService';
import { ALL_CATEGORIES, CATEGORY_INFO, STORY_MODES, DEFAULT_CATEGORIES } from './constants';
import { COOP_CATEGORIES } from './coop_categories';
import { LibraryCategory } from './types';
import Step3Spiral from './components/Step3_Spiral';
import Step4Elimination from './components/Step4_Elimination';

// --- Reusable UI Components ---

const LoadingScreen: React.FC<{ text: string, showDialUp?: boolean }> = ({ text, showDialUp = false }) => {
    const dialUpMessages = [
        "Initializing hyperdrive...",
        "Reticulating splines...",
        "Negotiating with the dial-up gods...",
        "Don't pick up the phone!",
        "Compiling 90s nostalgia...",
        "Buffering... just kidding, that's not a thing anymore.",
    ];
    const [message, setMessage] = useState(dialUpMessages[0]);

    useEffect(() => {
        if (showDialUp) {
            const interval = setInterval(() => {
                setMessage(dialUpMessages[Math.floor(Math.random() * dialUpMessages.length)]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [showDialUp]);

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-yellow-300 mb-6">{text}</h2>
            {showDialUp && (
                 <div className="text-center">
                    <div className="w-48 h-24 bg-gray-800 border-4 border-gray-600 rounded-lg p-2 mb-4 animate-pulse shadow-lg">
                        <div className="w-full h-full border-2 border-green-900 bg-green-900/50 rounded-sm text-green-300 font-mono text-xs p-1 overflow-hidden">
                          {message}
                        </div>
                    </div>
                 </div>
            )}
            <p className="text-white text-lg font-semibold mt-4 animate-pulse">Please wait...</p>
        </div>
    );
};

// --- Main App ---

const App: React.FC = () => {
    const [step, setStep] = useState<string>('MODE_SELECTION');
    const [players, setPlayers] = useState<Players | null>(null);
    const [categories, setCategories] = useState<{ [key: string]: string[] } | null>(null);
    const [managedCategories, setManagedCategories] = useState<CategoryConfig[]>([]);
    const [magicNumber, setMagicNumber] = useState<number | null>(null);
    const [results, setResults] = useState<MashResults | null>(null);
    const [story, setStory] = useState<string | null>(null);
    const [storyTone, setStoryTone] = useState<StoryTone>('sassy');
    const [fortuneImage, setFortuneImage] = useState<string | null>(null);
    const [animatedImageFrames, setAnimatedImageFrames] = useState<[string, string] | null>(null);
    const [rpsWinner, setRpsWinner] = useState<'player1' | 'player2' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAllResults, setShowAllResults] = useState(false);


    const handleRestart = () => {
        setPlayers(null);
        setCategories(null);
        setManagedCategories([]);
        setMagicNumber(null);
        setResults(null);
        setStory(null);
        setFortuneImage(null);
        setAnimatedImageFrames(null);
        setRpsWinner(null);
        setError(null);
        setShowAllResults(false);
        setStep('MODE_SELECTION');
    };

    // --- Step Handlers ---
    
    const handleModeSelect = (mode: 'solo' | 'sabotage' | 'coop') => {
        const basePlayer: Player = { name: '' };
        setPlayers({
            mode,
            player1: {...basePlayer},
            ...(mode !== 'solo' && { player2: {...basePlayer} }),
            ...(mode === 'coop' && { relationship: '' }),
        });
        setStep('PLAYER_SETUP');
    };

    const handlePlayerSetupComplete = async (finalPlayers: Players) => {
        setPlayers(finalPlayers);
        setStep('AVATAR_GENERATION');
        setError(null);
        try {
            if (finalPlayers.mode === 'solo' && finalPlayers.player1.photo) {
                const p1Avatar = await generateHeadshotAvatar(finalPlayers.player1.photo);
                setPlayers(p => ({ ...p!, player1: { ...p!.player1, avatarHistory: [p1Avatar], selectedAvatarIndex: 0 } }));
            } else if (finalPlayers.mode === 'sabotage' && finalPlayers.player2?.photo) {
                const p2Avatar = await generateHeadshotAvatar(finalPlayers.player2.photo);
                setPlayers(p => ({ ...p!, player2: { ...p!.player2!, avatarHistory: [p2Avatar], selectedAvatarIndex: 0 } }));
            } else if (finalPlayers.mode === 'coop' && finalPlayers.player1.photo && finalPlayers.player2?.photo) {
                const [p1Avatar, p2Avatar] = await Promise.all([
                    generateHeadshotAvatar(finalPlayers.player1.photo!),
                    generateHeadshotAvatar(finalPlayers.player2.photo!),
                ]);
                setPlayers(p => ({
                    ...p!,
                    player1: { ...p!.player1, avatarHistory: [p1Avatar], selectedAvatarIndex: 0 },
                    player2: { ...p!.player2!, avatarHistory: [p2Avatar], selectedAvatarIndex: 0 },
                }));
            }
            setStep('AVATAR_REVIEW');
        } catch (e) {
            console.error(e);
            setError("Bummer! The AI avatar generator is sleeping. Try again with a different photo.");
            setStep('PLAYER_SETUP');
        }
    };
    
     const handleAvatarReviewComplete = () => {
        if (!players) return;
        // Set up categories based on mode
        if (players.mode === 'coop' && players.relationship) {
            const coopCats = COOP_CATEGORIES[players.relationship as keyof typeof COOP_CATEGORIES];
            if (coopCats) {
                const dynamicCats = Object.keys(coopCats).map(key => ({
                    key,
                    name: CATEGORY_INFO[key]?.name || key,
                    icon: CATEGORY_INFO[key]?.icon || '✨',
                    isCustom: false,
                    isSelected: true,
                }));
                setManagedCategories(dynamicCats);
            }
        } else {
            setManagedCategories(DEFAULT_CATEGORIES.map(c => ({...c, isSelected: true})));
        }
        setStep('CATEGORIES');
    };


    const handleCategoriesSubmit = (submittedCategories: { [key: string]: string[] }) => {
        if (players?.mode === 'sabotage') {
             const finalResults: MashResults = {};
             for (const key in submittedCategories) {
                 finalResults[key] = submittedCategories[key][0]; // Take the single selected option
             }
             setResults(finalResults);
             setShowAllResults(true); // Skip slideshow
             setStep('RESULTS_REVEAL');
        } else {
            setCategories(submittedCategories);
            if (players?.mode === 'coop') {
                setStep('RPS');
            } else {
                setStep('SPIRAL'); // Skip RPS for solo
            }
        }
    };

    const handleRpsWinner = (winner: 'player1' | 'player2') => {
        setRpsWinner(winner);
        setStep('SPIRAL');
    };

    const handleSpiralComplete = (num: number) => {
        setMagicNumber(num);
        setStep('ELIMINATION');
    };

    const handleEliminationComplete = (mashResults: MashResults) => {
        setResults(mashResults);
        setShowAllResults(false); // Start with slideshow
        setStep('RESULTS_REVEAL');
    };
    
    const handleGenerateStory = async () => {
        if (!results || !players) return;
        setStep('STORY_GENERATION_LOADING');
        setError(null);
        try {
            const tone = players.mode === 'sabotage' ? 'roasty' : storyTone;
            const generated = await generateStory(results, players, tone);
            if (!generated || generated.trim() === '') {
                throw new Error("The AI returned an empty story. How rude!");
            }
            setStory(generated);
            setStep('STORY_REVEAL');
        } catch(e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Yikes! The AI storyteller got writer's block.";
            setError(`${errorMessage} Please try again.`);
            setStory(null); // Explicitly clear story on failure
            setShowAllResults(true); // Go back to results grid
            setStep('RESULTS_REVEAL'); 
        }
    };

    const handleGenerateImage = async () => {
        if (!results || !players) return;
        setStep('IMAGE_GENERATION_LOADING');
        setError(null);
        try {
            let image: string | null = null;
            
            const getAvatar = (player?: Player) => player?.avatarHistory?.[player.selectedAvatarIndex ?? 0] ?? null;

            const p1Avatar = getAvatar(players.player1);
            const p2Avatar = getAvatar(players.player2);

            if (players.mode === 'coop' && p1Avatar && p2Avatar) {
                 image = await generateFortuneImage(p1Avatar, p2Avatar, results, players);
            } else if (players.mode === 'solo' && p1Avatar) {
                 image = await generateFortuneImage(p1Avatar, null, results, players);
            } else if (players.mode === 'sabotage' && p2Avatar) {
                 image = await generateFortuneImage(null, p2Avatar, results, players);
            }
            
            if (image) {
                setFortuneImage(image);
                setStep('IMAGE_REVEAL');
            } else {
                throw new Error("Could not determine which avatar to use for image generation.");
            }
        } catch(e) {
            console.error(e);
            setError("Major bummer! The AI art studio had a meltdown. Try generating again.");
            setStep('STORY_REVEAL'); // Go back
        }
    };

    const handleCreateBlinkingAnimation = async () => {
        if (!fortuneImage) return;
        setStep('BLINK_GENERATION_LOADING');
        setError(null);
        try {
            const blinkFrame = await createBlinkingAnimation(fortuneImage);
            setAnimatedImageFrames([fortuneImage, blinkFrame]);
            setStep('ANIMATION_REVEAL');
        } catch (e) {
            console.error(e);
            setError("Whoops! The animation machine is jammed. You can still share the cool image!");
            setStep('IMAGE_REVEAL'); // Go back to static image
        }
    };

    // --- Render Logic ---

    const renderContent = () => {
        // LOADING STATES
        if (step === 'AVATAR_GENERATION') return <LoadingScreen text="Generating Your Avatar(s)..." showDialUp />;
        if (step === 'STORY_GENERATION_LOADING') return <LoadingScreen text="Writing Your Destiny..." />;
        if (step === 'IMAGE_GENERATION_LOADING') return <LoadingScreen text="Painting Your Future..." showDialUp />;
        if (step === 'BLINK_GENERATION_LOADING') return <LoadingScreen text="Adding a little magic..." />;

        if (!players) {
            return <ModeSelection onSelect={handleModeSelect} />;
        }

        switch (step) {
            case 'PLAYER_SETUP':
                return <PlayerSetup onComplete={handlePlayerSetupComplete} initialPlayers={players} onGoBack={handleRestart} />;
            case 'AVATAR_REVIEW':
                return <AvatarReview players={players} setPlayers={setPlayers} onContinue={handleAvatarReviewComplete} />;
            case 'CATEGORIES':
                return <CategoriesSetup onCategoriesSubmit={handleCategoriesSubmit} players={players} managedCategories={managedCategories} setManagedCategories={setManagedCategories} />;
            case 'RPS':
                return <RockPaperScissors players={players} onWinnerSelect={handleRpsWinner} />;
            case 'SPIRAL':
                return <Step3Spiral onSpiralComplete={handleSpiralComplete} />;
            case 'ELIMINATION':
                if (categories && magicNumber !== null) {
                    return <Step4Elimination categories={categories} magicNumber={magicNumber} onEliminationComplete={handleEliminationComplete} />;
                }
                return <div>Loading...</div>;
            case 'RESULTS_REVEAL':
            case 'STORY_REVEAL':
            case 'IMAGE_REVEAL':
            case 'ANIMATION_REVEAL':
                 if (results && players) {
                    return <FortuneReveal
                        step={step}
                        results={results}
                        players={players}
                        story={story}
                        storyTone={storyTone}
                        fortuneImage={fortuneImage}
                        animatedImageFrames={animatedImageFrames}
                        setStoryTone={setStoryTone}
                        onGenerateStory={handleGenerateStory}
                        onGenerateImage={handleGenerateImage}
                        onAnimateImage={handleCreateBlinkingAnimation}
                        onRestart={handleRestart}
                        showAllResults={showAllResults}
                        onSlideshowComplete={() => setShowAllResults(true)}
                    />
                 }
                 return <div>Loading...</div>;
            default:
                return <ModeSelection onSelect={handleModeSelect} />;
        }
    };

    const isGameplayStep = !['MODE_SELECTION', 'PLAYER_SETUP', 'AVATAR_GENERATION', 'AVATAR_REVIEW'].includes(step);

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white font-sans p-4 flex flex-col items-center">
            <div className="w-full max-w-lg mx-auto">
                <header className={`text-center transition-all duration-500 ${isGameplayStep ? 'mb-4' : 'mb-8'}`}>
                    <h1 className={`font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300 transition-all duration-500 ${isGameplayStep ? 'text-4xl' : 'text-5xl'}`}>
                        90s Baby M.A.S.H.
                    </h1>
                     <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGameplayStep ? 'max-h-0' : 'max-h-24 mt-2'}`}>
                        <p className="text-indigo-300">Your totally awesome 90s future awaits!</p>
                    </div>
                </header>
                {error && <div className="bg-red-500/80 text-white p-3 rounded-lg text-center my-4 animate-fade-in text-sm">{error} <button onClick={() => setError(null)} className="font-bold ml-2 underline">OK</button></div>}
                {renderContent()}
            </div>
        </main>
    );
};


// --- Step Components ---

// Step 0: Mode Selection
const ModeSelection: React.FC<{ onSelect: (mode: 'solo' | 'sabotage' | 'coop') => void }> = ({ onSelect }) => {
    const modes = [
        { id: 'solo', title: 'Just Me', desc: 'The classic MASH experience, all about your future.', emoji: '👤' },
        { id: 'coop', title: '2-Player Co-op', desc: 'Team up with a friend to build a shared destiny.', emoji: '👥' },
        { id: 'sabotage', title: 'Sabotage Mode', desc: 'Predict a friend\'s future. Will you be nice...?', emoji: '😈' },
    ];

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-4 text-center animate-fade-in w-full">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">How Do You Wanna Play?</h2>
            <div className="flex flex-col gap-4 pt-2">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onSelect(mode.id as 'solo' | 'sabotage' | 'coop')}
                        className="group bg-gradient-to-br from-white/5 to-white/0 rounded-lg p-4 text-left transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-pink-400 hover:shadow-2xl hover:shadow-pink-500/20"
                    >
                        <div className="flex flex-row items-center gap-4">
                            <div className="text-4xl transition-transform duration-300 group-hover:scale-110">{mode.emoji}</div>
                            <div>
                                <h3 className="text-lg font-bold">{mode.title}</h3>
                                <p className="text-indigo-300 text-sm mt-1">{mode.desc}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Step 1a: Player Setup

const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};


const PlayerSetup: React.FC<{ onComplete: (players: Players) => void, initialPlayers: Players, onGoBack: () => void }> = ({ onComplete, initialPlayers, onGoBack }) => {
    const [players, setPlayers] = useState(initialPlayers);
    const [cameraTarget, setCameraTarget] = useState<'player1' | 'player2' | 'together' | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const fileInputRef1 = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);
    const fileInputRef3 = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const { mode } = players;

    // Camera Logic
    useEffect(() => {
        if (isCameraOpen) {
          setCameraError(null);
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
            .catch(err => {
              console.error("Error accessing camera: ", err);
              setCameraError("Oops! Couldn't access the camera. Check your browser permissions.");
              setIsCameraOpen(false);
            });
        } else {
          if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
          }
        }
    }, [isCameraOpen]);
    
    const handleTakePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && cameraTarget) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const dataUrl = canvas.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1];
          handlePhotoData({ base64, mimeType: 'image/png' }, cameraTarget);
          setIsCameraOpen(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, target: 'player1' | 'player2' | 'together') => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            handlePhotoData({ base64, mimeType: file.type }, target);
          };
          reader.readAsDataURL(file);
        }
    };
    
    const handlePhotoData = (photo: { base64: string, mimeType: string }, target: 'player1' | 'player2' | 'together') => {
        if (target === 'together') {
            setPlayers(prev => ({ ...prev, togetherPhoto: photo }));
        } else if (target === 'player1') {
             setPlayers(prev => ({ ...prev, player1: { ...prev.player1, photo } }));
        } else if (target === 'player2') {
             setPlayers(prev => ({ ...prev, player2: { ...prev.player2!, photo } }));
        }
    };

    // Derived State & Checks
    const isCoop = mode === 'coop';
    const isSabotage = mode === 'sabotage';
    const isSolo = mode === 'solo';

    const isComplete = useMemo(() => {
        if (isSolo) return !!(players.player1.name && players.player1.photo);
        if (isSabotage) return !!(players.player1.name && players.player2?.name && players.player2?.photo);
        if (isCoop) return !!(players.player1.name && players.player2?.name && players.player1.photo && players.player2?.photo && players.relationship);
        return false;
    }, [players, isSolo, isSabotage, isCoop]);

    const submitButtonText = useMemo(() => {
        if (isSolo) return "See My Destiny!";
        if (isSabotage) return "Generate Their Avatar";
        if (isCoop) return "Generate Our Avatars";
        return "Next";
    }, [isSolo, isSabotage, isCoop]);
    

    // RENDER HELPERS
    const renderCameraModal = () => (
        isCameraOpen && <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-lg mb-4"></video>
            <div className="flex gap-4">
                <button type="button" onClick={handleTakePhoto} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full text-lg">Snap Photo</button>
                <button type="button" onClick={() => setIsCameraOpen(false)} className="bg-red-500 hover:red-green-600 text-white font-bold py-2 px-6 rounded-full text-lg">Cancel</button>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
    
    const PlayerUploader = ({ playerKey, borderColor, fileRef }: { playerKey: 'player1' | 'player2', borderColor: string, fileRef: React.RefObject<HTMLInputElement> }) => {
        const player = players[playerKey];
        return (
             <div className="flex flex-col items-center gap-3">
                <div className={`w-32 h-32 bg-gray-900/50 p-2 rounded-lg flex items-center justify-center overflow-hidden border-4 ${borderColor} shadow-lg`}>
                    {player?.photo ? <img src={`data:${player.photo.mimeType};base64,${player.photo.base64}`} alt="avatar" className="w-full h-full object-cover rounded-sm" /> : <span className="text-5xl animate-pulse">📸</span>}
                </div>
                <div className="flex gap-2 mt-1">
                    <button type="button" onClick={() => fileRef.current?.click()} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-cyan-700 active:border-b-0 active:translate-y-1">Upload</button>
                    <button type="button" onClick={() => { setCameraTarget(playerKey); setIsCameraOpen(true); }} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">Camera</button>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileRef} onChange={(e) => handleFileChange(e, playerKey)} className="hidden" />
            </div>
        );
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 animate-fade-in">
            {renderCameraModal()}
            {/* --- HEADER --- */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                    {isCoop && "Who's Playing?"}
                    {isSabotage && "Who's Getting Sabotaged?"}
                    {isSolo && "Who Are You?"}
                </h2>
                <p className="text-center text-indigo-200 mb-6 text-sm">
                    {isCoop && "A 2-player co-op adventure!"}
                    {isSabotage && "Enter your name and your friend's details."}
                    {isSolo && "Let's predict your awesome future!"}
                </p>
                {/* --- NAME INPUTS --- */}
                <div className="space-y-4">
                    {isCoop && <CoopNameInputs players={players} setPlayers={setPlayers} />}
                    {isSabotage && <SabotageNameInputs players={players} setPlayers={setPlayers} />}
                    {isSolo && <SoloNameInput player={players.player1} setPlayers={setPlayers} />}
                </div>
            </div>

            {/* --- PHOTO UPLOADERS --- */}
            <div className="text-center border-t border-white/10 pt-6">
                {isSabotage ? (
                    <>
                        <h3 className="text-xl font-bold tracking-tight text-yellow-300">😈 Got a Good Pic of Them? 😈</h3>
                        <p className="text-indigo-200 text-sm">Upload a clear, forward-facing photo for the most roastable results.</p>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold tracking-tight text-yellow-300">📸 Strike a Pose! 📸</h3>
                        <p className="text-indigo-200 text-sm">Upload or snap a clear photo. No sunglasses, you cool cats!</p>
                    </>
                )}
                 {cameraError && <p className="text-red-400 text-center text-sm mt-2">{cameraError}</p>}
            </div>
            
            <div className={`flex flex-col sm:flex-row items-center gap-8 ${isSolo || isSabotage ? 'justify-center' : 'justify-around'}`}>
                {isSolo && <div className="flex flex-col items-center gap-2">
                    <span className="font-bold text-lg text-cyan-300">{players.player1.name || 'Your Name'}</span>
                    <PlayerUploader playerKey="player1" borderColor="border-cyan-400" fileRef={fileInputRef1} />
                </div>}

                {isSabotage && <>
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-lg text-pink-400">{players.player2?.name || 'Friend\'s Name'}</span>
                        <PlayerUploader playerKey="player2" borderColor="border-pink-400" fileRef={fileInputRef2} />
                    </div>
                </>}
                
                {isCoop && <>
                     <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-lg text-cyan-300">{players.player1.name || 'Player 1'}</span>
                        <PlayerUploader playerKey="player1" borderColor="border-cyan-400" fileRef={fileInputRef1} />
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-lg text-pink-400">{players.player2?.name || 'Player 2'}</span>
                        <PlayerUploader playerKey="player2" borderColor="border-pink-400" fileRef={fileInputRef2} />
                    </div>
                </>}
            </div>

            {isCoop && <CoopTogetherUploader players={players} setCameraTarget={setCameraTarget} setIsCameraOpen={setIsCameraOpen} fileRef={fileInputRef3} onChange={handleFileChange} />}

            {/* --- SUBMIT BUTTON --- */}
             <div className="border-t border-white/10 pt-6 space-y-3">
                <button onClick={() => onComplete(players)} disabled={!isComplete} className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-black font-bold py-3 px-4 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitButtonText}
                </button>
                 <button type="button" onClick={onGoBack} className="w-full text-center text-indigo-300 hover:text-white text-sm font-semibold">
                    &larr; Go Back & Change Mode
                </button>
            </div>
        </div>
    );
};

// Sub-components for PlayerSetup
const CoopNameInputs: React.FC<{ players: Players, setPlayers: React.Dispatch<React.SetStateAction<Players>> }> = ({ players, setPlayers }) => {
    const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsRelationshipOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const RELATIONSHIP_OPTIONS = ['Besties', 'Siblings', 'Dating', 'Crush', 'Exes', 'Married'];
    const RELATIONSHIP_PLACEHOLDERS: { [key: string]: [string, string] } = {
        'Besties': ['Bestie 1 Name', 'Bestie 2 Name'], 'Siblings': ['Older Sibling', 'Younger Sibling'], 'Dating': ['Partner 1', 'Partner 2'], 'Crush': ['Your Name', 'Your Crush\'s Name'], 'Exes': ['Ex 1', 'Ex 2'], 'Married': ['Spouse 1', 'Spouse 2'],
    };
    const p1Placeholder = players.relationship ? (RELATIONSHIP_PLACEHOLDERS[players.relationship]?.[0] || 'Player 1') : 'Player 1 Name';
    const p2Placeholder = players.relationship ? (RELATIONSHIP_PLACEHOLDERS[players.relationship]?.[1] || 'Player 2') : 'Player 2 Name';

    return <>
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-indigo-200 mb-1 text-center">What's your vibe?</label>
            <button
                type="button"
                onClick={() => setIsRelationshipOpen(prev => !prev)}
                className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-yellow-400 focus:outline-none flex justify-between items-center"
            >
                <span>{players.relationship || 'Select your relationship...'}</span>
                <svg className={`w-5 h-5 text-indigo-300 transition-transform ${isRelationshipOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isRelationshipOpen && (
                <div className="absolute z-20 w-full mt-1 bg-indigo-900 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {RELATIONSHIP_OPTIONS.map(opt => (
                        <div
                            key={opt}
                            onClick={() => {
                                setPlayers(p => ({ ...p, relationship: opt }));
                                setIsRelationshipOpen(false);
                            }}
                            className="px-4 py-2 text-white hover:bg-pink-500/50 cursor-pointer"
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder={p1Placeholder} value={players.player1.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
            <input type="text" placeholder={p2Placeholder} value={players.player2?.name || ''} onChange={(e) => setPlayers(p => ({...p, player2: {...p.player2!, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-pink-400 focus:outline-none" required />
        </div>
    </>
};

const SabotageNameInputs: React.FC<{ players: Players, setPlayers: React.Dispatch<React.SetStateAction<Players>> }> = ({ players, setPlayers }) => (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Your Name" value={players.player1.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
            <input type="text" placeholder="Your Friend's Name" value={players.player2?.name || ''} onChange={(e) => setPlayers(p => ({...p, player2: {...p.player2!, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-pink-400 focus:outline-none" required />
        </div>
    </>
);

const SoloNameInput: React.FC<{ player: Player, setPlayers: React.Dispatch<React.SetStateAction<Players>> }> = ({ player, setPlayers }) => (
    <input type="text" placeholder="Your Name" value={player.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full max-w-xs mx-auto bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
);

const CoopTogetherUploader: React.FC<{ players: Players, setCameraTarget: any, setIsCameraOpen: any, fileRef: any, onChange: any }> = ({ players, setCameraTarget, setIsCameraOpen, fileRef, onChange }) => (
    <>
        <div className="text-center">
            <h3 className="text-lg font-bold tracking-tight text-yellow-300">...and one of you together! (Optional)</h3>
        </div>
        <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 bg-gray-900/50 p-2 rounded-lg flex items-center justify-center overflow-hidden border-4 border-yellow-400 shadow-lg">
                    {players.togetherPhoto ? <img src={`data:${players.togetherPhoto.mimeType};base64,${players.togetherPhoto.base64}`} alt="together" className="w-full h-full object-cover rounded-sm" /> : <span className="text-5xl animate-pulse">📸</span>}
                </div>
                <div className="flex gap-2 mt-1">
                    <button type="button" onClick={() => fileRef.current?.click()} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-cyan-700 active:border-b-0 active:translate-y-1">Upload</button>
                    <button type="button" onClick={() => { setCameraTarget('together'); setIsCameraOpen(true); }} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">Camera</button>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileRef} onChange={(e) => onChange(e, 'together')} className="hidden" />
            </div>
        </div>
    </>
);

// Step 1b: Avatar Review

const ShareButtons: React.FC<{
    textToCopy?: string;
    base64Image?: string;
    fileName?: string;
}> = ({ textToCopy, base64Image, fileName = 'mash-image.png' }) => {
    const [copyStatus, setCopyStatus] = useState<{[key:string]: string}>({});

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus(prev => ({...prev, text: 'Copied!'}));
            setTimeout(() => setCopyStatus(prev => ({...prev, text: ''})), 2000);
        }).catch(err => console.error('Failed to copy text: ', err));
    };
    
    const handleCopyImage = async (base64: string) => {
        if (!navigator.clipboard?.write) {
            alert('Copying images is not supported on your browser.');
            return;
        }
        try {
            const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopyStatus(prev => ({...prev, image: 'Copied!'}));
            setTimeout(() => setCopyStatus(prev => ({...prev, image: ''})), 2000);
        } catch (error) {
            console.error('Failed to copy image:', error);
            alert('Failed to copy image!');
        }
    };
    
     const handleSaveImage = (base64: string) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex gap-2 justify-center">
            {textToCopy && (
                <button onClick={() => handleCopyText(textToCopy)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-24 text-center transition-colors">
                    {copyStatus.text || '📋 Copy Text'}
                </button>
            )}
            {base64Image && (
                 <>
                    {!!navigator.clipboard?.write && 
                        <button onClick={() => handleCopyImage(base64Image)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-24 text-center transition-colors">
                           {copyStatus.image || '🖼️ Copy Image'}
                        </button>
                    }
                    <button onClick={() => handleSaveImage(base64Image)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-24 text-center">
                        💾 Save Image
                    </button>
                </>
            )}
        </div>
    );
};


const AvatarDisplay: React.FC<{
    player: Player | undefined;
    playerKey: 'player1' | 'player2';
    borderColor: string;
    handleSelectAvatar: (playerKey: 'player1' | 'player2', index: number) => void;
    handleEditAvatar: (playerKey: 'player1' | 'player2') => void;
    editPrompts: { p1: string; p2: string };
    setEditPrompts: React.Dispatch<React.SetStateAction<{ p1: string; p2: string }>>;
    isEditing: 'p1' | 'p2' | null;
}> = ({ player, playerKey, borderColor, handleSelectAvatar, handleEditAvatar, editPrompts, setEditPrompts, isEditing }) => {
    if (!player?.avatarHistory || player.selectedAvatarIndex === undefined) return null;

    const selectedAvatar = player.avatarHistory[player.selectedAvatarIndex];
    const editKey = playerKey === 'player1' ? 'p1' : 'p2';
    const canEdit = player.avatarHistory.length < 3;

    return (
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <h3 className={`font-bold text-xl ${borderColor.replace('border-', 'text-')}`}>{player.name}</h3>
            <img src={`data:image/png;base64,${selectedAvatar}`} alt={`${player.name}'s avatar`} className={`w-40 h-40 object-cover rounded-lg border-4 ${borderColor} shadow-lg`} />
            
            <ShareButtons base64Image={selectedAvatar} fileName={`${player.name}-mash-avatar.png`} />
           
            {player.avatarHistory.length > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                    {player.avatarHistory.map((avatar, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                             <img
                                src={`data:image/png;base64,${avatar}`}
                                alt={`Version ${index + 1}`}
                                onClick={() => handleSelectAvatar(playerKey, index)}
                                className={`w-12 h-12 object-cover rounded-md cursor-pointer border-2 transition-all ${player.selectedAvatarIndex === index ? `${borderColor} scale-110` : 'border-transparent opacity-60 hover:opacity-100'}`}
                            />
                        </div>
                    ))}
                </div>
            )}
            {canEdit && (
                <div className="w-full max-w-xs mt-2 space-y-2">
                    <input
                        type="text"
                        placeholder={`e.g., "make my hair blue"`}
                        value={playerKey === 'player1' ? editPrompts.p1 : editPrompts.p2}
                        onChange={(e) => setEditPrompts(p => ({ ...p, [editKey]: e.target.value }))}
                        className="w-full bg-white/10 rounded-md p-2 text-white text-sm placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                        disabled={isEditing !== null}
                    />
                    <button
                        onClick={() => handleEditAvatar(playerKey)}
                        disabled={isEditing !== null || (playerKey === 'player1' ? !editPrompts.p1 : !editPrompts.p2)}
                        className={`w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-1.5 px-3 rounded-md text-sm disabled:opacity-50 ${isEditing === editKey ? 'animate-flicker-pulse' : ''}`}
                    >
                        {isEditing === editKey ? 'Editing...' : `Edit Avatar (${player.avatarHistory.length}/3)`}
                    </button>
                </div>
            )}
        </div>
    )
};

const AvatarReview: React.FC<{ players: Players, setPlayers: React.Dispatch<React.SetStateAction<Players>>, onContinue: () => void }> = ({ players, setPlayers, onContinue }) => {
    const [editPrompts, setEditPrompts] = useState<{ p1: string; p2: string }>({ p1: '', p2: '' });
    const [isEditing, setIsEditing] = useState<'p1' | 'p2' | null>(null);

    const handleEditAvatar = async (playerKey: 'player1' | 'player2') => {
        const player = players[playerKey];
        const prompt = playerKey === 'player1' ? editPrompts.p1 : editPrompts.p2;
        if (!player || !player.photo || !player.avatarHistory || player.selectedAvatarIndex === undefined || !prompt) return;

        setIsEditing(playerKey === 'player1' ? 'p1' : 'p2');
        try {
            const currentAvatar = player.avatarHistory[player.selectedAvatarIndex];
            const newAvatar = await editHeadshotAvatar(player.photo, currentAvatar, prompt);
            setPlayers(prev => {
                const updatedHistory = [...(prev[playerKey]?.avatarHistory ?? []), newAvatar];
                return {
                    ...prev,
                    [playerKey]: {
                        ...prev[playerKey]!,
                        avatarHistory: updatedHistory,
                        selectedAvatarIndex: updatedHistory.length - 1,
                    },
                };
            });
            setEditPrompts(prev => ({ ...prev, [playerKey === 'player1' ? 'p1' : 'p2']: '' }));
        } catch (e) {
            console.error("Failed to edit avatar:", e);
            alert("Bummer! The AI couldn't make that edit. Try a different prompt.");
        } finally {
            setIsEditing(null);
        }
    };

    const handleSelectAvatar = (playerKey: 'player1' | 'player2', index: number) => {
        setPlayers(prev => ({
            ...prev,
            [playerKey]: {
                ...prev[playerKey]!,
                selectedAvatarIndex: index,
            },
        }));
    };

    const isSolo = players.mode === 'solo' || players.mode === 'sabotage';
    const title = isSolo ? "Check Out Their Avatar!" : "Check Out Your Avatars!";
    const subtitle = isSolo ? "The AI worked its magic. Here is their cartoon alter-ego!" : "The AI worked its magic. Here are your cartoon alter-egos!";
    
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 text-center animate-fade-in">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-indigo-200">{subtitle}</p>
            
            <div className="bg-black/20 p-3 rounded-lg text-sm text-indigo-200/80 my-4 max-w-lg mx-auto text-left space-y-1">
                <p className="font-bold text-center">🎨 Avatar Editing Tips 🎨</p>
                <ul className="list-disc list-inside text-xs">
                    <li>You get <strong>2 edits</strong> per avatar. Each new edit builds on the previous one.</li>
                    <li>Be specific and ask for one change at a time for best results (e.g., "add a purple mohawk", "give them a pirate eye-patch").</li>
                    <li>The AI will always try to keep the original person's face.</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-start gap-8">
                 <AvatarDisplay
                    player={players.mode === 'sabotage' ? players.player2 : players.player1}
                    playerKey={players.mode === 'sabotage' ? 'player2' : 'player1'}
                    borderColor={players.mode === 'sabotage' ? "border-pink-400" : "border-cyan-400"}
                    handleSelectAvatar={handleSelectAvatar}
                    handleEditAvatar={handleEditAvatar}
                    editPrompts={editPrompts}
                    setEditPrompts={setEditPrompts}
                    isEditing={isEditing}
                />
                {players.mode === 'coop' && <AvatarDisplay
                    player={players.player2}
                    playerKey="player2"
                    borderColor="border-pink-400"
                    handleSelectAvatar={handleSelectAvatar}
                    handleEditAvatar={handleEditAvatar}
                    editPrompts={editPrompts}
                    setEditPrompts={setEditPrompts}
                    isEditing={isEditing}
                />}
            </div>
            <button onClick={onContinue} className="w-full max-w-sm mx-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105">Looks Awesome, Let's Go!</button>
        </div>
    );
};

// Step 2: Categories
const CategoriesSetup: React.FC<{ onCategoriesSubmit: (categories: { [key: string]: string[] }) => void, players: Players, managedCategories: CategoryConfig[], setManagedCategories: React.Dispatch<React.SetStateAction<CategoryConfig[]>> }> = ({ onCategoriesSubmit, players, managedCategories, setManagedCategories }) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    const [sabotageCustomValues, setSabotageCustomValues] = useState<{ [key: string]: string }>({});


    useEffect(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const isSabotageQuickMode = players.mode === 'sabotage';
    const selectedCategories = useMemo(() => managedCategories.filter(c => c.isSelected), [managedCategories]);

    const initialCategoryState = useMemo(() => {
        const state: { [key: string]: string[] } = {};
        selectedCategories.forEach(cat => {
            state[cat.key] = isSabotageQuickMode ? [] : Array(4).fill('');
        });
        return state;
    }, [selectedCategories, isSabotageQuickMode]);

    const [categories, setCategories] = useState(initialCategoryState);
    
    useEffect(() => {
        setCategories(initialCategoryState);
    }, [initialCategoryState]);


    const flattenLibraryOptions = (lib: LibraryCategory | string[]): string[] => {
        if (Array.isArray(lib)) return lib;
        const options: string[] = [];
        const recurse = (obj: LibraryCategory | string[]) => {
          if (Array.isArray(obj)) options.push(...obj);
          else if (typeof obj === 'object' && obj !== null) Object.values(obj).forEach(value => recurse(value));
        };
        recurse(lib);
        return Array.from(new Set(options));
    };

    const getLibraryForCategory = (categoryKey: string): LibraryCategory | string[] | null => {
        if (players.mode === 'coop' && players.relationship) {
            const lib = COOP_CATEGORIES[players.relationship as keyof typeof COOP_CATEGORIES];
            const options = lib?.[categoryKey];
            return options ? { 'All Options': options } : null;
        }
        const lib = ALL_CATEGORIES[categoryKey];
        if (!lib) return null;
        if (Array.isArray(lib)) {
            return lib;
        }
        if (typeof lib === 'object' && 'singlePlayer' in lib && 'coop' in lib) {
            const structuredLib = lib as { singlePlayer: LibraryCategory; coop: LibraryCategory };
            return (players.mode === 'coop' || players.mode === 'sabotage') ? structuredLib.coop : structuredLib.singlePlayer;
        }
        return lib as LibraryCategory | null;
    };
    
    const getRandomOptions = (categoryKey: string, count: number): string[] => {
        const lib = getLibraryForCategory(categoryKey);
        if (!lib) return [];

        const allOptions = flattenLibraryOptions(lib);
        
        if (!allOptions.length) return [];
        
        const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
        return Array.from(new Set(shuffled)).slice(0, count);
    };


    const handleSurpriseMe = () => {
        const surprisedCategories: { [key: string]: string[] } = {};
        selectedCategories.forEach(cat => {
            if (!cat.isCustom) {
                const randomSelections = getRandomOptions(cat.key, isSabotageQuickMode ? 1 : 4);
                if (randomSelections.length > 0) {
                    surprisedCategories[cat.key] = randomSelections;
                } else {
                    surprisedCategories[cat.key] = categories[cat.key] || [];
                }
            } else {
                 surprisedCategories[cat.key] = categories[cat.key] || [];
            }
        });
        setCategories(surprisedCategories);
        setSabotageCustomValues({}); // Clear custom inputs when surprising
    };

    const isFormComplete = useMemo(() => {
        if (Object.keys(categories).length !== selectedCategories.length) return false;
        const expectedLength = isSabotageQuickMode ? 1 : 4;
        return Object.values(categories).every((options: string[]) => options.length === expectedLength && options.every(opt => opt && opt.trim() !== ''));
    }, [categories, isSabotageQuickMode, selectedCategories.length]);
    
     const handleToggleCategory = (keyToToggle: string) => {
        const isCurrentlySelected = managedCategories.find(c => c.key === keyToToggle)?.isSelected;
        const selectedCount = managedCategories.filter(c => c.isSelected).length;

        if (!isCurrentlySelected && selectedCount >= 8) {
            alert("You can only select up to 8 categories for the game.");
            return;
        }

        setManagedCategories(prev =>
            prev.map(cat =>
                cat.key === keyToToggle ? { ...cat, isSelected: !cat.isSelected } : cat
            )
        );
    };

    const handleAddCustomCategory = () => {
        if (customCategoryInput.trim() === '') return;
        const selectedCount = managedCategories.filter(c => c.isSelected).length;
        
        const newCategory: CategoryConfig = {
            key: customCategoryInput.trim(),
            name: customCategoryInput.trim(),
            icon: '✨',
            isCustom: true,
            isSelected: selectedCount < 8,
        };

        setManagedCategories(prev => [...prev, newCategory]);
        setCustomCategoryInput('');
    };
    
    return (
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); if (isFormComplete) onCategoriesSubmit(categories); }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 space-y-6 animate-fade-in">
             <div>
                <h2 className="text-3xl font-bold mb-2 text-center">
                    {isSabotageQuickMode ? "Craft Their Hilarious Fate!" : "Design Your Destiny! ✨"}
                </h2>
                <p className="text-indigo-200 mb-4 text-center text-sm">
                   {isSabotageQuickMode ? "Pick one wonderfully weird option for each category." : "Fill in 4 options for each category, or let fate decide!"}
                </p>

                {players.mode !== 'coop' && (
                     <details className="bg-black/20 rounded-lg p-3 mb-4">
                        <summary className="font-semibold text-indigo-200 cursor-pointer">Manage Categories ({selectedCategories.length}/8)</summary>
                        <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {managedCategories.map(cat => (
                                    <label key={cat.key} className="flex items-center gap-2 bg-white/5 p-2 rounded-md">
                                        <input type="checkbox" checked={cat.isSelected} onChange={() => handleToggleCategory(cat.key)} className="accent-pink-500" />
                                        <span>{cat.icon} {cat.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={customCategoryInput}
                                    onChange={e => setCustomCategoryInput(e.target.value)}
                                    placeholder="Add custom category..."
                                    className="flex-grow bg-white/10 rounded-md p-2 text-white text-sm placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                                />
                                <button type="button" onClick={handleAddCustomCategory} className="bg-cyan-500 text-white font-bold px-4 rounded-md text-sm">Add</button>
                            </div>
                        </div>
                    </details>
                )}


                <button type="button" onClick={handleSurpriseMe} className="w-full mb-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg shadow-lg shadow-yellow-400/50 transform transition-all duration-300 hover:scale-105 text-base">✨ Surprise Me!</button>
                <div className="space-y-4">
                     {selectedCategories.map((cat) => {
                        const { key, icon, name, isCustom } = cat;

                         if (isSabotageQuickMode) {
                            if (isCustom) {
                                return (
                                    <div key={key}>
                                        <h3 className="text-base font-semibold mb-2">{icon} {name}</h3>
                                        <input
                                            type="text"
                                            value={categories[key]?.[0] || ''}
                                            onChange={(e) => setCategories(prev => ({ ...prev, [key]: [e.target.value] }))}
                                            className="w-full bg-white/10 rounded-md p-2 text-white text-sm placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                                            placeholder={`Enter a wacky option for ${name}`}
                                            required
                                        />
                                    </div>
                                );
                            }

                            const lib = getLibraryForCategory(key);
                            let sabotageOptions: string[] = [];
                            if (lib) {
                                if (Array.isArray(lib)) {
                                    sabotageOptions = lib;
                                } else {
                                    const sabotageKey = Object.keys(lib).find(k => k.startsWith('Sabotage'));
                                    if (sabotageKey && lib[sabotageKey]) {
                                        sabotageOptions = flattenLibraryOptions({ [sabotageKey]: lib[sabotageKey] });
                                    } else {
                                        sabotageOptions = flattenLibraryOptions(lib);
                                    }
                                }
                            }
                            const selectedOption = categories[key]?.[0];
                             return (
                                <div key={key}>
                                    <h3 className="text-base font-semibold mb-2">{icon} {name}</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sabotageOptions.map(option => (
                                            <button 
                                                type="button" 
                                                key={option}
                                                onClick={() => {
                                                    setCategories(prev => ({ ...prev, [key]: [option] }));
                                                    setSabotageCustomValues(prev => ({...prev, [key]: ''}));
                                                }}
                                                className={`p-2 rounded-md text-center cursor-pointer transition-all duration-300 text-xs flex items-center justify-center border-2 ${selectedOption === option ? 'bg-green-500/90 text-white font-extrabold winner-animation border-yellow-300 shadow-lg shadow-green-500/50 scale-105' : 'bg-white/10 border-transparent hover:border-pink-400'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={sabotageCustomValues[key] || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSabotageCustomValues(prev => ({...prev, [key]: value}));
                                                setCategories(prev => ({...prev, [key]: [value]}));
                                            }}
                                            className="w-full bg-black/20 rounded-md p-2 text-white text-xs placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                                            placeholder="😈 Or write your own..."
                                        />
                                    </div>
                                </div>
                             )
                        }

                        // Default mode
                        return (
                             <div key={key}>
                                <div className="flex justify-between items-center mb-2">
                                   <h3 className="text-base font-semibold">{icon} {name}</h3>
                                   {!isCustom && (
                                     <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => {
                                             const randoms = getRandomOptions(key, 4);
                                             if (randoms.length > 0) setCategories(prev => ({...prev, [key]: randoms}));
                                        }} className="bg-purple-500/80 hover:bg-purple-500 text-white font-bold p-2 rounded-lg text-xs" title="Randomize">🎲</button>
                                     </div>
                                   )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories[key]?.map((option, index) => <input key={index} type="text" value={option} onChange={(e) => setCategories(prev => ({ ...prev, [key]: prev[key].map((item, i) => (i === index ? e.target.value : item)) }))} className="w-full bg-white/10 rounded-md p-2 text-white text-sm placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none" placeholder={`Option ${index+1}`} required />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button type="submit" disabled={!isFormComplete} className="w-full bg-gradient-to-r from-pink-500 to-cyan-400 text-black font-bold py-3 px-4 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSabotageQuickMode ? "Lock In Their Fate!" : players.mode === 'coop' ? "Who's Going to Draw the Spiral?" : "Draw the Spiral!"}
            </button>
        </form>
    );
};

// Step 3: Rock Paper Scissors
const RockPaperScissors: React.FC<{ players: Players, onWinnerSelect: (winner: 'player1' | 'player2') => void }> = ({ players, onWinnerSelect }) => {
    const getAvatar = (player?: Player) => player?.avatarHistory?.[player.selectedAvatarIndex ?? 0] ?? null;

    const p1Avatar = getAvatar(players.player1);
    const p2Avatar = getAvatar(players.player2);

    if (!p1Avatar || !p2Avatar) return <div>Loading Avatars...</div>;

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 space-y-4 text-center animate-fade-in">
            <h2 className="text-3xl font-bold">Rock, Paper, Scissors!</h2>
            <p className="text-indigo-200 text-sm">
                Put the phone down and throw down! Time for a classic showdown to see who draws the spiral.
            </p>
            <p className="text-yellow-300 font-bold bg-black/20 p-2 rounded-lg text-sm">
                Play in real life, then tap the winner's avatar below.
            </p>
            <div className="flex flex-row gap-4 justify-center items-center pt-4">
                {/* Player 1 Winner Selection */}
                <div 
                    onClick={() => onWinnerSelect('player1')} 
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                    <img 
                        src={`data:image/png;base64,${p1Avatar}`} 
                        alt={`${players.player1.name}'s avatar`} 
                        className="w-24 h-24 object-cover rounded-full border-4 border-cyan-400 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-cyan-400/50" 
                    />
                    <h3 className="font-bold text-base text-cyan-300 transition-all duration-300 group-hover:scale-105">{players.player1.name}</h3>
                    <span className="bg-cyan-500/80 text-white font-bold py-1 px-4 rounded-lg text-sm shadow-md transition-transform transform group-hover:scale-105">I Won!</span>
                </div>

                <div className="text-2xl font-bold text-indigo-300 animate-pulse pb-10">VS</div>

                {/* Player 2 Winner Selection */}
                <div 
                    onClick={() => onWinnerSelect('player2')} 
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                    <img 
                        src={`data:image/png;base64,${p2Avatar}`} 
                        alt={`${players.player2!.name}'s avatar`} 
                        className="w-24 h-24 object-cover rounded-full border-4 border-pink-400 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-pink-400/50"
                    />
                    <h3 className="font-bold text-base text-pink-400 transition-all duration-300 group-hover:scale-105">{players.player2!.name}</h3>
                    <span className="bg-pink-500/80 text-white font-bold py-1 px-4 rounded-lg text-sm shadow-md transition-transform transform group-hover:scale-105">I Won!</span>
                </div>
            </div>
        </div>
    );
};

// Step 5+: Fortune Reveal
const FortuneReveal: React.FC<{
    step: string, results: MashResults, players: Players, story: string | null, storyTone: StoryTone, fortuneImage: string | null, animatedImageFrames: [string, string] | null, setStoryTone: (tone: StoryTone) => void, onGenerateStory: () => void, onGenerateImage: () => void, onAnimateImage: () => void, onRestart: () => void, showAllResults: boolean, onSlideshowComplete: () => void
}> = (props) => {
    const { step, results, players, story, storyTone, fortuneImage, animatedImageFrames, setStoryTone, onGenerateStory, onGenerateImage, onAnimateImage, onRestart, showAllResults, onSlideshowComplete } = props;
    const [resultStep, setResultStep] = useState(0);
    const resultKeys = Object.keys(results);
    const storyRef = useRef<HTMLDivElement>(null);
    const [typedStory, setTypedStory] = useState('');
    const [isBlinking, setIsBlinking] = useState(false);

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


    useEffect(() => {
        if (step === 'STORY_REVEAL' && story) {
            storyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTypedStory('');
            let i = 0;
            const interval = setInterval(() => {
                setTypedStory(story.slice(0, i));
                i++;
                if (i > story.length) {
                    clearInterval(interval);
                }
            }, 25);
            return () => clearInterval(interval);
        }
    }, [step, story]);

    // Blinking effect for the animated image
    useEffect(() => {
        if (step === 'ANIMATION_REVEAL' && animatedImageFrames) {
            const blinkInterval = setInterval(() => {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 200); // Blink duration
            }, 3000); // Blink every 3 seconds
            return () => clearInterval(blinkInterval);
        }
    }, [step, animatedImageFrames]);

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
        if (players.mode === 'coop') return "Generate Our Story";
        if (players.mode === 'sabotage') return "Generate Their Story";
        return "Generate My Story";
    }, [players.mode]);

    const imageButtonText = useMemo(() => {
        if (players.mode === 'coop') return "Wanna SEE your MASH Fortune Together?";
        return "Wanna SEE your MASH Fortune?";
    }, [players.mode]);

    const storyTitle = useMemo(() => {
        if (players.mode === 'coop') return "Read The Story of Your Lives!";
        if (players.mode === 'sabotage') return "Read The Story of Their Life!";
        return "Read The Story of Your Life!";
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
                        <p className="text-indigo-200 mb-4 text-sm">Choose a vibe and let our AI storyteller write your destiny.</p>
                        {!(players.mode === 'sabotage') && (
                             <div className="flex justify-center gap-1 bg-black/20 p-1 rounded-full mb-4 max-w-xs mx-auto">
                                {STORY_MODES.map(mode => <button key={mode.id} onClick={() => setStoryTone(mode.id as StoryTone)} className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 ${storyTone === mode.id ? 'bg-pink-500 text-white' : 'bg-transparent text-indigo-200 hover:bg-white/10'}`}>{mode.emoji} {mode.title}</button>)}
                            </div>
                        )}
                        {!story && <button onClick={onGenerateStory} className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:scale-105 transition-transform text-black font-bold py-2 px-6 rounded-lg text-base shadow-lg">{storyButtonText}</button>}
                        {step === 'STORY_REVEAL' && story && (
                             <>
                                <div className="mt-4 p-4 bg-black/20 rounded-lg text-left whitespace-pre-wrap text-indigo-100 text-sm min-h-[100px]"><p>{typedStory}</p></div>
                                <div className="mt-4"><ShareButtons textToCopy={story} /></div>
                            </>
                        )}
                    </div>

                    {/* Image */}
                    {step === 'STORY_REVEAL' && story && (
                        <div className="text-center">
                            <button onClick={onGenerateImage} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg">{imageButtonText}</button>
                        </div>
                    )}
                    {(step === 'IMAGE_REVEAL' || step === 'ANIMATION_REVEAL') && fortuneImage && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20 text-center">
                            <h2 className="text-2xl font-bold mb-4">{step === 'ANIMATION_REVEAL' ? 'Your Living Fortune!' : 'Your Future Portrait!'}</h2>
                            <img 
                                src={`data:image/png;base64,${step === 'ANIMATION_REVEAL' && animatedImageFrames ? (isBlinking ? animatedImageFrames[1] : animatedImageFrames[0]) : fortuneImage}`} 
                                alt="Fortune portrait" 
                                className="w-full aspect-[9/16] object-cover rounded-lg shadow-lg mx-auto max-w-xs" 
                            />
                            <div className="mt-4">
                                <ShareButtons base64Image={fortuneImage} fileName="my-mash-fortune.png" />
                            </div>
                        </div>
                    )}


                    {/* Animation Button */}
                    {step === 'IMAGE_REVEAL' && fortuneImage && (
                        <div className="text-center">
                            <button onClick={onAnimateImage} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg">Bring my MASH Fortune to LIFE!</button>
                        </div>
                    )}
                    

                    {/* Actions */}
                    {(step === 'ANIMATION_REVEAL' || step === 'IMAGE_REVEAL') && (
                         <div className="border-t border-white/10 pt-6">
                            <button onClick={onRestart} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg text-lg">Play Again</button>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default App;