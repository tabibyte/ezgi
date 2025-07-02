import React from 'react';

const TopControls: React.FC = () => {
  return (
    <div className="top-controls">
      <div className="tempo-section">
        <span className="tempo-label">bpm:</span>
        <span className="tempo-value">140</span>
        <button className="tempo-btn">+</button>
        <button className="tempo-btn">-</button>
      </div>
      
      <div className="time-signature">
        <span className="time-sig-value">4/4</span>
      </div>
    </div>
  );
};

export default TopControls;
