import React from 'react';

const BottomControls: React.FC = () => {
  return (
    <div className="bottom-controls">
      <div className="control-section">
        <div className="controls-row">
          {/* Genre Selection */}
          <div className="control-group">
            <label htmlFor="genre">🎭 Genre</label>
            <select className="control-select genre-select">
              <option value="">Select Genre...</option>
              <option value="pop">🎵 Pop</option>
              <option value="rock">🎸 Rock</option>
              <option value="jazz">🎺 Jazz</option>
              <option value="classical">🎼 Classical</option>
              <option value="electronic">🔊 Electronic</option>
              <option value="blues">🎷 Blues</option>
              <option value="country">🤠 Country</option>
              <option value="hip-hop">🎤 Hip-Hop</option>
            </select>
          </div>

          {/* Complexity Level */}
          <div className="control-group">
            <label htmlFor="complexity">📊 Complexity</label>
            <select className="control-select">
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">🌿 Intermediate</option>
              <option value="advanced">🌳 Advanced</option>
            </select>
          </div>

          {/* Length */}
          <div className="control-group">
            <label htmlFor="length">📏 Length</label>
            <select className="control-select">
              <option value="4">4 measures</option>
              <option value="8">8 measures</option>
              <option value="16">16 measures</option>
              <option value="32">32 measures</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="control-group">
            <button className="generate-btn">
              ✨ Generate Music
            </button>
          </div>

          {/* Additional Actions */}
          <div className="control-group">
            <button className="action-btn">💾 Save</button>
            <button className="action-btn">📤 Export</button>
            <button className="action-btn">🔄 Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomControls;
