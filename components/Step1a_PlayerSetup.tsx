import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Players, Player } from '../types';
import { PLACEHOLDER_AVATAR_PHOTO } from '../constants';

// Helper component
const AvatarClosetModal: React.FC<{ savedAvatars: string[], onSelect: (base64: string) => void, onClose: () => void }> = ({ savedAvatars, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl p-6 w-full max-w-md border border-white/20" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-4">Avatar Closet</h2>
                {savedAvatars.length === 0 ? (
                    <p className="text-center text-indigo-200">Your closet is empty! Save some avatars after you generate them.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {savedAvatars.map((avatar, index) => (
                            <img
                                key={index}
                                src={`data:image/png;base64,${avatar}`}
                                alt={`Saved avatar ${index + 1}`}
                                onClick={() => onSelect(avatar)}
                                className="w-full aspect-square object-cover rounded-lg cursor-pointer transition transform hover:scale-105 border-2 border-transparent hover:border-pink-400"
                            />
                        ))}
                    </div>
                )}
                 <button onClick={onClose} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg">Close</button>
            </div>
        </div>
    );
};

// SVG placeholder for a cleaner UI
const PlaceholderIcon = () => (
    <div className="w-full h-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-indigo-400/50">
            <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
            <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.791.56 2.311 1.284a.75.75 0 01-.256 1.213l-1.28.64a.75.75 0 00-.41.675v.233c.33.05.654.123.972.218a.75.75 0 01.587.899l-.91 3.528a.75.75 0 01-1.427-.368l.68-2.628a.75.75 0 00-.594-.863 48.995 48.995 0 00-3.322-.44C11.123 11.25 10 12.25 10 13.5v.387a.75.75 0 01-1.18.618l-1.46-1.167a.75.75 0 01.34-1.332l1.24-.248a.75.75 0 00.574-.666v-.125a.75.75 0 01.75-.75h.336a49.155 49.155 0 012.399-.226.75.75 0 00.75-.75V9.75a.75.75 0 01-.75-.75h-.336a49.155 49.155 0 01-2.399.226.75.75 0 00-.75.75v.852a.75.75 0 01-1.5 0V9.75c0-1.25 1.123-2.25 2.5-2.25h.336c.45 0 .896.03 1.336.091L15 6.425a.75.75 0 01.256-1.213A3.98 3.98 0 0012.336 4.5c-2.12 0-3.956.936-4.99 2.401a.75.75 0 01-1.284-.792A5.48 5.48 0 019.344 3.07zM1.5 13.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H2.25a.75.75 0 01-.75-.75zM22.5 13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM6 16.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM18 16.5a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM12 21a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" />
        </svg>
    </div>
);


