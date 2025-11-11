import React from 'react';
import { Players, Player } from '../types';

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
                    <span className="bg-cyan-500/80 text-white font-bold py-1 px-4 rounded-lg text-sm shadow-md transition-transform transform group-hover:scale-105 border-b-4 border-cyan-700">I Won!</span>
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
                    <span className="bg-pink-500/80 text-white font-bold py-1 px-4 rounded-lg text-sm shadow-md transition-transform transform group-hover:scale-105 border-b-4 border-pink-700">I Won!</span>
                </div>
            </div>
        </div>
    );
};

export default RockPaperScissors;