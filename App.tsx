import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Players, MashResults, StoryTone, Player, CategoryConfig } from './types';
import { generateHeadshotAvatar, editHeadshotAvatar, generateStory, generateFortuneImage } from './services/geminiService';
import { saveToCloset } from './services/closetService';
import { DEFAULT_CATEGORIES, PLACEHOLDER_AVATAR, DIAL_UP_SOUND_DATA_URL, PLACEHOLDER_AVATAR_2 } from './constants';
import { COOP_CATEGORIES } from './coop_categories';

import WelcomeScreen from './components/WelcomeScreen';
import ModeSelection from './components/Step0_ModeSelection';
import PlayerSetup from './components/Step1a_PlayerSetup';
import AvatarReview from './components/Step1b_AvatarReview';
import CategoriesSetup from './components/Step2_Categories';
import RockPaperScissors from './components/Step2b_RPS';
import Step3Spiral from './components/Step3_Spiral';
import Step4Elimination from './components/Step4_Elimination';
import FortuneReveal from './components/Step5_FortuneReveal';
import UpgradeTeaser from './components/Step6_UpgradeTeaser';
import Feedback from './components/Feedback';
import RickRollPrank from './components/RickRollPrank';

// --- DEVELOPER MODE & TOOLBAR ---
// YES! You can absolutely use this for your development workflow.
// This is the perfect place to make and test your UI changes.
//
// YOUR WORKFLOW:
// 1. Set DEV_MODE to `true` below. This will bypass all slow AI calls and
//    show the Dev Toolbar at the bottom of the screen.
// 2. Use the toolbar to instantly jump to any step of the application.
// 3. Make your desired code changes in the files. The app will hot-reload.
// 4. When you're happy with your changes, you can copy the full content of
//    the modified files and send them to the other assistant to implement.
//
// Set to `true` to bypass all AI generation and show the Dev Toolbar for faster UI development.
const DEV_MODE = false;
// Set to `true` to show the in-app feedback button for testers.
const ENABLE_FEEDBACK = true;

