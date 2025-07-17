import React from 'react';
import TopControls from './TopControls';
import PianoRoll from './MIDIEditor';
import BottomControls from './BottomControls';
import AIDialog from './AIDialog';
import GeneratePopup from './GeneratePopup';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      {/* Header with note emoji only */}
      <header className="app-header">
        <div className="header-content">
          <span className="note-emoji">🎵</span>
        </div>
      </header>

      {/* Main content area */}
      <div className="main-content">
        {/* Left side - Music creation area */}
        <div className="music-workspace">
          {/* Top controls - Tempo and Rhythm */}
          <TopControls />
          
          {/* Main piano roll area */}
          <PianoRoll />
          
          {/* Bottom controls - Genre and Generate */}
          <BottomControls />
        </div>

        {/* Right side - AI Dialog */}
        <div className="ai-sidebar">
          <AIDialog />
        </div>
      </div>

      {/* Generate popup overlay */}
      <GeneratePopup />
    </div>
  );
};

export default MainLayout;
