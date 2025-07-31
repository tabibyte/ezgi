import React from 'react';

const FloatingControls: React.FC = () => {
  return (
    <>
      {/* Top Controls - Tempo and Time Signature */}
      <div className="floating-control-box top-controls-float">
        <div className="tempo-section">
          <span className="tempo-label">Tempo:</span>
          <button className="tempo-btn">-</button>
          <span className="tempo-value">120</span>
          <button className="tempo-btn">+</button>
        </div>
        <div className="time-signature">
          <span className="time-sig-value">4/4</span>
        </div>
      </div>

      {/* Bottom Controls - Genre and Generate */}
      <div className="floating-control-box bottom-controls-float">
        <div className="genre-section">
          <span className="genre-label">Genre:</span>
          <div className="genre-options">
            <button className="genre-btn active">Pop</button>
            <button className="genre-btn">Jazz</button>
            <button className="genre-btn">Rock</button>
            <button className="genre-btn">Classical</button>
          </div>
        </div>
        <button className="main-generate-btn">Generate</button>
      </div>
    </>
  );
};

export default FloatingControls;
