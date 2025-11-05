import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MashResults } from '../types';
import { CATEGORY_INFO } from '../constants';

interface Step4EliminationProps {
  categories: { [key: string]: string[] };
  magicNumber: number;
  onEliminationComplete: (results: MashResults) => void;
}

interface MashItem {
  id: number;
  category: string;
  option: string;
  eliminated: boolean;
  winner: boolean;
}

const Step4Elimination: React.FC<Step4EliminationProps> = ({ categories, magicNumber, onEliminationComplete }) => {
  const initialItems = useMemo(() => {
    let idCounter = 0;
    const categoryOrder = Object.keys(CATEGORY_INFO).filter(c => categories[c]);
    const customCategories = Object.keys(categories).filter(c => !CATEGORY_INFO[c]);

    return [...categoryOrder, ...customCategories].flatMap(category =>
      (categories[category] as string[]).map(option => ({
        id: idCounter++,
        category,
        option,
        eliminated: false,
        winner: false,
      }))
    );
  }, [categories]);

  const [items, setItems] = useState<MashItem[]>(initialItems);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const isSkippedRef = useRef(false);
  const currentIndexRef = useRef(-1);

  useEffect(() => {
    if (magicNumber === 0) return;

    const runElimination = async () => {
      let currentItems = [...initialItems];

      while (true) {
        if (isSkippedRef.current) return;

        const remainingItems = currentItems.filter(i => !i.eliminated);
        const remainingCategories = new Set(remainingItems.map(i => i.category));
        if (remainingItems.length === remainingCategories.size) {
            break;
        }

        for (let i = 0; i < magicNumber; i++) {
          if (isSkippedRef.current) return;
          
          do {
            currentIndexRef.current = (currentIndexRef.current + 1) % currentItems.length;
          } while (currentItems[currentIndexRef.current].eliminated);
          
          setHighlightedId(currentItems[currentIndexRef.current].id);
          await new Promise(res => setTimeout(res, 75));
        }

        setHighlightedId(null);
        const itemToEliminate = currentItems[currentIndexRef.current];
        
        const remainingInCategory = currentItems.filter(
            item => item.category === itemToEliminate.category && !item.eliminated
        ).length;

        if (remainingInCategory > 1) {
          currentItems = currentItems.map(item =>
            item.id === itemToEliminate.id ? { ...item, eliminated: true } : item
          );
          setItems(currentItems);
          await new Promise(res => setTimeout(res, 400));
        }
      }
      
      if (isSkippedRef.current) return;

      // Fix: Use a more robust method to set final winners to prevent state issues.
      const finalWinnerIds = currentItems.filter(item => !item.eliminated).map(item => item.id);
      setItems(prevItems => prevItems.map(item => ({
        ...item,
        // Ensure eliminated items from the animation are persisted
        eliminated: !finalWinnerIds.includes(item.id),
        winner: finalWinnerIds.includes(item.id),
      })));
      setIsComplete(true);
    };

    runElimination();

    return () => {
      isSkippedRef.current = true;
    };
  }, [initialItems, magicNumber]);


  const getCategoryInfo = (categoryKey: string) => {
    return CATEGORY_INFO[categoryKey] || { name: categoryKey, icon: '🌟' };
  }

  const handleSeeResults = () => {
      const results: MashResults = {};
      items.filter(i => i.winner).forEach(item => {
        results[item.category] = item.option;
      });
      onEliminationComplete(results);
  };
  
  const handleSkipElimination = () => {
    if (isComplete) return;
    isSkippedRef.current = true;

    // Fix: Operate on the original, unmodified list to prevent errors from partially animated state.
    let currentItems = [...initialItems];

    while (true) {
        const remainingItems = currentItems.filter(i => !i.eliminated);
        const remainingCategories = new Set(remainingItems.map(i => i.category));
        if (remainingItems.length === remainingCategories.size) {
            break;
        }

        // Use a local counter instead of the ref to avoid side effects
        let localCurrentIndex = currentIndexRef.current;
        for (let i = 0; i < magicNumber; i++) {
            do {
                localCurrentIndex = (localCurrentIndex + 1) % currentItems.length;
            } while (currentItems[localCurrentIndex].eliminated);
        }
        currentIndexRef.current = localCurrentIndex;


        const itemToEliminate = currentItems[currentIndexRef.current];
        const remainingInCategory = currentItems.filter(
            item => item.category === itemToEliminate.category && !item.eliminated
        ).length;

        if (remainingInCategory > 1) {
            currentItems = currentItems.map(item =>
                item.id === itemToEliminate.id ? { ...item, eliminated: true } : item
            );
        }
    }
    const finalItems = currentItems.map(item => ({
        ...item,
        winner: !item.eliminated,
    }));
    setItems(finalItems);
    setIsComplete(true);
  };

  const categoryOrder = useMemo(() => {
    const standard = Object.keys(CATEGORY_INFO).filter(c => categories[c]);
    const custom = Object.keys(categories).filter(c => !CATEGORY_INFO[c]);
    return [...standard, ...custom];
  }, [categories]);

  const getItemClasses = (item: MashItem) => {
    if (item.winner) {
      return 'bg-green-500 scale-105 shadow-lg ring-2 ring-white';
    }
    if (highlightedId === item.id && !item.eliminated) {
      return 'bg-pink-500/80 scale-110';
    }
    if (item.eliminated) {
      return 'bg-red-500/50 text-gray-400 line-through';
    }
    return 'bg-white/10';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <h2 className="text-3xl font-bold">Step 4: The Elimination! ⚡</h2>
        {!isComplete && (
          <button onClick={handleSkipElimination} className="bg-yellow-500/80 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg text-sm">
              Ain't Nobody Got Time For That
          </button>
        )}
      </div>
      <p className="text-indigo-200 mb-6">Your magic number is: <span className="font-bold text-pink-400 text-2xl">{magicNumber}</span></p>

      <div className="space-y-4">
        {categoryOrder.map(category => {
          const catInfo = getCategoryInfo(category);
          return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-2 text-left">{catInfo.icon} {catInfo.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {items.filter(item => item.category === category).map(item => (
                <div
                  key={item.id}
                  className={`p-2 rounded-lg transition-all duration-200 text-center text-sm flex items-center justify-center min-h-[4rem] ${getItemClasses(item)}`}
                >
                  {item.option}
                </div>
              ))}
            </div>
          </div>
        )})}
      </div>

      <div className="mt-8 h-12 flex items-center justify-center">
        {!isComplete ? (
           <div className="text-center">
             <div className="inline-block w-8 h-8 border-4 border-t-pink-500 border-indigo-500 rounded-full animate-spin"></div>
             <p className="mt-2 text-indigo-200 text-sm">The spirits are deciding...</p>
           </div>
        ) : (
          <button onClick={handleSeeResults} className="w-full bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 hover:from-pink-600 hover:via-yellow-500 hover:to-cyan-500 text-black font-bold py-3 px-4 rounded-lg text-xl shadow-lg shadow-yellow-400/50 transform transition-all duration-300 hover:scale-105 animate-pulse">
             See Your Future!
          </button>
        )}
      </div>

    </div>
  );
};

export default Step4Elimination;