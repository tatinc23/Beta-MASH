import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Players, CategoryConfig, LibraryCategory } from '../types';
import { ALL_CATEGORIES, CATEGORY_INFO } from '../constants';
import { COOP_CATEGORIES } from '../coop_categories';
import LibraryModal from './LibraryModal';

const CategoriesSetup: React.FC<{ onCategoriesSubmit: (categories: { [key: string]: string[] }) => void, players: Players, managedCategories: CategoryConfig[], setManagedCategories: React.Dispatch<React.SetStateAction<CategoryConfig[]>> }> = ({ onCategoriesSubmit, players, managedCategories, setManagedCategories }) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    const [isLibraryOpen, setIsLibraryOpen] = useState<string | null>(null);

    useEffect(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const selectedCategories = useMemo(() => managedCategories.filter(c => c.isSelected), [managedCategories]);

    const initialCategoryState = useMemo(() => {
        const state: { [key: string]: string[] } = {};
        selectedCategories.forEach(cat => {
            state[cat.key] = Array(4).fill('');
        });
        return state;
    }, [selectedCategories]);

    const [categories, setCategories] = useState(initialCategoryState);
    
    useEffect(() => {
        setCategories(initialCategoryState);
    }, [initialCategoryState]);


    const flattenLibraryOptions = (lib: LibraryCategory | string[]): string[] => {
        if (Array.isArray(lib)) return lib;
        const options: string[] = [];
        const recurse = (obj: LibraryCategory | string[]) => {
          if (Array.isArray(obj)) options.push(...obj);
          else if (typeof obj === 'object' && obj !== null) Object.values(obj).forEach(value => recurse(value));
        };
        recurse(lib);
        return Array.from(new Set(options));
    };

    const getLibraryForCategory = (categoryKey: string): LibraryCategory | string[] | null => {
        if (players.mode === 'coop' && players.relationship) {
            const relationshipCategories = COOP_CATEGORIES[players.relationship as keyof typeof COOP_CATEGORIES];
            return relationshipCategories?.[categoryKey as keyof typeof relationshipCategories] || null;
        }

        // --- SOLO MODE LOGIC ---
        const categoryData = ALL_CATEGORIES[categoryKey];
        if (!categoryData) {
            return null;
        }

        // If it's a simple array like "Housing", return it.
        if (Array.isArray(categoryData)) {
            return categoryData;
        }
        
        // If it's an object with singlePlayer/coop structure (like Spouse), return the singlePlayer part for solo mode.
        if (typeof categoryData === 'object' && 'singlePlayer' in categoryData) {
            return (categoryData as { singlePlayer: LibraryCategory }).singlePlayer;
        }
        
        // Fallback for any other structure in solo mode that might be a valid library
        if (typeof categoryData === 'object') {
            return categoryData;
        }

        return null; // Should not be reached for standard categories
    };
    
    const getRandomOptions = (categoryKey: string, count: number): string[] => {
        const lib = getLibraryForCategory(categoryKey);
        if (!lib) return [];
        const allOptions = flattenLibraryOptions(lib);
        if (!allOptions.length) return [];
        const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
        return Array.from(new Set(shuffled)).slice(0, count);
    };

    const handleSurpriseMe = () => {
        const surprisedCategories: { [key: string]: string[] } = {};
        selectedCategories.forEach(cat => {
            if (!cat.isCustom) {
                const randomSelections = getRandomOptions(cat.key, 4);
                if (randomSelections.length > 0) {
                    surprisedCategories[cat.key] = randomSelections;
                } else {
                    surprisedCategories[cat.key] = categories[cat.key] || [];
                }
            } else {
                 surprisedCategories[cat.key] = categories[cat.key] || [];
            }
        });
        setCategories(surprisedCategories);
    };

    const isFormComplete = useMemo(() => {
        if (Object.keys(categories).length !== selectedCategories.length) return false;
        const expectedLength = 4;
        return Object.values(categories).every((options: string[]) => options.length === expectedLength && options.every(opt => opt && opt.trim() !== ''));
    }, [categories, selectedCategories]);
    
     const handleToggleCategory = (keyToToggle: string) => {
        const isCurrentlySelected = managedCategories.find(c => c.key === keyToToggle)?.isSelected;
        const selectedCount = managedCategories.filter(c => c.isSelected).length;

        if (!isCurrentlySelected && selectedCount >= 8) {
            alert("You can only select up to 8 categories for the game.");
            return;
        }

        setManagedCategories(prev =>
            prev.map(cat =>
                cat.key === keyToToggle ? { ...cat, isSelected: !cat.isSelected } : cat
            )
        );
    };

    const handleAddCustomCategory = () => {
        if (customCategoryInput.trim() === '') return;
        const selectedCount = managedCategories.filter(c => c.isSelected).length;
        
        const newCategory: CategoryConfig = {
            key: customCategoryInput.trim(),
            name: customCategoryInput.trim(),
            icon: '✨',
            isCustom: true,
            isSelected: selectedCount < 8,
        };

        setManagedCategories(prev => [...prev, newCategory]);
        setCustomCategoryInput('');
    };
    
    return (
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); if (isFormComplete) onCategoriesSubmit(categories); }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 space-y-6 animate-fade-in">
             {isLibraryOpen && getLibraryForCategory(isLibraryOpen) && (
                <LibraryModal 
                    category={CATEGORY_INFO[isLibraryOpen]?.name || isLibraryOpen}
                    categoryKey={isLibraryOpen}
                    library={getLibraryForCategory(isLibraryOpen)!}
                    onSelect={(key, selections) => {
                        setCategories(prev => ({ ...prev, [key]: selections }));
                        setIsLibraryOpen(null);
                    }}
                    onClose={() => setIsLibraryOpen(null)}
                />
            )}
             <div>
                <h2 className="text-3xl font-bold mb-2 text-center">
                    Design Your Destiny! ✨
                </h2>
                <p className="text-indigo-200 mb-4 text-center text-sm max-w-md mx-auto">
                   Fill in 4 options for each category. Use the 📚 icon to pick from our library, or manage your 8 categories and add custom ones below!
                </p>

                <details className="bg-black/20 rounded-lg p-3 mb-4">
                    <summary className="font-semibold text-indigo-200 cursor-pointer">Manage Categories ({selectedCategories.length}/8)</summary>
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {managedCategories.map(cat => (
                                <label key={cat.key} className="flex items-center gap-2 bg-white/5 p-2 rounded-md">
                                    <input type="checkbox" checked={cat.isSelected} onChange={() => handleToggleCategory(cat.key)} className="accent-pink-500" />
                                    <span>{CATEGORY_INFO[cat.key]?.icon || cat.icon} {CATEGORY_INFO[cat.key]?.name || cat.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={customCategoryInput}
                                onChange={e => setCustomCategoryInput(e.target.value)}
                                placeholder="Add custom category..."
                                className="flex-grow bg-white/10 rounded-md p-2 text-white text-sm placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                            />
                            <button type="button" onClick={handleAddCustomCategory} className="bg-cyan-500 text-white font-bold px-4 rounded-md text-sm">Add</button>
                        </div>
                    </div>
                </details>


                <button type="button" onClick={handleSurpriseMe} className="w-full mb-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 text-base border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1">✨ Surprise Me!</button>
                <div className="space-y-4">
                     {selectedCategories.map((cat) => {
                        const { key, isCustom } = cat;
                        const catInfo = CATEGORY_INFO[key] || { icon: cat.icon, name: cat.name };

                        return (
                             <div key={key}>
                                <div className="flex justify-between items-center mb-2">
                                   <h3 className="text-base font-semibold">{catInfo.icon} {catInfo.name}</h3>
                                   {!isCustom && getLibraryForCategory(key) && (
                                     <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setIsLibraryOpen(key)} className="bg-purple-500/80 hover:bg-purple-500 text-white font-bold p-2 rounded-lg text-xs border-b-2 border-purple-700 active:border-b-0 active:translate-y-px transition-transform transform" title="Open Library">📚</button>
                                        <button type="button" onClick={() => {
                                             const randoms = getRandomOptions(key, 4);
                                             if (randoms.length > 0) setCategories(prev => ({...prev, [key]: randoms}));
                                        }} className="bg-purple-500/80 hover:bg-purple-500 text-white font-bold p-2 rounded-lg text-xs border-b-2 border-purple-700 active:border-b-0 active:translate-y-px transition-transform transform" title="Randomize">🎲</button>
                                     </div>
                                   )}
                                </div>
                                {key === 'Spouse' && (
                                    <p className="text-xs text-indigo-300/80 mb-2 italic text-center bg-black/20 p-2 rounded-md">
                                        Note: Any celebrity names are used for parody and entertainment purposes only. The results are not real and are not endorsed by any public figures.
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    {categories[key]?.map((option, index) => <input key={index} type="text" value={option} onChange={(e) => setCategories(prev => ({ ...prev, [key]: prev[key].map((item, i) => (i === index ? e.target.value : item)) }))} className="w-full bg-white/10 rounded-md p-2 text-white text-sm placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none" placeholder={`Option ${index+1}`} required />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button type="submit" disabled={!isFormComplete} className="w-full bg-gradient-to-r from-pink-500 to-cyan-400 text-black font-bold py-3 px-4 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {players.mode === 'coop' ? "Who's Going to Draw the Spiral?" : "Draw the Spiral!"}
            </button>
        </form>
    );
};

export default CategoriesSetup;