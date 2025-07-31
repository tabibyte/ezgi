import React from 'react';

const FloatingChat: React.FC = () => {
  return (
    <div className="floating-chat-box">
      {/* Theory Section */}
      <div className="theory-section">
        <h3 className="theory-title">🎼 Augmented Chords</h3>
        <div className="theory-content">
          <p>At its most basic, an augmented triad is a three-note chord consisting of:</p>
          <ul>
            <li>• Root note</li>
            <li>• Major third above the root</li>
            <li>• Augmented fifth above the root</li>
          </ul>
          <p>The "augmented" refers to the fifth, which is raised a half step (semitone) from a perfect fifth.</p>
          <p><strong>Example:</strong> A C major triad is C - E - G (Root, Major 3rd, Perfect 5th). A C augmented (Caug or C+) triad is C - E - G# (Root, Major 3rd, Augmented 5th).</p>
          
          <div className="theory-buttons">
            <button className="theory-btn">Show examples</button>
            <button className="theory-btn">Explain simply</button>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="chat-input-section">
        <input 
          type="text" 
          placeholder="Ask about music theory..."
          className="chat-input"
        />
      </div>
    </div>
  );
};

export default FloatingChat;
