import React from 'react';

const TopControls: React.FC = () => {
  return (
    <div className="top-controls">
      <div className="control-section">
        <h3>🎵 Tempo & Rhythm</h3>
        <div className="controls-row">
          {/* Tempo Control */}
          <div className="control-group">
            <label htmlFor="tempo">Tempo (BPM)</label>
            <div className="tempo-controls">
              <button className="tempo-btn">-</button>
              <span className="tempo-display">120</span>
              <button className="tempo-btn">+</button>
            </div>
          </div>

          {/* Time Signature */}
          <div className="control-group">
            <label htmlFor="time-signature">Time Signature</label>
            <select className="control-select">
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="2/4">2/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>

          {/* Key Signature */}
          <div className="control-group">
            <label htmlFor="key">Key</label>
            <select className="control-select">
              <option value="C">C Major</option>
              <option value="G">G Major</option>
              <option value="D">D Major</option>
              <option value="A">A Major</option>
              <option value="Am">A Minor</option>
              <option value="Em">E Minor</option>
            </select>
          </div>

          {/* Play Controls */}
          <div className="control-group">
            <button className="play-btn">▶️ Play</button>
            <button className="stop-btn">⏹️ Stop</button>
            <button className="record-btn">🔴 Record</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopControls;
