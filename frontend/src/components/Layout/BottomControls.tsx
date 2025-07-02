import React from 'react';

const BottomControls: React.FC = () => {
  return (
    <div className="bottom-controls">
      <div className="genre-section">
        <span className="genre-label">Genre:</span>
        <div className="genre-options">
          <button className="genre-btn">Rock</button>
          <button className="genre-btn">Classical</button>
          <button className="genre-btn active">Pop</button>
          <button className="genre-btn">Experimental</button>
        </div>
      </div>
      
      <div className="generate-section">
        <div className="generate-options">
          <button className="generate-option-btn">Generate Chords</button>
          <button className="generate-option-btn">Generate Melody</button>
        </div>
        <button className="main-generate-btn">Generate</button>
      </div>
    </div>
  );
};

export default BottomControls;
