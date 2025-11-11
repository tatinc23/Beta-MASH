import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Players, Player } from '../types';
import { PLACEHOLDER_AVATAR_PHOTO } from '../constants';
import { getCloset, removeFromCloset } from '../services/closetService';


// SVG placeholder for a cleaner UI
const PlaceholderIcon = () => (
    <div className="w-full h-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-indigo-400/50">
            <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
            <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.791.56 2.311 1.284a.75.75 0 01-.256 1.213l-1.28.64a.75.75 0 00-.41.675v.233c.33.05.654.123.972.218a.75.75 0 01.587.899l-.91 3.528a.75.75 0 01-1.427-.368l.68-2.628a.75.75 0 00-.594-.863 48.995 48.995 0 00-3.322-.44C11.123 11.25 10 12.25 10 13.5v.387a.75.75 0 01-1.18.618l-1.46-1.167a.75.75 0 01.34-1.332l1.24-.248a.75.75 0 00.574-.666v-.125a.75.75 0 01.75-.75h.336a49.155 49.155 0 012.399-.226.75.75 0 00.75-.75V9.75a.75.75 0 01-.75-.75h-.336a49.155 49.155 0 01-2.399.226.75.75 0 00-.75.75v.852a.75.75 0 01-1.5 0V9.75c0-1.25 1.123-2.25 2.5-2.25h.336c.45 0 .896.03 1.336.091L15 6.425a.75.75 0 01.256-1.213A3.98 3.98 0 0012.336 4.5c-2.12 0-3.956.936-4.99 2.401a.75.75 0 01-1.284-.792A5.48 5.48 0 019.344 3.07zM1.5 13.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H2.25a.75.75 0 01-.75-.75zM22.5 13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM6 16.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM18 16.5a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM12 21a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" />
        </svg>
    </div>
);

const PhotoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
  
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

const ClosetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


