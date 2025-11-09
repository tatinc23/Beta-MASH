import React from 'react';

const UpgradeTeaser: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
    const features = [
        {
            emoji: '🎬',
            title: 'Living Portraits',
            description: 'Bring your avatar to life! Generate a short, looping video of your character smiling, winking, and reacting. Coming soon!',
            videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-a-girl-looks-around-in-a-futuristic-3d-environment-47216-large.mp4'
        },
        {
            emoji: '🎉',
            title: 'Party M.A.S.H. (3-6 Players)',
            description: 'The ultimate social upgrade. Team up with your whole crew to build one chaotic, shared destiny together.'
        }
    ];

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-cyan-300">The Future of Your Future...</h2>
            <p className="text-indigo-200">Get hyped for these epic upgrades, coming soon to a M.A.S.H. game near you!</p>
            <div className="space-y-4 pt-2">
                {features.map(feature => (
                    <div key={feature.title} className="bg-black/20 rounded-lg p-4 text-left">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="text-4xl">{feature.emoji}</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-pink-300">{feature.title}</h3>
                                <p className="text-indigo-200 text-sm mt-1">{feature.description}</p>
                            </div>
                        </div>
                        {feature.videoSrc && (
                            <div className="mt-4">
                                <video
                                  src={feature.videoSrc}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full rounded-lg shadow-lg border-2 border-pink-400/50"
                                >
                                  Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="border-t border-white/10 pt-6">
                <button onClick={onRestart} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform hover:scale-105">Play Again!</button>
            </div>
        </div>
    );
};

export default UpgradeTeaser;