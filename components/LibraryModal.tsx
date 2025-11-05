import React, { useState, useMemo } from 'react';

interface LibraryModalProps {
  category: string;
  categoryKey: string;
  library: { [key: string]: string[] | { [key: string]: string[] } };
  onSelect: (categoryKey: string, selections: string[]) => void;
  onClose: () => void;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ category, categoryKey, library, onSelect, onClose }) => {
  const [selections, setSelections] = useState<string[]>([]);
  const subCategories = useMemo(() => Object.keys(library), [library]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(subCategories[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const allOptions = useMemo(() => {
    return subCategories.flatMap(catKey => library[catKey as keyof typeof library] as string[]);
  }, [library, subCategories]);

  const filteredOptions = useMemo(() => {
    return allOptions.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allOptions]);

  const handleToggleSelection = (option: string) => {
    setSelections(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      if (prev.length < 4) {
        return [...prev, option];
      }
      return prev;
    });
  };

  const handleConfirm = () => {
    if (selections.length > 0) {
      // Pad with random selections if not full
      const finalSelections = [...selections];
      const remainingOptions = allOptions.filter(opt => !finalSelections.includes(opt));
      while (finalSelections.length < 4 && remainingOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * remainingOptions.length);
          finalSelections.push(remainingOptions.splice(randomIndex, 1)[0]);
      }
      onSelect(categoryKey, finalSelections);
    }
  };

  const renderOption = (option: string, index: number) => (
    <div
      key={`${option}-${index}`}
      onClick={() => handleToggleSelection(option)}
      className={`p-3 rounded-lg text-center cursor-pointer transition text-sm flex items-center justify-center min-h-[6rem] border-2 ${
        selections.includes(option)
          ? 'bg-green-500 border-white font-bold'
          : 'bg-white/10 border-transparent hover:border-pink-400'
      }`}
    >
      {option}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold">📚 {category} Library</h2>
          <button onClick={onClose} className="text-2xl hover:text-pink-400 transition">&times;</button>
        </div>

        {/* Search */}
        <div className="flex-shrink-0">
            <input
                type="text"
                placeholder="Search all options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 rounded-md p-2 mb-4 text-white placeholder-indigo-300/70 focus:ring-1 focus:ring-pink-400 focus:outline-none"
            />
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow pr-2">
          {searchTerm ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredOptions.map(renderOption)}
            </div>
          ) : (
            <div className="space-y-2">
              {subCategories.map(catKey => (
                <details key={catKey} open={openAccordion === catKey} onToggle={(e) => e.currentTarget.open && setOpenAccordion(catKey)}>
                  <summary className="bg-white/10 p-3 rounded-lg cursor-pointer font-semibold capitalize text-indigo-200 hover:bg-white/20">
                    {catKey.replace(/([A-Z])/g, ' $1').trim()}
                  </summary>
                  <div className="p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(library[catKey as keyof typeof library] as string[]).map(renderOption)}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 flex-shrink-0">
            <div className="min-h-[5rem] bg-black/20 rounded-lg p-2 mb-4">
                <p className="text-sm text-indigo-300 mb-1">Your Picks ({selections.length}/4):</p>
                <div className="flex flex-wrap items-center gap-2">
                    {selections.map(sel => (
                        <div key={sel} className="bg-pink-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <span>{sel.substring(0, 20)}{sel.length > 20 ? '...' : ''}</span>
                            <button onClick={() => handleToggleSelection(sel)} className="font-bold">&times;</button>
                        </div>
                    ))}
                    {selections.length === 0 && <p className="text-xs text-gray-400">Tap options above to add them!</p>}
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition">Cancel</button>
                <button
                    onClick={handleConfirm}
                    disabled={selections.length === 0}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {selections.length < 4 && selections.length > 0 ? `Add ${selections.length} & Randomize Rest` : `Add ${selections.length} Selections`}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;