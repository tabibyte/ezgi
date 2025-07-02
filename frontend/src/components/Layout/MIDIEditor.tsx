import React from 'react';

const PianoRoll: React.FC = () => {
  return (
    <div className="piano-roll">
      <div className="piano-roll-header">
        <h3>🎹 Piano Roll (FL Studio Style)</h3>
        <div className="piano-roll-tools">
          <button className="tool-btn active">✏️ Draw</button>
          <button className="tool-btn">✂️ Cut</button>
          <button className="tool-btn">📋 Copy</button>
          <button className="tool-btn">🗑️ Delete</button>
        </div>
      </div>
      
      <div className="piano-roll-container">
        {/* Piano keys on the left */}
        <div className="piano-keys">
          <div className="key-label">C5</div>
          <div className="key-label">B4</div>
          <div className="key-label black">A#4</div>
          <div className="key-label">A4</div>
          <div className="key-label black">G#4</div>
          <div className="key-label">G4</div>
          <div className="key-label black">F#4</div>
          <div className="key-label">F4</div>
          <div className="key-label">E4</div>
          <div className="key-label black">D#4</div>
          <div className="key-label">D4</div>
          <div className="key-label black">C#4</div>
          <div className="key-label">C4</div>
        </div>

        {/* Main grid area */}
        <div className="piano-grid">
          <div className="grid-header">
            <div className="measure">1</div>
            <div className="measure">2</div>
            <div className="measure">3</div>
            <div className="measure">4</div>
          </div>
          
          <div className="grid-content">
            {/* Grid lines and note placement area */}
            <div className="grid-placeholder">
              <p>🎼 Click here to add notes</p>
              <p>📝 Piano roll will be implemented with Tone.js</p>
              <div className="sample-notes">
                <div className="note sample-note" style={{left: '10%', top: '20%'}}>C4</div>
                <div className="note sample-note" style={{left: '25%', top: '40%'}}>E4</div>
                <div className="note sample-note" style={{left: '40%', top: '60%'}}>G4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoRoll;
