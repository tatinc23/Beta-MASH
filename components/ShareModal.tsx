import React, { useState } from 'react';
import { Avatar, MashResults } from '../types';
import { SHARE_PLATFORMS, SPONSOR } from '../constants';

interface ShareModalProps {
  onClose: () => void;
  avatar: Avatar | null;
  results: MashResults;
  story: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, avatar, results, story }) => {
  const [copyStatus, setCopyStatus] = useState('Copy Link');

  // Placeholder for generating a shareable URL to a page with the result
  const shareUrl = window.location.href; 
  const shareText = `My M.A.S.H. future: A ${results.Housing} and a ${results.Car}! Predict yours at 90s Baby M.A.S.H! #MASHmaniaFuture Powered by ${SPONSOR.tag}`;

  const handlePlatformClick = async (platform: (typeof SHARE_PLATFORMS)[0]) => {
    if (platform.action === 'download' && avatar) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${avatar.base64Image}`;
      link.download = 'my-90s-mash-portrait.png';
      link.click();
    } else if (platform.action === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Link'), 2000);
    } else {
      const url = `${platform.url}${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const renderPlatformButton = (platform: (typeof SHARE_PLATFORMS)[0], className: string = "") => (
    <button
        key={platform.name}
        onClick={() => handlePlatformClick(platform)}
        className={`bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 ${className}`}
    >
        {platform.emoji}
        <span>{platform.name === 'Copy Link' ? copyStatus : platform.name}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl p-6 w-full max-w-md flex flex-col border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Share Your Future</h2>
          <button onClick={onClose} className="text-2xl hover:text-pink-400 transition">&times;</button>
        </div>

        <div className="relative w-full aspect-square bg-black/20 rounded-lg flex items-center justify-center overflow-hidden mb-4">
          {avatar?.base64Image ? (
            <img src={`data:image/png;base64,${avatar.base64Image}`} alt="Your MASH portrait" className="w-full h-full object-cover" />
          ) : (
            <p className="text-indigo-300">Your portrait will appear here.</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
            <div className="flex gap-3">
                {renderPlatformButton(SHARE_PLATFORMS[0], "flex-1")}
                {renderPlatformButton(SHARE_PLATFORMS[1], "flex-1")}
            </div>
            <div className="flex gap-3">
                {renderPlatformButton(SHARE_PLATFORMS[2], "flex-1")}
                {renderPlatformButton(SHARE_PLATFORMS[3], "flex-1")}
            </div>
            {renderPlatformButton(SHARE_PLATFORMS[4], "w-full")}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;