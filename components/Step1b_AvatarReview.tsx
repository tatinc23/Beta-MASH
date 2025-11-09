import React, { useState, useEffect } from 'react';
import { Players, Player } from '../types';
import { PLACEHOLDER_AVATAR } from '../constants';

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
        <>
            {!!navigator.clipboard?.write && 
                <button onClick={onCopyImage} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-28 text-center transition-colors">
                   {copyStatus || '🖼️ Copy Image'}
                </button>
            }
            <button onClick={() => handleSaveImage(base64Image)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-28 text-center">
                💾 Save Image
            </button>
        </>
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
    editingPlayerKey: 'player1' | 'player2' | null;
    isSaved: boolean;
    onSave: () => void;
}> = ({ player, playerKey, borderColor, handleSelectAvatar, handleEditAvatar, editPrompts, setEditPrompts, editingPlayerKey, isSaved, onSave }) => {
    if (!player?.avatarHistory || player.selectedAvatarIndex === undefined) return null;

    const [copyStatus, setCopyStatus] = useState('');
    const selectedAvatar = player.avatarHistory[player.selectedAvatarIndex];
    const canEdit = player.avatarHistory.length < 3;
    const isCurrentlyEditing = editingPlayerKey === playerKey;
    const isAnyEditing = editingPlayerKey !== null;

    const handleCopyImage = async (base64: string) => {
        if (!navigator.clipboard?.write) {
            alert('Copying images is not supported on your browser.');
            return;
        }
        try {
            const response = await fetch(`data:image/png;base64,${base64}`);
            const blob = await response.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus(''), 2000);
        } catch (error) {
            console.error('Failed to copy image:', error);
            alert('Failed to copy image!');
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <h3 className={`font-bold text-xl ${borderColor.replace('border-', 'text-')}`}>{player.name}</h3>
            <img src={`data:image/png;base64,${selectedAvatar}`} alt={`${player.name}'s avatar`} className={`w-40 h-40 object-cover rounded-lg border-4 ${borderColor} shadow-lg`} />
            
            <div className="flex items-center justify-center gap-2">
                <ShareButtons 
                    base64Image={selectedAvatar} 
                    fileName={`${player.name}-mash-avatar.png`} 
                    onCopyImage={() => handleCopyImage(selectedAvatar)}
                    copyStatus={copyStatus}
                />
                <button
                    onClick={onSave}
                    disabled={isSaved}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-1 px-3 rounded-md text-xs w-28 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaved ? '✅ In Closet' : '💾 Put in Closet'}
                </button>
            </div>
           
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
                        onChange={(e) => setEditPrompts(p => ({ ...p, [playerKey === 'player1' ? 'p1' : 'p2']: e.target.value }))}
                        className="w-full bg-white/10 rounded-md p-2 text-white text-sm placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                        disabled={isAnyEditing}
                    />
                    <button
                        onClick={() => handleEditAvatar(playerKey)}
                        disabled={isAnyEditing || (playerKey === 'player1' ? !editPrompts.p1 : !editPrompts.p2)}
                        className={`w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-1.5 px-3 rounded-md text-sm disabled:opacity-50 ${isCurrentlyEditing ? 'animate-flicker-pulse' : ''}`}
                    >
                        {isCurrentlyEditing ? 'Editing...' : `Edit Avatar (${player.avatarHistory.length}/3)`}
                    </button>
                </div>
            )}
        </div>
    )
};