// Main component
const PlayerSetup: React.FC<{ onComplete: (players: Players) => void, initialPlayers: Players, onGoBack: () => void, savedAvatars: string[] }> = ({ onComplete, initialPlayers, onGoBack, savedAvatars }) => {
    const [players, setPlayers] = useState(initialPlayers);
    const [cameraTarget, setCameraTarget] = useState<'player1' | 'player2' | 'together' | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [closetTarget, setClosetTarget] = useState<'player1' | 'player2' | null>(null);

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
             setPlayers(prev => ({ ...prev, player1: { ...prev.player1, photo, avatarHistory: undefined, selectedAvatarIndex: undefined } }));
        } else if (target === 'player2') {
             setPlayers(prev => ({ ...prev, player2: { ...prev.player2!, photo, avatarHistory: undefined, selectedAvatarIndex: undefined } }));
        }
    };

    const handleSelectFromCloset = (base64: string, target: 'player1' | 'player2') => {
         if (target === 'player1') {
            setPlayers(prev => ({ ...prev, player1: { ...prev.player1, photo: undefined, avatarHistory: [base64], selectedAvatarIndex: 0 } }));
        } else if (target === 'player2') {
            setPlayers(prev => ({ ...prev, player2: { ...prev.player2!, photo: undefined, avatarHistory: [base64], selectedAvatarIndex: 0 } }));
        }
        setClosetTarget(null);
    };

    // Derived State & Checks
    const isCoop = mode === 'coop';
    const isSabotage = mode === 'sabotage';
    const isSolo = mode === 'solo';

    const isComplete = useMemo(() => {
        const p1NameReady = !!players.player1.name;
        const p2NameReady = !!players.player2?.name;
        if (isSolo) return p1NameReady;
        if (isSabotage) return !!(players.player1.name && p2NameReady);
        if (isCoop) return !!(p1NameReady && p2NameReady && players.relationship);
        return false;
    }, [players, isSolo, isSabotage, isCoop]);

    const handleSubmit = () => {
        // Create a deep copy to avoid direct state mutation before passing props
        const finalPlayers = JSON.parse(JSON.stringify(players));

        const p1NeedsAvatar = isSolo || isCoop;
        const p2NeedsAvatar = isSabotage || isCoop;

        // If a player needs an avatar but hasn't provided a photo or chosen from the closet, assign a placeholder.
        if (p1NeedsAvatar && !finalPlayers.player1.photo && !finalPlayers.player1.avatarHistory) {
            finalPlayers.player1.photo = PLACEHOLDER_AVATAR_PHOTO;
        }
        if (p2NeedsAvatar && finalPlayers.player2 && !finalPlayers.player2.photo && !finalPlayers.player2.avatarHistory) {
            finalPlayers.player2.photo = PLACEHOLDER_AVATAR_PHOTO;
        }
        
        onComplete(finalPlayers);
    };

    const submitButtonText = useMemo(() => {
        const hasPreselectedAvatar = 
            (isSolo && players.player1.avatarHistory) ||
            (isSabotage && players.player2?.avatarHistory) ||
            (isCoop && players.player1.avatarHistory && players.player2?.avatarHistory);

        if (hasPreselectedAvatar) return "Let's Go!";
        return "Generate Our Avatars";
    }, [isSolo, isSabotage, isCoop, players]);
    
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
        const displayImage = player?.avatarHistory?.[0] || (player?.photo ? `data:${player.photo.mimeType};base64,${player.photo.base64}` : null);
        
        return (
             <div className="flex flex-col items-center gap-3">
                <div className={`w-32 h-32 bg-gray-900/50 p-2 rounded-lg flex items-center justify-center overflow-hidden border-4 ${borderColor} shadow-lg`}>
                    {displayImage ? <img src={displayImage.startsWith('data:') ? displayImage : `data:image/png;base64,${displayImage}`} alt="avatar" className="w-full h-full object-cover rounded-sm" /> : <PlaceholderIcon />}
                </div>
                <div className="flex gap-2 mt-1">
                    <button type="button" onClick={() => fileRef.current?.click()} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1.5 px-3 rounded-md text-xs shadow-md transition-transform transform hover:scale-105 border-b-4 border-cyan-700 active:border-b-0 active:translate-y-1">Upload</button>
                    <button type="button" onClick={() => { setCameraTarget(playerKey); setIsCameraOpen(true); }} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1.5 px-3 rounded-md text-xs shadow-md transition-transform transform hover:scale-105 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1">Camera</button>
                    <button type="button" onClick={() => setClosetTarget(playerKey)} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-1.5 px-3 rounded-md text-xs shadow-md transition-transform transform hover:scale-105 border-b-4 border-pink-700 active:border-b-0 active:translate-y-1">Closet</button>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileRef} onChange={(e) => handleFileChange(e, playerKey)} className="hidden" />
            </div>
        );
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 animate-fade-in">
            {renderCameraModal()}
            {closetTarget && <AvatarClosetModal savedAvatars={savedAvatars} onSelect={(b64) => handleSelectFromCloset(b64, closetTarget)} onClose={() => setClosetTarget(null)} />}
            {/* --- HEADER --- */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                    {isCoop && "Who's Playing?"}
                    {isSabotage && "Who's Getting Sabotaged?"}
                    {isSolo && "Tell Us About Yourself!"}
                </h2>
                <p className="text-center text-indigo-200 mb-6 text-sm">
                    {isCoop && "A 2-player co-op adventure!"}
                    {isSabotage && "Enter your name and your friend's details."}
                    {isSolo && "This info helps the AI create your personalized future."}
                </p>
            </div>

            {/* --- NAME & PHOTO UPLOADERS --- */}
            <div className="space-y-4">
                 {isSolo && <div className="flex flex-col items-center gap-4">
                     <div className="w-full max-w-xs mx-auto">
                        <SoloNameInput player={players.player1} setPlayers={setPlayers} />
                     </div>
                     <div className="border-t border-white/10 w-full pt-4 text-center mt-2">
                         <h3 className="text-xl font-bold tracking-tight text-yellow-300">📸 Strike a Pose! 📸</h3>
                         <p className="text-indigo-200 text-sm">Upload, snap a photo, or choose from your Closet!</p>
                         <p className="text-xs text-indigo-300/80 mt-1">For best results, use a clear, forward-facing headshot. No sunglasses!</p>
                         {cameraError && <p className="text-red-400 text-center text-sm mt-2">{cameraError}</p>}
                    </div>
                    <PlayerUploader playerKey="player1" borderColor="border-cyan-400" fileRef={fileInputRef1} />
                </div>}

                {isSabotage && <>
                    <SabotageNameInputs players={players} setPlayers={setPlayers} />
                     <div className="text-center border-t border-white/10 pt-6">
                         <h3 className="text-xl font-bold tracking-tight text-yellow-300">😈 Got a Good Pic of Them? 😈</h3>
                        <p className="text-indigo-200 text-sm">Upload a clear, forward-facing photo for the most roastable results. No sunglasses!</p>
                        {cameraError && <p className="text-red-400 text-center text-sm mt-2">{cameraError}</p>}
                    </div>
                     <div className="flex justify-center">
                        <PlayerUploader playerKey="player2" borderColor="border-pink-400" fileRef={fileInputRef2} />
                    </div>
                </>}
                
                {isCoop && <>
                    <CoopNameInputs players={players} setPlayers={setPlayers} />
                     <div className="text-center border-t border-white/10 pt-6">
                        <h3 className="text-xl font-bold tracking-tight text-yellow-300">📸 Strike a Pose! 📸</h3>
                        <p className="text-indigo-200 text-sm">Upload, snap a photo, or choose from your Closet!</p>
                        <p className="text-xs text-indigo-300/80 mt-1">For best results, use clear, forward-facing headshots. No sunglasses!</p>
                         {cameraError && <p className="text-red-400 text-center text-sm mt-2">{cameraError}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 justify-around">
                        <div className="flex flex-col items-center gap-4">
                            <span className="font-bold text-lg text-cyan-300">{players.player1.name || 'Player 1'}</span>
                            <PlayerUploader playerKey="player1" borderColor="border-cyan-400" fileRef={fileInputRef1} />
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <span className="font-bold text-lg text-pink-400">{players.player2?.name || 'Player 2'}</span>
                            <PlayerUploader playerKey="player2" borderColor="border-pink-400" fileRef={fileInputRef2} />
                        </div>
                    </div>
                    <CoopTogetherUploader players={players} setCameraTarget={setCameraTarget} setIsCameraOpen={setIsCameraOpen} fileRef={fileInputRef3} onChange={handleFileChange} />
                </>}
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

    const RELATIONSHIP_GROUPS = {
        'Friends': ['Besties', 'Siblings'],
        'Relationship': ['Dating', 'Married', 'Crush', 'Exes'],
        'Family': ['Dad & Son', 'Dad & Daughter', 'Mom & Son', 'Mom & Daughter'],
    };

    const RELATIONSHIP_PLACEHOLDERS: { [key: string]: [string, string] } = {
        'Besties': ['Bestie 1 Name', 'Bestie 2 Name'], 'Siblings': ['Older Sibling', 'Younger Sibling'], 
        'Dating': ['Partner 1', 'Partner 2'], 'Crush': ['Your Name', 'Your Crush\'s Name'], 'Exes': ['Ex 1', 'Ex 2'], 'Married': ['Spouse 1', 'Spouse 2'],
        'Dad & Son': ['Dad\'s Name', 'Son\'s Name'], 'Dad & Daughter': ['Dad\'s Name', 'Daughter\'s Name'],
        'Mom & Son': ['Mom\'s Name', 'Son\'s Name'], 'Mom & Daughter': ['Mom\'s Name', 'Daughter\'s Name'],
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder={p1Placeholder} value={players.player1.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
            <input type="text" placeholder={p2Placeholder} value={players.player2?.name || ''} onChange={(e) => setPlayers(p => ({...p, player2: {...p.player2!, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-pink-400 focus:outline-none" required />
        </div>
    </>
};

const SabotageNameInputs: React.FC<{ players: Players, setPlayers: React.Dispatch<React.SetStateAction<Players>> }> = ({ players, setPlayers }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Your Name" value={players.player1.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
        <input type="text" placeholder="Your Friend's Name" value={players.player2?.name || ''} onChange={(e) => setPlayers(p => ({...p, player2: {...p.player2!, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-pink-400 focus:outline-none" required />
    </div>
);

const SoloNameInput: React.FC<{ player: Player, setPlayers: React.Dispatch<React.SetStateAction<Players>> }> = ({ player, setPlayers }) => (
    <input type="text" placeholder="Your Name" value={player.name} onChange={(e) => setPlayers(p => ({...p, player1: {...p.player1, name: capitalizeFirstLetter(e.target.value)}}))} className="w-full bg-white/10 rounded-md p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none" required />
);

const CoopTogetherUploader: React.FC<{ players: Players, setCameraTarget: any, setIsCameraOpen: any, fileRef: any, onChange: any }> = ({ players, setCameraTarget, setIsCameraOpen, fileRef, onChange }) => (
    <>
        <div className="text-center">
            <h3 className="text-lg font-bold tracking-tight text-yellow-300">...and one of you together! (Optional)</h3>
        </div>
        <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 bg-gray-900/50 p-2 rounded-lg flex items-center justify-center overflow-hidden border-4 border-yellow-400 shadow-lg">
                    {players.togetherPhoto ? <img src={`data:${players.togetherPhoto.mimeType};base64,${players.togetherPhoto.base64}`} alt="together" className="w-full h-full object-cover rounded-sm" /> : <PlaceholderIcon />}
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

export default PlayerSetup;