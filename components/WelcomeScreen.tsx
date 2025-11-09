import React from 'react';

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const sections = [
    {
      emoji: '🤯',
      title: 'What to Expect',
      content: "Uh… chaos. You might end up with an avatar that has three elbows or a future spouse named “AI Chad.” That’s normal. Probably. If something looks broken, weird, or hilariously wrong, congrats — you found a bug!",
    },
    {
      emoji: '🎯',
      title: 'Your Mission',
      content: "See the little envelope icon 👇? That's your direct hotline to M.A.S.H. HQ (aka me). It should open your email with everything pre-filled. Use it to roast the bugs, drop ideas, or tell me how cursed your result was.",
    },
    {
      emoji: '🤝',
      title: 'The Deal',
      content: "Play it. Break it. Laugh at it. Tell me what sucked *before* I embarrass myself on the App Store. I owe you one… or at least a shoutout when this thing goes viral.",
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 text-center animate-fade-in w-full max-w-2xl mx-auto">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300 mb-2">
        Welcome to the Madness 🤪
      </h2>
      <p className="text-indigo-200">
        You’re officially part of the <strong>M.A.S.H. testing squad</strong> — the brave souls helping figure out if this thing actually works.
      </p>

      <p className="text-indigo-100 max-w-xl mx-auto">
        First off, thank you. Seriously. You’re helping test something that might be fun… or might melt your phone. Either way, we’re making history.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
        {sections.map(section => (
          <div key={section.title} className="bg-black/20 p-4 rounded-lg border border-white/10 flex flex-col">
            <h3 className="text-lg font-bold text-cyan-300 mb-2">
              <span className="text-2xl mr-2">{section.emoji}</span>
              {section.title}
            </h3>
            <p className="text-indigo-200 text-sm flex-grow">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <p className="text-indigo-100 font-bold pt-4">
        Now hit that button and let’s see what kind of digital nonsense your future holds.
      </p>

      <button
        onClick={onStart}
        className="w-full !mt-6 bg-gradient-to-r from-pink-500 to-yellow-400 text-black font-extrabold py-4 px-4 rounded-lg text-2xl shadow-lg transform transition-all duration-300 hover:scale-105"
      >
        I'm Ready! Let's Play!
      </button>
    </div>
  );
};

export default WelcomeScreen;
