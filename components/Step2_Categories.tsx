import React, { useState, useEffect } from 'react';
import { Players } from '../App';
import { ALL_CATEGORIES, CATEGORY_INFO } from '../constants';
import LibraryModal from './LibraryModal';

interface Step2CategoriesProps {
  onCategoriesSubmit: (categories: { [key: string]: string[] }, players: Players) => void;
  initialCategories: { [key: string]: string[] };
}

const RELATIONSHIP_ROLES: { [key: string]: [string, string] } = {
    'Besties': ['Bestie 1 Name', 'Bestie 2 Name'],
    'Siblings': ['Older Sibling', 'Younger Sibling'],
    'Dating': ['Partner 1 Name', 'Partner 2 Name'],
    'Rivals': ['Rival 1 Name', 'Rival 2 Name'],
    'Parent/Kid': ["Parent's Name", "Kid's Name"],
};


const Step2Categories: React.FC<Step2CategoriesProps> = ({ onCategoriesSubmit, initialCategories }) => {
  const [players, setPlayers] = useState<Players>({ mode: 'self', player1: { name: '' }, friendModeStyle: 'nice', relationship: 'Besties' });
  const [categories, setCategories] = useState(initialCategories);
  const [isLibraryOpen, setIsLibraryOpen] = useState<string | null>(null);

  useEffect(() => {
    // When mode changes, we might need to adjust libraries (e.g., from singlePlayer to coop)
    // For now, let's just reset categories if mode changes to avoid mismatches.
    setCategories(initialCategories);
  }, [players.mode, initialCategories]);

  const handlePlayerInfoChange = (field: keyof Players, value: any) => {
    setPlayers(prev => ({ ...prev, [field]: value }));
  };

  const handleModeChange = (mode: 'self' | 'friend' | 'coop') => {
    if (mode === 'coop') {
      setPlayers({ mode: 'coop', player1: { name: '' }, player2: { name: '' }, relationship: 'Besties' });
    } else {
      setPlayers({ mode, player1: { name: '' }, player2: undefined, friendModeStyle: 'nice', relationship: 'Besties' });
    }
  };

  const handlePlayerNameChange = (player: 'player1' | 'player2', name: string) => {
    setPlayers(prev => ({
      ...prev,
      [player]: { name },
    }));
  };

  const handleCategoryChange = (categoryKey: string, index: number, value: string) => {
    setCategories(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((item, i) => (i === index ? value : item)),
    }));
  };

    const getRandomOptions = (categoryKey: string) => {
    const lib = ALL_CATEGORIES[categoryKey];
    if (typeof lib !== 'object' || Array.isArray(lib)) return [];

    const librarySource = players.mode === 'coop' ? lib.coop : lib.singlePlayer;
    if (!librarySource) return [];

    let allOptions: string[] = [];
    
    // In "Naughty" mode, heavily prioritize sabotage/chaos categories
    if (players.mode === 'friend' && players.friendModeStyle === 'naughty') {
      const sabotageKeys = Object.keys(librarySource).filter(k => k.toLowerCase().includes('sabotage') || k.toLowerCase().includes('chaos'));
      if (sabotageKeys.length > 0) {
        // 80% chance to pull only from sabotage categories
        if (Math.random() < 0.8) {
            allOptions = sabotageKeys.flatMap(k => librarySource[k]);
        }
      }
    }

    // If not sabotage mode or the 20% chance fallback, get all options
    if (allOptions.length === 0) {
        allOptions = Object.values(librarySource).flat() as string[];
    }
    
    // Get 4 random unique options
    const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
    const randomSelections = Array.from(new Set(shuffled)).slice(0, 4);

    // Fill remaining slots if not enough unique options
    while (randomSelections.length < 4 && allOptions.length > 0) {
        randomSelections.push(allOptions[Math.floor(Math.random() * allOptions.length)]);
    }
    
    return randomSelections;
  }
  
  const handleRandomizeCategory = (categoryKey: string) => {
     const randomSelections = getRandomOptions(categoryKey);
      if (randomSelections.length > 0) {
          setCategories(prev => ({
              ...prev,
              [categoryKey]: randomSelections,
          }));
      }
  };

  const handleSurpriseMe = () => {
    const surprisedCategories = { ...initialCategories }; // Start fresh, keeping Housing fixed
    
    Object.keys(surprisedCategories).forEach(categoryKey => {
      if (categoryKey === 'Housing') return;
      const randomSelections = getRandomOptions(categoryKey);
      if (randomSelections.length > 0) {
          surprisedCategories[categoryKey] = randomSelections;
      }
    });
    
    setCategories(surprisedCategories);
  };

  const handleLibrarySelect = (categoryKey: string, selections: string[]) => {
    setCategories(prev => ({
      ...prev,
      [categoryKey]: selections,
    }));
    setIsLibraryOpen(null);
  };

  const isFormComplete = () => {
    const namesComplete = players.mode === 'coop' 
      ? players.player1.name && players.player2?.name 
      : (players.mode === 'friend' ? players.player1.name && players.player2?.name : true);


    // Fix: Cast `options` to `string[]` to ensure type safety with `every`, as it was being inferred as `unknown`.
    const categoriesComplete = Object.values(categories).every(options => (options as string[]).every(opt => opt && opt.trim() !== ''));
    return namesComplete && categoriesComplete;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormComplete()) {
      onCategoriesSubmit(categories, players);
    }
  };
  
  const getCategoryInfo = (categoryKey: string) => {
    return CATEGORY_INFO[categoryKey] || { name: categoryKey, icon: '🌟' };
  }

  const getLibraryForCategory = (categoryKey: string) => {
    const lib = ALL_CATEGORIES[categoryKey];
    if (typeof lib !== 'object' || Array.isArray(lib)) return null;
    return players.mode === 'coop' ? lib.coop : lib.singlePlayer;
  };

  const getPlayerPlaceholders = () => {
    if (players.mode === 'self') {
      return ['Your Name (e.g., Screech)'];
    }
    if (players.mode === 'friend') {
      return ["Your Name", players.relationship ? RELATIONSHIP_ROLES[players.relationship][1].replace(' Name', "'s Name") : "Friend's Name"];
    }
    if (players.mode === 'coop') {
      return players.relationship ? RELATIONSHIP_ROLES[players.relationship] : ['Player 1 Name', 'Player 2 Name'];
    }
    return [];
  };

  const placeholders = getPlayerPlaceholders();

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-8">
      {/* Step 1: Who's Playing? */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Step 1: Who's Playing?</h2>
        <div className="flex flex-wrap gap-2 bg-black/20 p-1 rounded-full">
          {(['self', 'friend', 'coop'] as const).map(mode => (
            <button
              type="button"
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 ${
                players.mode === mode ? 'bg-pink-500 text-white' : 'bg-transparent text-indigo-200 hover:bg-white/10'
              }`}
            >
              {mode === 'self' ? '😎 Just Me' : mode === 'friend' ? '😈 For a Friend' : '🤝 With a Friend'}
            </button>
          ))}
        </div>
        
        <div className="mt-4">
            {players.mode === 'self' && (
                <input
                    type="text"
                    placeholder={placeholders[0]}
                    value={players.player1.name}
                    onChange={(e) => handlePlayerNameChange('player1', e.target.value)}
                    className="w-full bg-white/10 rounded-md p-2 text-white placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                />
            )}
            {(players.mode === 'friend' || players.mode === 'coop') && (
                <div className="p-4 bg-black/20 rounded-lg space-y-4">
                     <div>
                        <label htmlFor="relationship" className="block text-sm font-medium text-indigo-200 mb-1">Relationship</label>
                        <select
                            id="relationship"
                            value={players.relationship}
                            onChange={(e) => handlePlayerInfoChange('relationship', e.target.value)}
                            className="w-full bg-white/10 rounded-md p-2 text-white placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                        >
                            {Object.keys(RELATIONSHIP_ROLES).map(rel => <option key={rel}>{rel}</option>)}
                        </select>
                     </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder={placeholders[0]}
                            value={players.player1.name}
                            onChange={(e) => handlePlayerNameChange('player1', e.target.value)}
                            className="w-full bg-white/10 rounded-md p-2 text-white placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                            required
                        />
                        <input
                            type="text"
                            placeholder={placeholders[1]}
                            value={players.player2?.name || ''}
                            onChange={(e) => handlePlayerNameChange('player2', e.target.value)}
                            className="w-full bg-white/10 rounded-md p-2 text-white placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
                            required
                        />
                    </div>
                     {players.mode === 'friend' && (
                         <div>
                            <label className="block text-sm font-medium text-indigo-200 mb-1">Vibe</label>
                            <div className="flex flex-wrap gap-2 bg-black/20 p-1 rounded-full">
                               <button
                                 type="button"
                                 onClick={() => handlePlayerInfoChange('friendModeStyle', 'nice')}
                                 className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 ${
                                    players.friendModeStyle === 'nice' ? 'bg-cyan-500 text-white' : 'bg-transparent text-indigo-200 hover:bg-white/10'
                                  }`}
                               >
                                😇 Nice
                               </button>
                               <button
                                 type="button"
                                 onClick={() => handlePlayerInfoChange('friendModeStyle', 'naughty')}
                                 className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 ${
                                    players.friendModeStyle === 'naughty' ? 'bg-red-500 text-white' : 'bg-transparent text-indigo-200 hover:bg-white/10'
                                  }`}
                               >
                                😈 Naughty
                               </button>
                            </div>
                         </div>
                     )}
                </div>
            )}
        </div>
      </div>

      {/* Step 2: Fill in your options */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Step 2: Design Your Destiny! ✨</h2>
        <p className="text-indigo-200 mb-6">Fill in 4 options for each category, or let fate decide!</p>
        
        <button
          type="button"
          onClick={handleSurpriseMe}
          className="w-full mb-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg text-lg shadow-lg shadow-yellow-400/50 transform transition-all duration-300 hover:scale-105"
        >
          ✨ Surprise Me!
        </button>

        <div className="space-y-4">
            {Object.entries(categories).map(([key, options]) => {
                const catInfo = getCategoryInfo(key);
                const library = getLibraryForCategory(key);
                const isHousing = key === 'Housing';
                return (
                    <div key={key}>
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="text-lg font-semibold">{catInfo.icon} {catInfo.name}</h3>
                           {!isHousing && (
                             <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleRandomizeCategory(key)} className="bg-purple-500/80 hover:bg-purple-500 text-white font-bold p-2 rounded-lg text-xs" title="Randomize">
                                    🎲
                                </button>
                                {library && (
                                <button type="button" onClick={() => setIsLibraryOpen(key)} className="bg-indigo-500/80 hover:bg-indigo-500 text-white font-bold py-1 px-3 rounded-lg text-xs flex items-center gap-1">
                                    📚 Library
                                </button>
                                )}
                             </div>
                           )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                            {/* Fix: Cast `options` to `string[]` to ensure type safety for `.map`, as it was being inferred as `unknown`. */}
                            {(options as string[]).map((option, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleCategoryChange(key, index, e.target.value)}
                                    className="w-full bg-white/10 rounded-md p-2 text-white placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none disabled:bg-white/5 disabled:text-gray-400"
                                    placeholder={`Option ${index + 1}`}
                                    disabled={isHousing}
                                    required
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={!isFormComplete()}
        className="w-full bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 hover:from-pink-600 hover:via-yellow-500 hover:to-cyan-500 text-black font-bold py-3 px-4 rounded-lg text-xl shadow-lg shadow-yellow-400/50 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        Draw Your Spiral!
      </button>

      {isLibraryOpen && getLibraryForCategory(isLibraryOpen) && (
        <LibraryModal
          category={getCategoryInfo(isLibraryOpen).name}
          categoryKey={isLibraryOpen}
          library={getLibraryForCategory(isLibraryOpen)!}
          onSelect={handleLibrarySelect}
          onClose={() => setIsLibraryOpen(null)}
        />
      )}
    </form>
  );
};

export default Step2Categories;