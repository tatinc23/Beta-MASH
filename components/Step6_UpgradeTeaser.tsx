import React from 'react';

const UpgradeTeaser: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
    const features = [
        {
            emoji: '🎬',
            title: 'Living Portraits',
            description: 'Bring your final M.A.S.H. portrait to life with a short, animated video! The clip below is just an example. (Note: Video generation is an advanced feature and may incur higher costs.)',
            videoSrc: '/assets/living-portrait-final.mp4',
            posterSrc: '/assets/living-portrait-poster.png'
        },
        {
            emoji: '🎉',
            title: 'Party M.A.S.H. (3-6 Players)',
            description: 'The ultimate social upgrade. Team up with your whole crew to build one chaotic, shared destiny together.'
        }
    ];

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 space-y-6 text-center animate-fade-in">
            <div className="space-y-4 pt-2">
                {features.map(feature => (
                    <div key={feature.title} className="bg-black/20 rounded-lg p-4 text-left">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="text-4xl">{feature.emoji}</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-pink-300">{feature.title}</h3>
                                {feature.description && <p className="text-indigo-200 text-sm mt-1">{feature.description}</p>}
                            </div>
                        </div>
                        {feature.videoSrc && (
                            <div className="mt-4">
                                <video
                                  src={feature.videoSrc}
                                  poster={feature.posterSrc}
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
                <button onClick={onRestart} className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-black font-bold py-3 px-4 rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105">Play Again!</button>
            </div>
        </div>
    );
};

export default UpgradeTeaser;