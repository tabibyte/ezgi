import React from 'react';

const PianoRoll: React.FC = () => {
  return (
    <div className="piano-roll">
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
          <div className="key-label">B3</div>
          <div className="key-label black">A#3</div>
          <div className="key-label">A3</div>
          <div className="key-label black">G#3</div>
          <div className="key-label">G3</div>
          <div className="key-label black">F#3</div>
          <div className="key-label">F3</div>
          <div className="key-label">E3</div>
          <div className="key-label black">D#3</div>
          <div className="key-label">D3</div>
          <div className="key-label black">C#3</div>
          <div className="key-label">C3</div>
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
