import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MashResults } from '../types';
import { CATEGORY_INFO } from '../constants';

interface Step4EliminationProps {
  categories: { [key: string]: string[] };
  magicNumber: number;
  onEliminationComplete: (results: MashResults) => void;
}

const Step4Elimination: React.FC<Step4EliminationProps> = ({ categories, magicNumber, onEliminationComplete }) => {
    const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(() => new Set());
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [animationStep, setAnimationStep] = useState(0);

    const calculationState = useRef({
        allOptions: Object.entries(categories).flatMap(([key, options]) =>
            (options as string[]).map((option, index) => ({ id: `${key}-${index}`, categoryKey: key, option }))
        ),
        currentIndex: -1,
        count: 0,
        eliminationsDone: 0,
        totalEliminationsNeeded: Object.entries(categories).reduce((sum, [, options]) => sum + (options as string[]).length, 0) - Object.keys(categories).length,
    });

    const animationTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (isComplete) {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            return;
        }

        const state = calculationState.current;
        if (state.eliminationsDone >= state.totalEliminationsNeeded) {
            setIsComplete(true);
            setHighlightedId(null);
            return;
        }

        // Find the next available item to highlight
        let nextItemFound = false;
        let nextIndex = state.currentIndex;
        while (!nextItemFound) {
            nextIndex = (nextIndex + 1) % state.allOptions.length;
            if (!eliminatedIds.has(state.allOptions[nextIndex].id)) {
                nextItemFound = true;
            }
        }
        state.currentIndex = nextIndex;
        const currentItem = state.allOptions[state.currentIndex];

        setHighlightedId(currentItem.id);
        
        // Only increment the count if the current item is not the last one in its category
        const remainingInCategory = state.allOptions.filter(opt =>
            opt.categoryKey === currentItem.categoryKey && !eliminatedIds.has(opt.id)
        ).length;
        
        let isLastInCategory = false;
        if (remainingInCategory > 1) {
            state.count++;
        } else {
            isLastInCategory = true;
        }
        
        const isEliminationTurn = state.count === magicNumber;
        const delay = isEliminationTurn ? 500 : (isLastInCategory ? 50 : 100);

        animationTimeoutRef.current = window.setTimeout(() => {
            if (isEliminationTurn) {
                state.count = 0;
                // The currentItem is guaranteed to be eliminatable because we only incremented the count for items
                // in categories with more than one option remaining.
                setEliminatedIds(prev => new Set(prev).add(currentItem.id));
                state.eliminationsDone++;
            }
            setAnimationStep(prev => prev + 1);
        }, delay);

        return () => {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, [animationStep, isComplete, magicNumber, eliminatedIds]);
    
    const finalResults = useMemo(() => {
        if (!isComplete) return {};
        const results: MashResults = {};
        const state = calculationState.current;
        for (const key of Object.keys(categories)) {
            const remainingOption = state.allOptions.find(opt => opt.categoryKey === key && !eliminatedIds.has(opt.id));
            if (remainingOption) {
                results[key] = remainingOption.option;
            }
        }
        return results;
    }, [isComplete, categories, eliminatedIds]);


    const handleSkip = () => {
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        
        const allOptions = calculationState.current.allOptions;
        const totalEliminationsNeeded = calculationState.current.totalEliminationsNeeded;

        const finalEliminated = new Set<string>();
        let currentIndex = -1;
        
        while(finalEliminated.size < totalEliminationsNeeded) {
            let count = 0;
            // Find the magicNumber-th valid item to eliminate.
            while (count < magicNumber) {
                // Find the next available (not eliminated) item.
                currentIndex = (currentIndex + 1) % allOptions.length;
                if (finalEliminated.has(allOptions[currentIndex].id)) {
                    continue; 
                }
                
                // Check if this item is a valid candidate for counting.
                const candidate = allOptions[currentIndex];
                const remainingInCategory = allOptions.filter(opt =>
                    opt.categoryKey === candidate.categoryKey && !finalEliminated.has(opt.id)
                ).length;
                    
                if (remainingInCategory > 1) {
                    count++; // Only increment count if it's not the last in its category.
                }
            }
            // The item at `currentIndex` is the one to be eliminated.
            finalEliminated.add(allOptions[currentIndex].id);
        }
        
        setEliminatedIds(finalEliminated);
        setIsComplete(true);
        setHighlightedId(null);
    };

    const handleSeeFuture = () => {
        onEliminationComplete(finalResults);
    };

    return (
        <div className="w-full max-w-4xl mx-auto text-center flex flex-col h-full">
            <div className="mb-4">
                <h2 className="text-3xl font-bold">The Elimination! ⚡️</h2>
                <p className="text-indigo-200">Your magic number is: <span className="font-bold text-2xl text-yellow-300">{magicNumber}</span></p>
            </div>

            {!isComplete && (
                <button
                    onClick={handleSkip}
                    className="mb-4 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    Ain't Nobody Got Time For That!
                </button>
            )}

            <div className="grid grid-cols-2 gap-2 flex-grow">
                {Object.entries(categories).map(([key, options]) => (
                    <div key={key} className="bg-black/20 p-2 rounded-lg flex flex-col">
                        <h3 className="text-sm font-bold text-indigo-200 mb-2">{CATEGORY_INFO[key]?.icon} {CATEGORY_INFO[key]?.name}</h3>
                        <div className="grid grid-cols-2 gap-1.5 flex-grow">
                            {(options as string[]).map((option, index) => {
                                const id = `${key}-${index}`;
                                const isEliminated = eliminatedIds.has(id);
                                const isWinner = isComplete && finalResults[key] === option;
                                const isHighlighted = highlightedId === id;
                                
                                return (
                                    <div
                                        key={id}
                                        className={`p-1.5 rounded-md text-center text-xs break-words flex items-center justify-center transition-all duration-100
                                            ${isEliminated ? 'bg-red-700/80 text-white/70' : 'bg-white/5'} 
                                            ${isWinner ? 'bg-green-500/90 text-white font-extrabold winner-animation border-2 border-yellow-300 shadow-lg shadow-green-500/50 scale-105' : ''}
                                            ${isHighlighted ? 'bg-yellow-400 text-black scale-110 shadow-xl' : ''}`
                                        }
                                    >
                                        {option}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {isComplete && (
                <div className="mt-6">
                    <button
                        onClick={handleSeeFuture}
                        className="w-full max-w-sm mx-auto bg-gradient-to-r from-green-400 to-cyan-500 text-black font-bold py-3 px-4 rounded-lg text-xl shadow-lg transform transition-all duration-300 hover:scale-105"
                    >
                        See My Future!
                    </button>
                </div>
            )}
        </div>
    );
};

export default Step4Elimination;