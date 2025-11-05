import React, { useState } from 'react';
import { MashResults } from './types';
// Fix: Corrected import paths.
import { ALL_CATEGORIES } from './constants';
import Step2Categories from './components/Step2_Categories';
import Step3Spiral from './components/Step3_Spiral';
import Step4Elimination from './components/Step4_Elimination';
import ResultsView from './components/ResultsView';

// Define initial categories with 4 empty slots for each
const initialCategories: { [key: string]: string[] } = Object.keys(ALL_CATEGORIES).reduce((acc, key) => {
  acc[key] = ['', '', '', ''];
  return acc;
}, {} as { [key: string]: string[] });
// Ensure Housing is fixed
initialCategories['Housing'] = ["Mansion", "Apartment", "Shack", "House"];

export interface Players {
  mode: 'self' | 'friend' | 'coop';
  player1: { name: string; };
  player2?: { name: string; };
  relationship?: string;
  friendModeStyle?: 'nice' | 'naughty';
}

function App() {
  const [step, setStep] = useState<'categories' | 'spiral' | 'elimination' | 'results'>('categories');
  const [players, setPlayers] = useState<Players>({ mode: 'self', player1: { name: '' } });
  const [categories, setCategories] = useState<{ [key: string]: string[] } | null>(initialCategories);
  const [magicNumber, setMagicNumber] = useState(0);
  const [mashResults, setMashResults] = useState<MashResults | null>(null);

  const handleCategoriesSubmit = (submittedCategories: { [key: string]: string[] }, playersInfo: Players) => {
    setCategories(submittedCategories);
    setPlayers(playersInfo);
    setStep('spiral');
  };

  const handleSpiralComplete = (num: number) => {
    setMagicNumber(num);
    setStep('elimination');
  };

  const handleEliminationComplete = (results: MashResults) => {
    setMashResults(results);
    setStep('results');
  };

  const handleRestart = () => {
    setStep('categories');
    setPlayers({ mode: 'self', player1: { name: '' } });
    setCategories(initialCategories);
    setMagicNumber(0);
    setMashResults(null);
  };

  const renderStep = () => {
    switch (step) {
      case 'categories':
        return <Step2Categories onCategoriesSubmit={handleCategoriesSubmit} initialCategories={initialCategories} />;
      case 'spiral':
        return <Step3Spiral onSpiralComplete={handleSpiralComplete} />;
      case 'elimination':
        // Type safety checks
        if (categories && magicNumber > 0) {
          return <Step4Elimination categories={categories} magicNumber={magicNumber} onEliminationComplete={handleEliminationComplete} />;
        }
        // Fallback
        handleRestart();
        return null;
      case 'results':
        // Type safety checks
        if (mashResults) {
          return <ResultsView results={mashResults} onRestart={handleRestart} players={players} />;
        }
        // Fallback
        handleRestart();
        return null;
      default:
        return <Step2Categories onCategoriesSubmit={handleCategoriesSubmit} initialCategories={initialCategories} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 min-h-screen text-white font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300">
            M.A.S.H. 90s AI
          </h1>
          <p className="text-indigo-300 mt-2 text-lg">Your totally tubular 90s future, revealed!</p>
        </header>
        <main>
          {renderStep()}
        </main>
        <footer className="text-center mt-8 text-indigo-400 text-sm">
            <p>Powered by Gemini. As if!</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
