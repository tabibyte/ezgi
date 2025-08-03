import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface PlaybackControlsProps {
  notes: Array<{
    id: string;
    note: string;
    time: number;
    duration: number;
    velocity: number;
  }>;
  sampler?: Tone.Sampler | null;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({ 
  notes, 
  sampler, 
  bpm = 120, 
  onBpmChange 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const timeoutRefs = useRef<number[]>([]);
  const isPlayingRef = useRef(false);
  const isLoopingRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // Clean up timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  }, []);

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    clearAllTimeouts();
  }, [clearAllTimeouts]);

  // Play notes
  const playNotes = useCallback(async () => {
    if (!sampler || notes.length === 0) return;

    try {
      // Start audio context if needed
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      clearAllTimeouts();

      // Calculate tempo multiplier (120 BPM is the baseline)
      const tempoMultiplier = 120 / bpm;

      // Schedule all notes
      notes.forEach(note => {
        const timeout = setTimeout(() => {
          sampler.triggerAttackRelease(note.note, note.duration * tempoMultiplier, undefined, note.velocity);
        }, note.time * 1000 * tempoMultiplier); // Apply tempo to timing

        timeoutRefs.current.push(timeout);
      });

      // Calculate the total duration and schedule loop/stop
      const maxEndTime = Math.max(...notes.map(note => note.time + note.duration));
      const adjustedDuration = maxEndTime * tempoMultiplier * 1000; // Convert to milliseconds

      const endTimeout = setTimeout(() => {
        // Use refs to check current state
        if (isLoopingRef.current && isPlayingRef.current) {
          // Restart playback
          playNotes();
        } else {
          // Stop playback
          stopPlayback();
        }
      }, adjustedDuration);

      timeoutRefs.current.push(endTimeout);

    } catch (error) {
      console.error('Error during playback:', error);
      stopPlayback();
    }
  }, [sampler, notes, isLooping, isPlaying, clearAllTimeouts, stopPlayback, bpm]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      await playNotes();
    }
  }, [isPlaying, playNotes, stopPlayback]);

  // Handle loop toggle
  const handleLoopToggle = useCallback(() => {
    setIsLooping(!isLooping);
  }, [isLooping]);

  // Handle BPM change
  const handleBpmChange = useCallback((delta: number) => {
    const newBpm = Math.max(60, Math.min(200, bpm + delta)); // Clamp between 60-200 BPM
    if (onBpmChange) {
      onBpmChange(newBpm);
    }
  }, [bpm, onBpmChange]);

  // Handle minimize toggle
  const handleMinimizeToggle = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return (
    <div className={`playback-controls ${isMinimized ? 'minimized' : ''}`}>
      <div className="playback-controls-container">
        {/* Play/Pause Button - Always visible */}
        <button 
          className={`playback-btn play-pause-btn ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Stop Button - Always visible */}
        <button 
          className="playback-btn stop-btn"
          onClick={stopPlayback}
          title="Stop"
          disabled={!isPlaying}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" />
          </svg>
        </button>

        {/* Additional controls hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Loop Button */}
            <button 
              className={`playback-btn loop-btn ${isLooping ? 'active' : ''}`}
              onClick={handleLoopToggle}
              title="Toggle Loop"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z"/>
                <path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            </button>

            {/* BPM Controls */}
            <div className="bpm-controls">
              <button 
                className="bpm-btn bpm-decrease"
                onClick={() => handleBpmChange(-5)}
                title="Decrease BPM"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
              <div className="bpm-display">
                <span className="bpm-value">{bpm}</span>
                <span className="bpm-label">BPM</span>
              </div>
              <button 
                className="bpm-btn bpm-increase"
                onClick={() => handleBpmChange(5)}
                title="Increase BPM"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Minimize/Expand Arrowhead Indicator */}
      <button 
        className="minimize-arrowhead"
        onClick={handleMinimizeToggle}
        title={isMinimized ? 'Expand controls' : 'Minimize controls'}
      >
        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
          {isMinimized ? (
            <path d="M6 8L0 2h12L6 8z"/>
          ) : (
            <path d="M6 0L12 6H0L6 0z"/>
          )}
        </svg>
      </button>
    </div>
  );
};

export default PlaybackControls;
