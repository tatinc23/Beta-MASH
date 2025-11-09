import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MashResults } from '../types';
import { CATEGORY_INFO } from '../constants';

interface Step4EliminationProps {
  categories: { [key: string]: string[] };
  magicNumber: number;
  onEliminationComplete: (results: MashResults) => void;
}

// A more robust, pure function to calculate the entire elimination sequence.
// It generates a step-by-step sequence for animation, including counts.
const calculateEliminationSequence = (categories: { [key: string]: string[] }, magicNumber: number) => {
    const sequence: { id: string, categoryKey: string, option: string, type: 'count' | 'eliminate' }[] = [];
    const finalResults: MashResults = {};
    const eliminatedIds: Set<string> = new Set();

    // Create a flat list of all options with their original IDs.
    const allOptions: { id: string, categoryKey: string, option: string }[] = Object.entries(categories).flatMap(([key, options]) =>
        (options as string[]).map((option, index) => ({
            id: `${key}-${index}`,
            categoryKey: key,
            option: option
        }))
    );
    
    const mutableCategoryCounts: { [key: string]: number } = {};
    Object.entries(categories).forEach(([key, options]) => {
        mutableCategoryCounts[key] = (options as string[]).length;
    });

    let currentIndex = -1;
    const totalEliminationsNeeded = allOptions.length - Object.keys(categories).length;
    let eliminationsDone = 0;

    while (eliminationsDone < totalEliminationsNeeded) {
        let count = 0;
        
        // Find the next available option to count towards.
        while (count < magicNumber) {
            currentIndex = (currentIndex + 1) % allOptions.length;
            if (!eliminatedIds.has(allOptions[currentIndex].id)) {
                const currentItem = allOptions[currentIndex];
                sequence.push({ ...currentItem, type: 'count' });
                count++;
            }
        }
        
        const itemToEliminate = allOptions[currentIndex];
        
        // A category is only solved when it has 1 item left. If we land on an item from a category that already has only 1 option, we skip it and continue.
        if (mutableCategoryCounts[itemToEliminate.categoryKey] > 1) {
            eliminatedIds.add(itemToEliminate.id);
            eliminationsDone++;
            mutableCategoryCounts[itemToEliminate.categoryKey]--;

            // Change the last 'count' step in the sequence to an 'eliminate' step for the animation.
            const lastCountIndex = sequence.length - 1;
            if (lastCountIndex >= 0) {
                sequence[lastCountIndex].type = 'eliminate';
            }
        }
        // If the category is already solved, we do nothing and the loop continues, starting the count from the current position.
    }

    // Determine the final results from what's left.
    for (const key of Object.keys(categories)) {
        const remainingOption = allOptions.find(opt => opt.categoryKey === key && !eliminatedIds.has(opt.id));
        if (remainingOption) {
            finalResults[key] = remainingOption.option;
        }
    }
    
    return { sequence, finalResults };
};


const Step4Elimination: React.FC<Step4EliminationProps> = ({ categories, magicNumber, onEliminationComplete }) => {
    const { sequence, finalResults } = useMemo(() => calculateEliminationSequence(categories, magicNumber), [categories, magicNumber]);

    const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(() => new Set());
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [animationIndex, setAnimationIndex] = useState(0);
    // FIX: Explicitly initialize useRef with null to avoid ambiguity with the no-argument overload, which may confuse some build tools.
    const animationTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Stop if animation is complete or if there's no sequence.
        if (isComplete || !sequence || animationIndex >= sequence.length) {
            if (sequence && sequence.length > 0) {
                 setIsComplete(true);
                 setHighlightedId(null);
            }
            return;
        }

        const currentStep = sequence[animationIndex];
        setHighlightedId(currentStep.id);

        const isElimination = currentStep.type === 'eliminate';
        // Speed up animation: 100ms for counting, 500ms for elimination.
        const delay = isElimination ? 500 : 100;

        animationTimeoutRef.current = window.setTimeout(() => {
            if (isElimination) {
                setEliminatedIds(prev => new Set(prev).add(currentStep.id));
            }
            // Move to the next step of the animation.
            setAnimationIndex(prev => prev + 1);
        }, delay);

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [animationIndex, sequence, isComplete]);
    
    const handleSkip = () => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }
        // Mark all items that would be eliminated as eliminated.
        const allEliminated = new Set(sequence.filter(s => s.type === 'eliminate').map(s => s.id));
        setEliminatedIds(allEliminated);
        setHighlightedId(null);
        setIsComplete(true);
        setAnimationIndex(sequence.length); // Prevent animation from continuing
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

            <button
                onClick={handleSkip}
                className="mb-4 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
                Ain't Nobody Got Time For That!
            </button>

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
                                        className={`p-1.5 rounded-md text-center text-xs break-words flex items-center justify-center
                                            ${isEliminated ? 'bg-red-700/80 text-gray-400' : 'bg-white/5'} 
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