const DEV_MODE_DELAY = 300; // ms

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
    const [step, setStep] = useState<string>('WELCOME');
    const [players, setPlayers] = useState<Players | null>(null);
    const [categories, setCategories] = useState<{ [key: string]: string[] } | null>(null);
    const [managedCategories, setManagedCategories] = useState<CategoryConfig[]>([]);
    const [magicNumber, setMagicNumber] = useState<number | null>(null);
    const [results, setResults] = useState<MashResults | null>(null);
    const [story, setStory] = useState<string | null>(null);
    const [fortuneImage, setFortuneImage] = useState<string | null>(null);
    const [rpsWinner, setRpsWinner] = useState<'player1' | 'player2' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAllResults, setShowAllResults] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [editingPlayerKey, setEditingPlayerKey] = useState<'player1' | 'player2' | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

     // Sound Effects Logic
    useEffect(() => {
        const savedMute = localStorage.getItem('mash_sfx_muted');
        const initialMute = savedMute ? JSON.parse(savedMute) : false;
        setIsMuted(initialMute);

        // Create a single Audio object instance and reuse it
        const audio = new Audio(DIAL_UP_SOUND_DATA_URL); 
        audio.loop = true;
        audio.muted = initialMute;
        audioRef.current = audio;

    }, []);

    const toggleMute = () => {
        setIsMuted(prev => {
            const newMuted = !prev;
            localStorage.setItem('mash_sfx_muted', JSON.stringify(newMuted));
            if (audioRef.current) {
                audioRef.current.muted = newMuted;
            }
            return newMuted;
        });
    };
    
    // Controls playback based on the current step
    useEffect(() => {
        const shouldPlaySound = step === 'AVATAR_GENERATION' || step === 'IMAGE_GENERATION_LOADING' || editingPlayerKey !== null;
        const audio = audioRef.current;

        if (audio) {
            if (shouldPlaySound && !audio.muted) {
                // The `play` method returns a promise which can be rejected if the user hasn't interacted with the page yet.
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        // We log the error but don't show it to the user, as it's often a browser policy issue.
                        console.error("Audio play failed:", e)
                    });
                }
            } else {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }, [step, isMuted, editingPlayerKey]); // Re-evaluate when step or mute state changes

    const handleRestart = () => {
        setStep('WELCOME');
    };

    const handleBackToModeSelection = () => {
        // Only reset player data, keep the app at the mode selection step
        setPlayers(null);
        setCategories(null);
        setManagedCategories([]);
        setMagicNumber(null);
        setResults(null);
        setStory(null);
        setFortuneImage(null);
        setRpsWinner(null);
        setError(null);
        setShowAllResults(false);
        setStep('MODE_SELECTION');
    };

    // --- Step Handlers ---
    
    const handleWelcomeComplete = () => {
        setStep('MODE_SELECTION');
    };

    const handleModeSelect = (
        mode: 'solo' | 'coop',
        gameStyle: 'avatar' | 'quick'
    ) => {
        const basePlayer: Player = { name: '' };
        setPlayers({
            mode,
            gameStyle,
            player1: {...basePlayer},
            ...(mode === 'coop' && { player2: {...basePlayer} }),
            ...(mode === 'coop' && gameStyle === 'avatar' && { relationship: '' }),
        });
        setStep('PLAYER_SETUP');
    };

    const handlePlayerSetupComplete = async (finalPlayers: Players) => {
        setPlayers(finalPlayers);

        if (finalPlayers.gameStyle === 'quick') {
            handleAvatarReviewComplete(); // This skips to category setup
            return;
        }

        const needsAvatarGeneration = 
            (finalPlayers.mode === 'solo' && finalPlayers.player1.photo && !finalPlayers.player1.avatarHistory) ||
            (finalPlayers.mode === 'coop' && finalPlayers.player1.photo && !finalPlayers.player1.avatarHistory) ||
            (finalPlayers.mode === 'coop' && finalPlayers.player2?.photo && !finalPlayers.player2.avatarHistory);

        if (!needsAvatarGeneration) {
            handleAvatarReviewComplete();
            return;
        }
        
        setStep('AVATAR_GENERATION');
        setError(null);
        try {
             if (DEV_MODE) {
                // --- DEV MODE: Bypass AI with placeholder ---
                const mockAvatars: { p1: string | null; p2: string | null } = { p1: null, p2: null };
                const p1NeedsGen = finalPlayers.mode === 'solo' || finalPlayers.mode === 'coop';
                const p2NeedsGen = finalPlayers.mode === 'coop';

                if (p1NeedsGen && finalPlayers.player1.photo && !finalPlayers.player1.avatarHistory) mockAvatars.p1 = PLACEHOLDER_AVATAR;
                if (p2NeedsGen && finalPlayers.player2?.photo && !finalPlayers.player2.avatarHistory) mockAvatars.p2 = PLACEHOLDER_AVATAR_2;
                
                await new Promise(resolve => setTimeout(resolve, DEV_MODE_DELAY)); // Simulate network
                
                 setPlayers(p => {
                    if (!p) return null;
                    const newP = {...p};
                    if (mockAvatars.p1) newP.player1 = { ...newP.player1, avatarHistory: [mockAvatars.p1], selectedAvatarIndex: 0 };
                    if (mockAvatars.p2) newP.player2 = { ...newP.player2!, avatarHistory: [mockAvatars.p2], selectedAvatarIndex: 0 };
                    return newP;
                });

            } else {
                // --- REAL AI GENERATION ---
                const p1NeedsGen = (finalPlayers.mode === 'solo' || finalPlayers.mode === 'coop') && finalPlayers.player1.photo && !finalPlayers.player1.avatarHistory;
                const p2NeedsGen = finalPlayers.mode === 'coop' && finalPlayers.player2?.photo && !finalPlayers.player2.avatarHistory;

                const p1Promise = p1NeedsGen ? generateHeadshotAvatar(finalPlayers.player1.photo!) : Promise.resolve(null);
                const p2Promise = p2NeedsGen ? generateHeadshotAvatar(finalPlayers.player2!.photo!) : Promise.resolve(null);

                const [p1Avatar, p2Avatar] = await Promise.all([p1Promise, p2Promise]);
                
                if (p1Avatar) saveToCloset(p1Avatar);
                if (p2Avatar) saveToCloset(p2Avatar);

                setPlayers(p => {
                    if (!p) return null;
                    const newP = {...p};
                    if (p1Avatar) newP.player1 = { ...newP.player1, avatarHistory: [p1Avatar], selectedAvatarIndex: 0 };
                    if (p2Avatar) newP.player2 = { ...newP.player2!, avatarHistory: [p2Avatar], selectedAvatarIndex: 0 };
                    return newP;
                });
            }
            
            setStep('AVATAR_REVIEW');
        } catch (e) {
            console.error(e);
            setError("Bummer! The AI avatar generator is sleeping. Try again with a different photo.");
            setStep('PLAYER_SETUP');
        }
    };

    const handleEditAvatar = async (playerKey: 'player1' | 'player2', prompt: string) => {
        if (!players) return;
        const player = players[playerKey];
        if (!player || !player.photo || !player.avatarHistory || player.selectedAvatarIndex === undefined || !prompt) return;

        setEditingPlayerKey(playerKey);
        setError(null);
        try {
            let newAvatar: string;
            if (DEV_MODE) {
                await new Promise(resolve => setTimeout(resolve, DEV_MODE_DELAY));
                
                // In DEV_MODE, generate a unique 1x1 pixel placeholder to prevent bugs
                // caused by identical base64 strings in the avatar history.
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const r = Math.floor(Math.random() * 256);
                    const g = Math.floor(Math.random() * 256);
                    const b = Math.floor(Math.random() * 256);
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillRect(0, 0, 1, 1);
                }
                const dataUrl = canvas.toDataURL('image/png');
                // We only need the base64 part
                newAvatar = dataUrl.split(',')[1];

            } else {
                const currentAvatar = player.avatarHistory[player.selectedAvatarIndex];
                newAvatar = await editHeadshotAvatar(player.photo, currentAvatar, prompt);
            }

            if (newAvatar) saveToCloset(newAvatar);

            setPlayers(prev => {
                if (!prev) return null;
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
        } catch (e) {
            console.error("Failed to edit avatar:", e);
            setError("Bummer! The AI couldn't make that edit. Try a different prompt.");
        } finally {
            setEditingPlayerKey(null);
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
                    name: key, // name will be looked up via CATEGORY_INFO in the component
                    icon: '✨', // icon will be looked up via CATEGORY_INFO
                    isCustom: false,
                    isSelected: true,
                }));
                setManagedCategories(dynamicCats);
            }
        } else {
            // This is the default for solo mode AND for quick-play coop mode
            setManagedCategories(DEFAULT_CATEGORIES.map(c => ({...c, isSelected: true})));
        }
        setStep('CATEGORIES');
    };


    const handleCategoriesSubmit = (submittedCategories: { [key: string]: string[] }) => {
        setCategories(submittedCategories);
        if (players?.mode === 'coop' && players.gameStyle === 'avatar') {
            setStep('RPS');
        } else {
            setStep('SPIRAL'); // Skip RPS for solo and quick-play modes
        }
    };

    const handleRpsWinner = (winner: 'player1' | 'player2') => {
        setRpsWinner(winner);
        setStep('SPIRAL');
    };

    const handleSpiralComplete = useCallback((num: number) => {
        setMagicNumber(num);
        setStep('ELIMINATION');
    }, []);

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
            if (DEV_MODE) {
                await new Promise(resolve => setTimeout(resolve, DEV_MODE_DELAY));
                setStory('This is a super cool story about your M.A.S.H. future! It was totally tubular.');
            } else {
                const newStory = await generateStory(results, players);
                setStory(newStory);
            }
            setStep('STORY_REVEAL');
        } catch(e) {
            console.error(e);
            setError("Yikes! The AI storyteller got writer's block. Please try again.");
            setShowAllResults(true);
            setStep('RESULTS_REVEAL'); 
        }
    };

    const handleGenerateImage = async () => {
        if (!results || !players) return;

        // Quick play mode does not generate images, as it has no avatars.
        if (players.gameStyle === 'quick') {
            handleInitiatePrank();
            return;
        }

        setStep('IMAGE_GENERATION_LOADING');
        setError(null);
        try {
            if (DEV_MODE) {
                await new Promise(resolve => setTimeout(resolve, DEV_MODE_DELAY));
                setFortuneImage(PLACEHOLDER_AVATAR);
            } else {
                let image: string | null = null;
                const getAvatar = (player?: Player) => player?.avatarHistory?.[player.selectedAvatarIndex ?? 0] ?? null;
                const p1Avatar = getAvatar(players.player1);
                const p2Avatar = getAvatar(players.player2);

                if (players.mode === 'coop' && p1Avatar && p2Avatar) {
                     image = await generateFortuneImage(p1Avatar, p2Avatar, results, players);
                } else if (players.mode === 'solo' && p1Avatar) {
                     image = await generateFortuneImage(p1Avatar, null, results, players);
                }
                
                if (image) {
                    setFortuneImage(image);
                } else {
                    throw new Error("Could not determine which avatar to use for image generation.");
                }
            }
            setStep('IMAGE_REVEAL');
        } catch(e) {
            console.error(e);
            setError("Major bummer! The AI art studio had a meltdown. Try generating again.");
            setStep('STORY_REVEAL'); // Go back
        }
    };

    const handleInitiatePrank = () => {
        setStep('RICK_ROLL');
    };
    
    // --- DEV TOOLBAR LOGIC ---
    const jumpToStep = (targetStep: string, mockData: any) => {
        const { players: mockPlayers, categories: mockCategories, magicNumber: mockMagicNumber, results: mockResults, story: mockStory, fortuneImage: mockFortuneImage } = mockData;
        
        handleRestart(); // Reset everything first
        
        if(mockPlayers) setPlayers(mockPlayers);
        if(mockCategories) setCategories(mockCategories);
        if(mockMagicNumber) setMagicNumber(mockMagicNumber);
        if(mockResults) {
            setResults(mockResults);
            setShowAllResults(true); // Always show full results when jumping
        }
        if (mockStory) setStory(mockStory);
        if (mockFortuneImage) setFortuneImage(mockFortuneImage);

        setStep(targetStep);
    };

    const DevToolbar = () => {
        if (!DEV_MODE) return null;
        
        const mockPlayers: Players = { mode: 'solo', player1: { name: 'Dev', avatarHistory: [PLACEHOLDER_AVATAR], selectedAvatarIndex: 0 } };
        const mockCategories = { Housing: ['M', 'A', 'S', 'H'], Spouse: ['S1', 'S2', 'S3', 'S4'] };
        const mockResults: MashResults = { Housing: 'Mansion', Spouse: 'A Furby', Job: 'Astronaut', Car: 'DeLorean' };
        
        const steps = [
            { name: 'Player Setup', step: 'PLAYER_SETUP', data: {} },
            { name: 'Avatar Review', step: 'AVATAR_REVIEW', data: { players: mockPlayers } },
            { name: 'Categories', step: 'CATEGORIES', data: { players: mockPlayers } },
            { name: 'Elimination', step: 'ELIMINATION', data: { players: mockPlayers, categories: mockCategories, magicNumber: 5 } },
            { name: 'Fortune Reveal', step: 'RESULTS_REVEAL', data: { players: mockPlayers, results: mockResults } },
            { name: 'Story Reveal', step: 'STORY_REVEAL', data: { players: mockPlayers, results: mockResults, story: 'This is a dev story.' } },
            { name: 'Image Reveal', step: 'IMAGE_REVEAL', data: { players: mockPlayers, results: mockResults, story: 'Dev story.', fortuneImage: PLACEHOLDER_AVATAR } },
        ];
        
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 p-2 z-50 flex flex-wrap gap-2 justify-center text-xs">
                 {steps.map(s => <button key={s.name} onClick={() => jumpToStep(s.step, s.data)} className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded">{s.name}</button>)}
            </div>
        )
    };

    // --- Render Logic ---
    const renderContent = () => {
        // LOADING STATES
        if (step === 'AVATAR_GENERATION') return <LoadingScreen text="Generating Your Avatar(s)..." showDialUp />;
        if (editingPlayerKey) return <LoadingScreen text="Applying Your Awesome Edit..." showDialUp />;
        if (step === 'STORY_GENERATION_LOADING') return <LoadingScreen text="Writing Your Destiny..." />;
        if (step === 'IMAGE_GENERATION_LOADING') return <LoadingScreen text="Painting Your Future..." showDialUp />;

        switch (step) {
            case 'WELCOME':
                return <WelcomeScreen onStart={handleWelcomeComplete} />;
            case 'MODE_SELECTION':
                return <ModeSelection onSelect={handleModeSelect} />;
            case 'PLAYER_SETUP':
                if (players) return <PlayerSetup onComplete={handlePlayerSetupComplete} initialPlayers={players} onGoBack={handleBackToModeSelection} />;
                break;
            case 'AVATAR_REVIEW':
                if (players) return <AvatarReview players={players} setPlayers={setPlayers} onContinue={handleAvatarReviewComplete} onEditAvatar={handleEditAvatar} editingPlayerKey={editingPlayerKey} />;
                break;
            case 'CATEGORIES':
                if (players) return <CategoriesSetup onCategoriesSubmit={handleCategoriesSubmit} players={players} managedCategories={managedCategories} setManagedCategories={setManagedCategories} />;
                break;
            case 'RPS':
                if (players) return <RockPaperScissors players={players} onWinnerSelect={handleRpsWinner} />;
                break;
            case 'SPIRAL':
                return <Step3Spiral onSpiralComplete={handleSpiralComplete} />;
            case 'ELIMINATION':
                if (categories && magicNumber !== null) return <Step4Elimination categories={categories} magicNumber={magicNumber} onEliminationComplete={handleEliminationComplete} />;
                break;
            case 'RESULTS_REVEAL':
            case 'STORY_REVEAL':
            case 'IMAGE_REVEAL':
                 if (results && players) {
                    return <FortuneReveal
                        step={step}
                        results={results}
                        players={players}
                        story={story}
                        fortuneImage={fortuneImage}
                        onGenerateStory={handleGenerateStory}
                        onGenerateImage={handleGenerateImage}
                        onStartPrank={handleInitiatePrank}
                        showAllResults={showAllResults}
                        onSlideshowComplete={() => setShowAllResults(true)}
                    />
                 }
                 break;
            case 'RICK_ROLL':
                return <RickRollPrank onComplete={() => setStep('UPGRADE_TEASER')} />;
            case 'UPGRADE_TEASER':
                return <UpgradeTeaser onRestart={handleBackToModeSelection} />;
            default:
                handleRestart(); // Fallback to reset
                return <WelcomeScreen onStart={handleWelcomeComplete} />;
        }
        return <div>Loading...</div>; // Default loading for state transitions
    };

    const isGameplayStep = !['WELCOME', 'MODE_SELECTION', 'PLAYER_SETUP', 'AVATAR_GENERATION', 'AVATAR_REVIEW'].includes(step);

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white font-sans p-4 flex flex-col items-center">
            <div className="w-full max-w-lg mx-auto">
                <header className={`text-center transition-all duration-500 ${isGameplayStep ? 'mb-4' : 'mb-8'}`}>
                    <h1 className={`font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300 transition-all duration-500 ${isGameplayStep ? 'text-4xl' : 'text-5xl'}`}>
                        90s Baby M.A.S.H.
                    </h1>
                     <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGameplayStep ? 'max-h-0' : 'max-h-24 mt-2'}`}>
                        <p className="text-indigo-300">Your totally awesome M.A.S.H. future awaits!</p>
                    </div>
                </header>
                {error && <div className="bg-red-500/80 text-white p-3 rounded-lg text-center my-4 animate-fade-in text-sm">{error} <button onClick={() => setError(null)} className="font-bold ml-2 underline">OK</button></div>}
                {renderContent()}
            </div>
             <div className="fixed bottom-4 right-4 flex gap-3 z-40">
                {ENABLE_FEEDBACK && <Feedback />}
                <button
                    onClick={toggleMute}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110"
                    aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                    title={isMuted ? "Unmute sound" : "Mute sound"}
                >
                    <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
                </button>
            </div>
             <DevToolbar />
        </main>
    );
};

export default App;