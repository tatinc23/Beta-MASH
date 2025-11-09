import React from 'react';

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

export default ModeSelection;