import React, { useState } from 'react';

const FeedbackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 z-40"
            aria-label="Leave feedback"
            title="Leave feedback"
        >
            <span className="text-2xl">💌</span>
        </button>
    );
};

const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message) return;

        // This will open the user's default email client
        const to = 'emailme@tatinc.us'; // You can change this to your email!
        const subject = encodeURIComponent("90s Baby M.A.S.H. - Beta Feedback");
        const body = encodeURIComponent(
`Hey there,

Here's some feedback on the M.A.S.H. app:

${message}

---
Reply-To: ${email || 'Not provided'}
`
        );
        
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        onClose(); // Close the modal after triggering the email client
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-2xl p-6 w-full max-w-md flex flex-col border border-white/20 space-y-5"
            >
                <h2 className="text-2xl font-bold text-center">Got any deets for us? <br/>(thoughts, bugs, ideas)</h2>
                
                <div>
                    <textarea
                        id="feedback-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., 'The avatar generation was wicked fast!'"
                        rows={5}
                        className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-pink-400 focus:outline-none transition"
                        required
                    />
                </div>
                
                <div>
                     <label htmlFor="feedback-email" className="text-base font-medium text-indigo-100 mb-2 block">Your email (optional, if you want a reply)</label>
                    <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-black/20 rounded-lg p-3 text-white placeholder-indigo-300/70 focus:ring-2 focus:ring-pink-400 focus:outline-none transition"
                    />
                </div>

                <div className="flex gap-4 pt-2">
                     <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                        Nevermind
                    </button>
                    <button
                        type="submit"
                        disabled={!message}
                        className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                    >
                        Send Feedback
                    </button>
                </div>
            </form>
        </div>
    );
};


const Feedback: React.FC = () => {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    return (
        <>
            <FeedbackButton onClick={() => setIsFeedbackModalOpen(true)} />
            {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
        </>
    )
}

export default Feedback;