// Main component
const PlayerSetup: React.FC<{ onComplete: (players: Players) => void, initialPlayers: Players, onGoBack: () => void }> = ({ onComplete, initialPlayers, onGoBack }) => {
    const [players, setPlayers] = useState(initialPlayers);
    const [cameraTarget, setCameraTarget] = useState<'player1' | 'player2' | 'together' | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [coopConsent, setCoopConsent] = useState(false);
    const [uploadContext, setUploadContext] = useState<{ player: 'player1' | 'player2' | 'together', type: 'photo' | 'avatar' } | null>(null);
    const [isClosetOpen, setIsClosetOpen] = useState(false);
    const [closetAvatars, setClosetAvatars] = useState<string[]>([]);
    const [closetTarget, setClosetTarget] = useState<'player1' | 'player2' | null>(null);


    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const { mode, gameStyle } = players;
    const isQuickPlay = gameStyle === 'quick';

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
    
    const handleTriggerUpload = (player: 'player1' | 'player2' | 'together', type: 'photo' | 'avatar') => {
        setUploadContext({ player, type });
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!uploadContext) return;

        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                const data = { base64, mimeType: file.type };

                if (uploadContext.type === 'photo') {
                    handlePhotoData(data, uploadContext.player);
                } else {
                    handleAvatarData(data, uploadContext.player as 'player1' | 'player2');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoData = (photo: { base64: string, mimeType: string }, target: 'player1' | 'player2' | 'together') => {
        if (target === 'together') {
            setPlayers(prev => ({ ...prev, togetherPhoto: photo }));
        } else if (target === 'player1') {
             setPlayers(prev => ({ ...prev, player1: { ...prev.player1, photo, avatarHistory: undefined, selectedAvatarIndex: undefined } }));
        } else if (target === 'player2') {
             setPlayers(prev => ({ ...prev, player2: { ...prev.player2!, photo, avatarHistory: undefined, selectedAvatarIndex: undefined } }));
        }
    };

    const handleAvatarData = (avatar: { base64: string, mimeType: string }, target: 'player1' | 'player2') => {
        const playerData = {
            photo: avatar, // Use avatar as photo for editing reference
            avatarHistory: [avatar.base64],
            selectedAvatarIndex: 0
        };

        if (target === 'player1') {
            setPlayers(prev => ({ ...prev, player1: { ...prev.player1, ...playerData } }));
        } else if (target === 'player2') {
            setPlayers(prev => ({ ...prev, player2: { ...prev.player2!, ...playerData } }));
        }
    };

    const handleOpenCloset = (playerKey: 'player1' | 'player2') => {
        setClosetAvatars(getCloset());
        setClosetTarget(playerKey);
        setIsClosetOpen(true);
    };

    const handleSelectFromCloset = (avatarBase64: string) => {
        if (!closetTarget) return;
        const avatarData = { base64: avatarBase64, mimeType: 'image/png' };
        handleAvatarData(avatarData, closetTarget);
        setIsClosetOpen(false);
    };

    const handleDeleteFromCloset = (avatarToDelete: string) => {
        removeFromCloset(avatarToDelete);
        setClosetAvatars(prev => prev.filter(avatar => avatar !== avatarToDelete));
    };


    // Derived State & Checks
    const isCoop = mode === 'coop';
    const isSolo = mode === 'solo';

    const isComplete = useMemo(() => {
        const p1NameReady = !!players.player1.name;
        const p2NameReady = !!players.player2?.name;
        if (isSolo) return p1NameReady;
        if (isCoop) {
            const namesReady = p1NameReady && p2NameReady;
            if (isQuickPlay) return namesReady;
            return !!(namesReady && players.relationship && coopConsent);
        }
        return false;
    }, [players, isSolo, isCoop, coopConsent, isQuickPlay]);

    const handleSubmit = () => {
        const finalPlayers = JSON.parse(JSON.stringify(players));

        if (!isQuickPlay) {
            const p1NeedsAvatar = isSolo || isCoop;
            const p2NeedsAvatar = isCoop;
            // If a player needs an avatar but hasn't provided a photo or chosen from the closet, assign a placeholder.
            if (p1NeedsAvatar && !finalPlayers.player1.photo && !finalPlayers.player1.avatarHistory) {
                finalPlayers.player1.photo = PLACEHOLDER_AVATAR_PHOTO;
            }
            if (p2NeedsAvatar && finalPlayers.player2 && !finalPlayers.player2.photo && !finalPlayers.player2.avatarHistory) {
                finalPlayers.player2.photo = PLACEHOLDER_AVATAR_PHOTO;
            }
        }
        
        onComplete(finalPlayers);
    };

    const submitButtonText = useMemo(() => {
        if (isQuickPlay) return "Let's Play!";
        
        const p1HasExisting = !!players.player1.avatarHistory;
        const p2HasExisting = !!players.player2?.avatarHistory;
        
        if (isSolo) {
            return p1HasExisting ? "Confirm My Avatar" : "Generate My Avatar";
        }
        if (isCoop) {
            const bothHaveExisting = p1HasExisting && p2HasExisting;
            return bothHaveExisting ? "Confirm Our Avatars" : "Generate Our Avatars";
        }

        return "Generate My Avatar";
    }, [isSolo, isCoop, players, isQuickPlay]);
    
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
    
    const renderClosetModal = () => (
        isClosetOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsClosetOpen(false)}>
                <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/20" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Avatar Closet</h2>
                        <button onClick={() => setIsClosetOpen(false)} className="text-2xl hover:text-pink-400 transition">&times;</button>
                    </div>
                    {closetAvatars.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 overflow-y-auto pr-2">
                            {closetAvatars.map((avatar, index) => (
                                <div key={index} className="relative group">
                                    <img 
                                        src={`data:image/png;base64,${avatar}`} 
                                        alt="Saved avatar"
                                        onClick={() => handleSelectFromCloset(avatar)}
                                        className="w-full aspect-square object-cover rounded-lg cursor-pointer transition-transform transform group-hover:scale-105"
                                    />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFromCloset(avatar); }}
                                        className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete avatar"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center text-indigo-300">
                            <p>Your closet is empty!<br/>Generated avatars will be saved here automatically.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    );

    const PlayerUploader = ({ playerKey, borderColor }: { playerKey: 'player1' | 'player2', borderColor: string }) => {
        const player = players[playerKey];
        const displayImage = player?.avatarHistory?.[player.selectedAvatarIndex ?? 0] || (player?.photo ? `data:${player.photo.mimeType};base64,${player.photo.base64}` : null);
        
        return (
             <div className="flex flex-col items-center gap-3">
                <div className={`w-32 h-32 bg-gray-900/50 p-2 rounded-lg flex items-center justify-center overflow-hidden border-4 ${borderColor} shadow-lg`}>
                    {displayImage ? <img src={displayImage.startsWith('data:') ? displayImage : `data:image/png;base64,${displayImage}`} alt="avatar" className="w-full h-full object-cover rounded-sm" /> : <PlaceholderIcon />}
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs mt-1">
                    {/* --- AI Generation Section --- */}
                    <div className="text-center">
                        <h4 className="text-sm font-bold text-indigo-200">Create an AI Avatar</h4>
                        <div className="flex flex-col gap-2 mt-2">
                            <button type="button" onClick={() => handleTriggerUpload(playerKey, 'photo')} className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-cyan-700 active:border-b-0 active:translate-y-1">
                                <PhotoIcon /> Upload Photo
                            </button>
                            <button type="button" onClick={() => { setCameraTarget(playerKey); setIsCameraOpen(true); }} className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">
                                <CameraIcon /> Use Camera
                            </button>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 my-2"></div>

                     {/* --- Existing Image Section --- */}
                    <div className="text-center">
                        <h4 className="text-sm font-bold text-indigo-200">Use an Existing Image</h4>
                        <div className="flex flex-col gap-2 mt-2">
                            <button type="button" onClick={() => handleTriggerUpload(playerKey, 'avatar')} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-green-700 active:border-b-0 active:translate-y-1">
                                <UploadIcon /> Use Your Own
                            </button>
                            <button type="button" onClick={() => handleOpenCloset(playerKey)} className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1">
                                <ClosetIcon /> From Closet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 animate-fade-in">
            {renderCameraModal()}
            {renderClosetModal()}
            <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            {/* --- HEADER --- */}
            <div>
                 <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                    {isQuickPlay ? "Who's Playing?" : "Design Your M.A.S.H. Star!"}
                </h2>
                <p className="text-center text-indigo-200 mb-6 text-sm">
                    {isQuickPlay ? "Just enter your name(s) and let's go!" : "First, we just need your name. Then, get ready to play!"}
                </p>
            </div>

            {/* --- NAME & PHOTO UPLOADERS --- */}
            <div className="space-y-4">
                 {isSolo && <SoloNameInput player={players.player1} setPlayers={setPlayers} />}
                 {isCoop && <CoopNameInputs players={players} setPlayers={setPlayers} isQuickPlay={isQuickPlay} />}
            
                {!isQuickPlay && (
                    <div className="space-y-4">
                        <div className="border-t border-white/10 w-full pt-4 text-center mt-2">
                             <h3 className="text-xl font-bold tracking-tight text-yellow-300">📸 Strike a Pose! 📸</h3>
                             <p className="text-indigo-200 text-sm">Create a new avatar with AI or use an existing one.</p>
                             <p className="text-xs text-indigo-300/80 mt-1">For best results with AI, use a clear, forward-facing headshot. No sunglasses!</p>
                             {cameraError && <p className="text-red-400 text-center text-sm mt-2">{cameraError}</p>}
                        </div>

                        {isSolo && <div className="flex justify-center"><PlayerUploader playerKey="player1" borderColor="border-cyan-400" /></div>}
                        
                        {isCoop && (
                            <>
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 justify-around">
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="font-bold text-lg text-cyan-300">{players.player1.name || 'Player 1'}</span>
                                        <PlayerUploader playerKey="player1" borderColor="border-cyan-400" />
                                    </div>
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="font-bold text-lg text-pink-400">{players.player2?.name || 'Player 2'}</span>
                                        <PlayerUploader playerKey="player2" borderColor="border-pink-400" />
                                    </div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-lg mt-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={coopConsent}
                                            onChange={(e) => setCoopConsent(e.target.checked)}
                                            className="mt-1 accent-pink-500 h-5 w-5"
                                        />
                                        <span className="text-indigo-200 text-sm">
                                            I confirm I have permission from both people to use their photos for in-game avatars.
                                        </span>
                                    </label>
                                </div>
                                <CoopTogetherUploader players={players} setCameraTarget={setCameraTarget} setIsCameraOpen={setIsCameraOpen} handleTriggerUpload={handleTriggerUpload} />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* --- SUBMIT BUTTON --- */}
             <div className="border-t border-white/10 pt-6 space-y-3">
                <button onClick={handleSubmit} disabled={!isComplete} className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-black font-bold py-3 px-4 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitButtonText}
                </button>
                 <button type="button" onClick={onGoBack} className="w-full text-center text-indigo-300 hover:text-white text-sm font-semibold">
                    &larr; Go Back & Change Mode
                </button>
            </div>
        </div>
    );
};

// --- Helper Functions and Sub-components ---

const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const CoopNameInputs: React.FC<{ players: Players, setPlayers: React.Dispatch<React.SetStateAction<Players>>, isQuickPlay: boolean }> = ({ players, setPlayers, isQuickPlay }) => {
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

    const RELATIONSHIP_GROUPS = {
        'Friends': ['Besties', 'Siblings'],
        'Relationship': ['Dating', 'Married', 'Crush', 'Exes'],
        'Family': ['Dad & Son', 'Dad & Daughter', 'Mom & Son', 'Mom & Daughter'],
        'Special': ['Sabotage'],
    };

    const RELATIONSHIP_PLACEHOLDERS: { [key: string]: [string, string] } = {
        'Besties': ['Bestie 1 Name', 'Bestie 2 Name'], 'Siblings': ['Older Sibling', 'Younger Sibling'], 
        'Dating': ['Partner 1', 'Partner 2'], 'Crush': ['Your Name', 'Your Crush\'s Name'], 'Exes': ['Ex 1', 'Ex 2'], 'Married': ['Spouse 1', 'Spouse 2'],
        'Dad & Son': ['Dad\'s Name', 'Son\'s Name'], 'Dad & Daughter': ['Dad\'s Name', 'Daughter\'s Name'],
        'Mom & Son': ['Mom\'s Name', 'Son\'s Name'], 'Mom & Daughter': ['Mom\'s Name', 'Daughter\'s Name'],
        'Sabotage': ["Your Name", "Friend's Name"],
    };
    const p1Placeholder = players.relationship ? (RELATIONSHIP_PLACEHOLDERS[players.relationship]?.[0] || 'Player 1') : 'Player 1 Name';
    const p2Placeholder = players.relationship ? (RELATIONSHIP_PLACEHOLDERS[players.relationship]?.[1] || 'Player 2') : 'Player 2 Name';

    return <>
        {!isQuickPlay && (
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
                        {Object.entries(RELATIONSHIP_GROUPS).map(([group, options]) => (
                            <div key={group}>
                                <div className="px-4 py-2 text-xs font-bold uppercase text-indigo-400 tracking-wider">{group}</div>
                                {options.map(opt => (
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
                        ))}
                    </div>
                )}
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder={p1Placeholder} value={players.player1.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
            <input type="text" placeholder={p2Placeholder} value={players.player2?.name || ''} onChange={(e) => setPlayers(p => ({...p, player2: {...p.player2!, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-pink-400 focus:outline-none" required />
        </div>
    </>
};

const SoloNameInput: React.FC<{ player: Player, setPlayers: React.Dispatch<React.SetStateAction<Players>> }> = ({ player, setPlayers }) => (
    <input type="text" placeholder="Your Name" value={player.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
);

const CoopTogetherUploader: React.FC<{ players: Players, setCameraTarget: any, setIsCameraOpen: any, handleTriggerUpload: (player: 'together', type: 'photo') => void }> = ({ players, setCameraTarget, setIsCameraOpen, handleTriggerUpload }) => (
    <>
        <div className="text-center">
            <h3 className="text-lg font-bold tracking-tight text-yellow-300">...and one of you together! (Optional)</h3>
        </div>
        <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 bg-gray-900/50 p-2 rounded-lg flex items-center justify-center overflow-hidden border-4 border-yellow-400 shadow-lg">
                    {players.togetherPhoto ? <img src={`data:${players.togetherPhoto.mimeType};base64,${players.togetherPhoto.base64}`} alt="together" className="w-full h-full object-cover rounded-sm" /> : <PlaceholderIcon />}
                </div>
                <div className="flex flex-col gap-2 w-48 mt-1">
                    <button type="button" onClick={() => handleTriggerUpload('together', 'photo')} className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-cyan-700 active:border-b-0 active:translate-y-1">
                        <PhotoIcon /> Upload Photo
                    </button>
                    <button type="button" onClick={() => { setCameraTarget('together'); setIsCameraOpen(true); }} className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-transform transform hover:scale-105 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">
                        <CameraIcon /> Use Camera
                    </button>
                </div>
            </div>
        </div>
    </>
);

export default PlayerSetup;