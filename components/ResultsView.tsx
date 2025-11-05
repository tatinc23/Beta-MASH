import React, { useState, useEffect, useRef } from 'react';
import { MashResults, StoryMode } from '../types';
import { Players } from '../App';
import { generateStory, generateCharacterPortrait, animatePortrait } from '../services/geminiService';
import { STORY_MODES, SALARY_TIERS, CATEGORY_INFO, GAME_MODE_STORY_FILTER } from '../constants';
import LoadingOverlay from './LoadingOverlay';

interface ResultsViewProps {
  results: MashResults;
  players: Players;
  onRestart: () => void;
}

// A list of reassuring messages for the video generation loading screen.
const loadingMessages = [
    "Warming up the flux capacitor...",
    "Reticulating splines...",
    "Asking the Magic 8-Ball for advice...",
    "Buffering your future on a 28.8k modem...",
    "Recording your future on a fresh VHS tape...",
    "Consulting the psychic friends network...",
    "This is taking longer than a commercial break on SNICK...",
];

const getSalaryTier = (salaryString: string): string => {
  const lowerCaseSalary = salaryString.toLowerCase();
  for (const tierInfo of SALARY_TIERS) {
    for (const keyword of tierInfo.keywords) {
      if (lowerCaseSalary.includes(keyword.toLowerCase())) {
        return tierInfo.tier;
      }
    }
  }
  return "Stylin' on a Budget 🤙"; // A safe, neutral default
};