const AvatarReview: React.FC<{ 
    players: Players, 
    setPlayers: React.Dispatch<React.SetStateAction<Players>>, 
    onContinue: () => void, 
    savedAvatars: string[], 
    setSavedAvatars: React.Dispatch<React.SetStateAction<string[]>>, 
    onEditAvatar: (playerKey: 'player1' | 'player2', prompt: string) => void, 
    editingPlayerKey: 'player1' | 'player2' | null 
}> = ({ players, setPlayers, onContinue, savedAvatars, setSavedAvatars, onEditAvatar, editingPlayerKey }) => {
    const [editPrompts, setEditPrompts] = useState<{ p1: string; p2: string }>({ p1: '', p2: '' });

    const saveAvatarToCloset = (avatar: string) => {
        if (savedAvatars.length >= 3) {
            alert("Closet is full! You can only save up to 3 avatars.");
            return;
        }
        if (!savedAvatars.includes(avatar)) {
            setSavedAvatars(prev => [...prev, avatar]);
        }
    };

    const handleEditTrigger = (playerKey: 'player1' | 'player2') => {
        const prompt = playerKey === 'player1' ? editPrompts.p1 : editPrompts.p2;
        if (!prompt) return;
        onEditAvatar(playerKey, prompt);
        setEditPrompts(prev => ({ ...prev, [playerKey === 'player1' ? 'p1' : 'p2']: '' }));
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
    
    const onSaveForFirstDisplay = () => {
        const playerToSaveFrom = players.mode === 'sabotage' ? players.player2 : players.player1;
        const selectedAvatar = playerToSaveFrom?.avatarHistory?.[playerToSaveFrom.selectedAvatarIndex ?? -1];
        if (selectedAvatar) {
            saveAvatarToCloset(selectedAvatar);
        }
    };

    const onSaveForSecondDisplay = () => {
        const playerToSaveFrom = players.player2;
        const selectedAvatar = playerToSaveFrom?.avatarHistory?.[playerToSaveFrom.selectedAvatarIndex ?? -1];
        if (selectedAvatar) {
            saveAvatarToCloset(selectedAvatar);
        }
    };


    const title = players.mode === 'solo' ? "Check Out Your Avatar!" : players.mode === 'sabotage' ? "Check Out Their Avatar!" : "Check Out Your Avatars!";
    const subtitle = players.mode === 'solo' ? "The AI worked its magic. Here is your cartoon alter-ego!" : players.mode === 'sabotage' ? "The AI worked its magic. Here is their cartoon alter-ego!" : "The AI worked its magic. Here are your cartoon alter-egos!";
    
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 text-center animate-fade-in">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-indigo-200">{subtitle}</p>
            
            <div className="bg-black/20 p-3 rounded-lg text-sm text-indigo-200/80 my-4 max-w-lg mx-auto text-left space-y-1">
                <p className="font-bold text-center">🎨 Avatar Editing Tips 🎨</p>
                <ul className="list-disc list-inside text-xs">
                    <li>You get <strong>2 edits</strong> per avatar. Each new edit builds on the previous one.</li>
                    <li>Save up to <strong>3 avatars</strong> to your closet to reuse them later!</li>
                    <li>Be specific! "add a purple mohawk", "give them a pirate eye-patch".</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-start gap-8">
                 <AvatarDisplay
                    player={players.mode === 'sabotage' ? players.player2 : players.player1}
                    playerKey={players.mode === 'sabotage' ? 'player2' : 'player1'}
                    borderColor={players.mode === 'sabotage' ? "border-pink-400" : "border-cyan-400"}
                    handleSelectAvatar={handleSelectAvatar}
                    handleEditAvatar={handleEditTrigger}
                    editPrompts={editPrompts}
                    setEditPrompts={setEditPrompts}
                    editingPlayerKey={editingPlayerKey}
                    isSaved={savedAvatars.includes((players.mode === 'sabotage' ? players.player2 : players.player1)?.avatarHistory?.[(players.mode === 'sabotage' ? players.player2 : players.player1)?.selectedAvatarIndex ?? 0] ?? '')}
                    onSave={onSaveForFirstDisplay}
                />
                {players.mode === 'coop' && <AvatarDisplay
                    player={players.player2}
                    playerKey="player2"
                    borderColor="border-pink-400"
                    handleSelectAvatar={handleSelectAvatar}
                    handleEditAvatar={handleEditTrigger}
                    editPrompts={editPrompts}
                    setEditPrompts={setEditPrompts}
                    editingPlayerKey={editingPlayerKey}
                    isSaved={savedAvatars.includes(players.player2?.avatarHistory?.[players.player2.selectedAvatarIndex ?? 0] ?? '')}
                    onSave={onSaveForSecondDisplay}
                />}
            </div>
            <button onClick={onContinue} className="w-full max-w-sm mx-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105">Looks Awesome, Let's Go!</button>
        </div>
    );
};

export default AvatarReview;