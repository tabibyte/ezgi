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
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({ notes, sampler }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration] = useState(8); // 8 seconds total duration

  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  // Clean up timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  }, []);

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    clearAllTimeouts();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
      startTimeRef.current = Date.now();

      // Schedule all notes
      notes.forEach(note => {
        const timeout = setTimeout(() => {
          sampler.triggerAttackRelease(note.note, note.duration, undefined, note.velocity);
        }, note.time * 1000); // Convert to milliseconds

        timeoutRefs.current.push(timeout);
      });

      // Update current time display
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentTime(elapsed);

        // Check if playback is complete
        if (elapsed >= totalDuration) {
          if (isLooping) {
            // Restart playback
            playNotes();
          } else {
            stopPlayback();
          }
        }
      }, 100);

    } catch (error) {
      console.error('Error during playback:', error);
      stopPlayback();
    }
  }, [sampler, notes, totalDuration, isLooping, clearAllTimeouts, stopPlayback]);

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

  // Format time for display
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [clearAllTimeouts]);

  return (
    <div className="playback-controls">
      <div className="playback-controls-container">
        {/* Play/Pause Button */}
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

        {/* Stop Button */}
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

        {/* Time Display */}
        <div className="time-display">
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="time-separator">/</span>
          <span className="total-time">{formatTime(totalDuration)}</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{
              width: `${(currentTime / totalDuration) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
