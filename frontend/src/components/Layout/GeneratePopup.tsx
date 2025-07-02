import React from 'react';

const GeneratePopup: React.FC = () => {
  // This would be controlled by state in a real implementation
  const isVisible = false;

  if (!isVisible) return null;

  return (
    <div className="popup-overlay">
      <div className="generate-popup">
        <div className="popup-header">
          <h3>✨ Generate Music</h3>
          <button className="close-btn">✖️</button>
        </div>

        <div className="popup-content">
          <p>What would you like to generate?</p>
          
          <div className="generation-options">
            <button className="option-btn melody-btn">
              <div className="option-icon">🎵</div>
              <div className="option-content">
                <h4>Generate Melody</h4>
                <p>Create a melodic line based on your settings</p>
              </div>
            </button>

            <button className="option-btn chords-btn">
              <div className="option-icon">🎶</div>
              <div className="option-content">
                <h4>Generate Chords</h4>
                <p>Create a chord progression for your song</p>
              </div>
            </button>

            <button className="option-btn both-btn">
              <div className="option-icon">🎼</div>
              <div className="option-content">
                <h4>Generate Both</h4>
                <p>Create melody and chords together</p>
              </div>
            </button>
          </div>

          {/* Advanced Options */}
          <div className="advanced-options">
            <h4>🔧 Advanced Options</h4>
            <div className="option-row">
              <label>
                <input type="checkbox" />
                Include theory explanation
              </label>
            </div>
            <div className="option-row">
              <label>
                <input type="checkbox" />
                Highlight theory concepts
              </label>
            </div>
            <div className="option-row">
              <label>
                <input type="checkbox" />
                Generate variations
              </label>
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <button className="cancel-btn">Cancel</button>
          <button className="confirm-btn">Generate ✨</button>
        </div>
      </div>
    </div>
  );
};

export default GeneratePopup;