const getCategoryInfo = (categoryKey: string) => {
    return CATEGORY_INFO[categoryKey] || { name: categoryKey, icon: '🌟' };
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, players, onRestart }) => {
  const [story, setStory] = useState<string | null>(null);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const [portraitImage, setPortraitImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ p1: File | null, p2: File | null }>({ p1: null, p2: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const keySelectedRef = useRef(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFor, setCameraFor] = useState<'p1' | 'p2' | null>(null);

  // Determine which story modes to show based on game mode
  const availableStoryModes = React.useMemo(() => {
    let modeIds: string[];
    if (players.mode === 'friend') {
      modeIds = GAME_MODE_STORY_FILTER.friend[players.friendModeStyle || 'nice'];
    } else if (players.mode === 'coop') {
      modeIds = GAME_MODE_STORY_FILTER.coop;
    } else {
      modeIds = GAME_MODE_STORY_FILTER.self;
    }
    return STORY_MODES.filter(mode => modeIds.includes(mode.id));
  }, [players.mode, players.friendModeStyle]);

  // Reset selected mode if game mode changes
  useEffect(() => {
    setSelectedModeId(null);
  }, [availableStoryModes]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, player: 'p1' | 'p2') => {
    if (e.target.files && e.target.files[0]) {
      setPhotos(prev => ({ ...prev, [player]: e.target.files![0] }));
    }
  };
  
  const openCamera = async (player: 'p1' | 'p2') => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setCameraFor(player);
        setIsCameraOpen(true);
    } catch (err) {
        console.error("Camera error:", err);
        setError("Couldn't access the camera, my dude. Check your browser permissions.");
    }
  };

  const closeCamera = () => {
    if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraFor(null);
  };
  
  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current && cameraFor) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob(blob => {
            if (blob) {
                const file = new File([blob], `selfie_${cameraFor}.jpg`, { type: 'image/jpeg' });
                setPhotos(prev => ({ ...prev, [cameraFor!]: file }));
            }
        }, 'image/jpeg');
    }
    closeCamera();
  };

  const handleGenerateStory = async () => {
    if (!selectedModeId) return;
    setIsLoading(true);
    setLoadingText("Writing your totally tubular story...");
    setError(null);
    try {
      const generatedStory = await generateStory(results, players, selectedModeId);
      setStory(generatedStory);
    } catch (err: any) {
      setError(`Bummer! The story couldn't be written. ${err.message}`);
    }
    setIsLoading(false);
  };
  
  const handleGeneratePortrait = async () => {
    setIsLoading(true);
    setLoadingText("Creating your MASH Life Portrait...");
    setError(null);
    try {
      const portrait = await generateCharacterPortrait(players, results, photos);
      setPortraitImage(`data:image/jpeg;base64,${portrait}`);
    } catch (err: any) {
       setError(`Dang! The portrait couldn't be made. ${err.message}`);
    }
    setIsLoading(false);
  };
  
  const handleAnimatePortrait = async () => {
    if(!portraitImage) return;

    setIsLoading(true);
    setIsAnimating(true);
    setError(null);

    // API Key Check
    try {
        if (!keySelectedRef.current) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setLoadingText("Please select your Google AI Studio API key to animate your portrait.");
                await window.aistudio.openSelectKey();
            }
            keySelectedRef.current = true;
        }
    } catch(err) {
        setError("Could not verify API Key. Please try again.");
        setIsLoading(false);
        setIsAnimating(false);
        return;
    }

    // Play dialup sound after 1-2 second pause
    setTimeout(() => {
        const dialupAudio = new Audio('/dialup.mp3');
        dialupAudio.play().catch(err => console.error("Could not play dialup sound:", err));
    }, 1500);

    const messageInterval = setInterval(() => {
        setLoadingText(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 3000);

    try {
        const portraitBase64 = portraitImage.split(',')[1];
        const videoDownloadUri = await animatePortrait(portraitBase64);
        
        const response = await fetch(`${videoDownloadUri}&key=${process.env.API_KEY}`);
        if (!response.ok) {
           if (response.status === 404 || response.status === 400) { 
                keySelectedRef.current = false; 
                throw new Error("That API Key didn't work. Try another one.");
            }
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));

    } catch (err: any) {
        if (err.message.includes('API Key')) {
            keySelectedRef.current = false;
        }
        setError(`Whoops! The animation hit a snag. ${err.message}`);
    } finally {
        clearInterval(messageInterval);
        setIsLoading(false);
        setIsAnimating(false);
    }
  };


  const isPortraitButtonDisabled = players.mode === 'coop' ? (!photos.p1 || !photos.p2) : !photos.p1;
  
  // Determine the correct name(s) for the title based on the game mode, handling possessives correctly.
  const getPlayerTitle = () => {
    if (players.mode === 'coop') {
      const p1 = players.player1.name || 'Player 1';
      const p2 = players.player2?.name || 'Player 2';
      return `${p1} & ${p2}'s`;
    }
    if (players.mode === 'friend') {
      const friendName = players.player2?.name;
      // The fortune is FOR the friend (player2)
      return friendName ? `${friendName}'s` : "Your Friend's";
    }
    // 'self' mode
    const selfName = players.player1.name;
    // Handle the case where the name is empty to avoid "Your's"
    return selfName ? `${selfName}'s` : 'Your';
  };
  
  const portraitButtonText = players.mode === 'coop' ? 'Bring Our MASH Fortune To Life!' : 'Bring My MASH Fortune To Life!';

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
      {isLoading && <LoadingOverlay text={loadingText} playSound={isAnimating} />}
      
      <div className="text-center mb-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-yellow-300 leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          {getPlayerTitle()}
        </h2>
        <p className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300 py-1 inline-block">
          M.A.S.H. FORTUNE
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Results & Story */}
        <div className="space-y-6">
          <div className="bg-black/20 p-4 rounded-2xl border-2 border-purple-500/50 shadow-lg">
            <div className="space-y-2">
              {Object.entries(results).map(([category, result]) => {
                // Fix: Cast `result` to `string` to resolve a TypeScript type inference issue.
                const displayResult = category === 'Salary' ? getSalaryTier(result as string) : result;
                const catInfo = getCategoryInfo(category);
                return (
                  <div key={category} className="bg-white/10 p-3 rounded-lg transform transition-transform hover:scale-105 flex items-center">
                    <span className="text-2xl mr-3">{catInfo.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-cyan-300">{category}</p>
                      <p className="text-white font-semibold text-lg">{displayResult}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Story Generation Section */}
          <div className="bg-black/20 p-4 rounded-lg">
            {!story ? (
              <>
                <h3 className="text-xl font-bold mb-3 text-yellow-300">Choose Your Story Style:</h3>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                    {availableStoryModes.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedModeId(mode.id)}
                            className={`p-2 rounded-lg text-left transition-all duration-200 border-2 flex items-start gap-2 ${
                                selectedModeId === mode.id
                                ? 'bg-purple-600 border-white shadow-lg'
                                : 'bg-white/10 border-transparent hover:border-purple-400'
                            }`}
                        >
                            <span className="text-xl mt-1">{mode.emoji}</span>
                            <div>
                                <p className="font-bold text-sm">{mode.title}</p>
                                <p className="text-xs text-indigo-200">{mode.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <button 
                  onClick={handleGenerateStory} 
                  disabled={!selectedModeId}
                  className="w-full mt-4 bg-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Tell The Story!
                </button>
              </>
            ) : (
                <div>
                    <h3 className="text-xl font-bold mb-2 text-yellow-300">The 4-1-1:</h3>
                    <p className="text-indigo-200 whitespace-pre-wrap font-serif">{story}</p>
                </div>
            )}
          </div>
        </div>

        {/* Right Column: Portrait & Video */}
        <div className="space-y-6">
            {/* Photo Uploads */}
            <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-center">Star in Your Story!</h3>
                <div className="space-y-4">
                     {/* Player 1 */}
                     <div>
                        <p className="font-semibold mb-2 text-center">{players.player1.name || 'Your'} Photo</p>
                        <div className="flex gap-2">
                            <label className="flex-1 cursor-pointer text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                                🖼️ Upload Photo
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'p1')} className="hidden" />
                            </label>
                            <button onClick={() => openCamera('p1')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">📸 Take Selfie</button>
                        </div>
                        {photos.p1 && <p className="text-xs text-center mt-1 text-green-400">✅ {photos.p1.name}</p>}
                     </div>
                     {/* Player 2 (Co-op) */}
                     {players.mode === 'coop' && (
                        <div>
                            <p className="font-semibold mb-2 text-center">{players.player2?.name}'s Photo</p>
                            <div className="flex gap-2">
                                <label className="flex-1 cursor-pointer text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                                    🖼️ Upload Photo
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'p2')} className="hidden" />
                                </label>
                                <button onClick={() => openCamera('p2')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">📸 Take Selfie</button>
                            </div>
                            {photos.p2 && <p className="text-xs text-center mt-1 text-green-400">✅ {photos.p2.name}</p>}
                        </div>
                     )}
                </div>

                {!portraitImage && (
                    <button onClick={handleGeneratePortrait} disabled={isPortraitButtonDisabled} className="w-full mt-4 bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                        ✨ {portraitButtonText}
                    </button>
                )}
            </div>

            {/* Portrait & Video Display */}
            {portraitImage && !videoUrl && (
                <div className="text-center space-y-4">
                    <img src={portraitImage} alt="MASH Life Portrait" className="w-full rounded-lg mx-auto border-4 border-pink-400 shadow-lg" />
                    <button onClick={handleAnimatePortrait} className="w-full bg-cyan-400 text-black font-bold py-2 px-4 rounded-lg">
                        🎬 Animate My Portrait!
                    </button>
                </div>
            )}
            
            {videoUrl && (
                <div>
                     <h3 className="text-xl font-bold mb-2 text-yellow-300">Your Living 90s Moment!</h3>
                     <video src={videoUrl} controls autoPlay loop muted className="w-full rounded-lg shadow-lg border-2 border-cyan-400" />
                </div>
            )}
            
            {error && <div className="bg-red-500/20 p-4 rounded-lg text-red-300 text-center">{error}</div>}
        </div>
      </div>
      
      <button onClick={onRestart} className="w-full mt-8 bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black font-bold py-3 px-4 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105">
        Play Again!
      </button>

      {isCameraOpen && (
          <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
              <video ref={videoRef} autoPlay className="w-full max-w-md h-auto"></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
              <div className="flex gap-4 mt-4">
                  <button onClick={takeSelfie} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Snap Photo</button>
                  <button onClick={closeCamera} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default ResultsView;