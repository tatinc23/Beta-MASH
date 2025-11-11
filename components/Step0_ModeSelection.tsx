import React, { useState } from 'react';

const ModeSelection: React.FC<{ onSelect: (mode: 'solo' | 'coop', gameStyle: 'avatar' | 'quick') => void }> = ({ onSelect }) => {
    const [selectionStep, setSelectionStep] = useState<'initial' | 'avatar' | 'quick'>('initial');

    const renderInitialSelection = () => (
        <>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">How Do You Wanna Play?</h2>
            <div className="flex flex-col gap-4 pt-2">
                <button
                    onClick={() => setSelectionStep('avatar')}
                    className="group bg-gradient-to-br from-white/5 to-white/0 rounded-lg p-4 text-left transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-pink-400 hover:shadow-2xl hover:shadow-pink-500/20"
                >
                    <div className="flex flex-row items-center gap-4">
                        <div className="text-4xl transition-transform duration-300 group-hover:scale-110">🤖</div>
                        <div>
                            <h3 className="text-lg font-bold">Avatar Adventure</h3>
                            <p className="text-indigo-300 text-sm mt-1">Generate AI avatars and a custom story!</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setSelectionStep('quick')}
                    className="group bg-gradient-to-br from-white/5 to-white/0 rounded-lg p-4 text-left transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20"
                >
                    <div className="flex flex-row items-center gap-4">
                        <div className="text-4xl transition-transform duration-300 group-hover:scale-110">⚡️</div>
                        <div>
                            <h3 className="text-lg font-bold">Quick Play</h3>
                            <p className="text-indigo-300 text-sm mt-1">The classic M.A.S.H. game. No avatars, just fun.</p>
                        </div>
                    </div>
                </button>
            </div>
        </>
    );

    const renderSubSelection = (gameStyle: 'avatar' | 'quick') => {
        const title = gameStyle === 'avatar' ? 'Avatar Adventure' : 'Quick Play';
        const modes = [
            { id: 'solo', title: '1 Player', desc: 'A future all your own.', emoji: '👤' },
            { id: 'coop', title: '2 Players', desc: 'Build a destiny together.', emoji: '👥' },
        ];
        return (
             <>
                <h2 className="text-3xl font-bold">{title}</h2>
                <div className="flex flex-col gap-4 pt-2">
                    {modes.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => onSelect(mode.id as 'solo' | 'coop', gameStyle)}
                            className="group bg-gradient-to-br from-white/5 to-white/0 rounded-lg p-4 text-left transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/20"
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
                 <button onClick={() => setSelectionStep('initial')} className="text-indigo-300 hover:text-white text-sm font-semibold mt-2">
                    &larr; Go Back
                </button>
            </>
        )
    };


    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-4 text-center animate-fade-in w-full">
            {selectionStep === 'initial' && renderInitialSelection()}
            {selectionStep === 'avatar' && renderSubSelection('avatar')}
            {selectionStep === 'quick' && renderSubSelection('quick')}
        </div>
    );
};

export default ModeSelection;