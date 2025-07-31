import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface Note {
  id: string;
  note: string;
  time: number;
  duration: number;
  velocity: number;
}

interface GridPosition {
  x: number;
  y: number;
}

const MIDIEditor: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', note: 'C4', time: 0.1, duration: 0.5, velocity: 0.8 },
    { id: '2', note: 'E4', time: 0.25, duration: 0.5, velocity: 0.8 },
    { id: '3', note: 'G4', time: 0.4, duration: 0.5, velocity: 0.8 }
  ]);
  
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  
  const gridRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  
  // Piano key mappings (2 octaves: C4-B5)
  const pianoKeys = [
    'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 
    'E5', 'D#5', 'D5', 'C#5', 'C5', 'B4', 'A#4', 'A4', 
    'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4'
  ];
  
  const blackKeys = ['A#5', 'G#5', 'F#5', 'D#5', 'C#5', 'A#4', 'G#4', 'F#4', 'D#4', 'C#4'];
  
  // Initialize Tone.js
  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
    
    return () => {
      synthRef.current?.dispose();
    };
  }, []);
  
  // Convert grid position to note and time
  const gridToNote = useCallback((x: number, y: number): { note: string, time: number } => {
    const containerHeight = window.innerHeight - 35; // Available height for grid content
    const keyHeight = containerHeight / 24; // Dynamic key height
    const keyIndex = Math.floor(y / keyHeight); // Which key space we're in
    const note = pianoKeys[Math.min(keyIndex, pianoKeys.length - 1)];
    
    // Calculate dynamic measure width based on screen width
    const gridWidth = gridRef.current?.clientWidth || 1;
    const measureWidth = gridWidth / 32; // 32 measures total
    const time = (x / measureWidth) * 0.25; // Each measure = 1/4 note (quarter note)
    
    return { note, time };
  }, [pianoKeys]);
  
  // Convert note to grid position
  const noteToGrid = useCallback((note: string, time: number): GridPosition => {
    const containerHeight = window.innerHeight - 35; // Available height for grid content
    const keyHeight = containerHeight / 24; // Dynamic key height
    const keyIndex = pianoKeys.indexOf(note);
    if (keyIndex === -1) return { x: 0, y: 0 }; // Default position if note not found
    
    // Place note in the center of the piano key row
    const y = (keyIndex * keyHeight) + (keyHeight / 2);
    
    // Calculate dynamic measure width based on screen width
    const gridWidth = gridRef.current?.clientWidth || 1;
    const measureWidth = gridWidth / 32; // 32 measures total
    const x = (time / 0.25) * measureWidth; // Each measure = 1/4 note
    
    return { x, y };
  }, [pianoKeys]);
  
  // Handle window resize to automatically update note positions
  useEffect(() => {
    const handleResize = () => {
      // Force re-render of notes with updated positions
      setNotes(prevNotes => 
        prevNotes.map(note => ({
          ...note,
          position: noteToGrid(note.note, note.time)
        }))
      );
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [noteToGrid]);
  
  // Handle grid click to add/select notes
  const handleGridClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left + gridRef.current.scrollLeft; // Account for scroll position
    const y = event.clientY - rect.top;
    
    const { note, time } = gridToNote(x, y);
    
    // Check if clicking on existing note with more precise detection
    const containerHeight = window.innerHeight - 35; // Available height for grid content
    const keyHeight = containerHeight / 24; // Dynamic key height
    const clickedNote = notes.find(n => {
      const pos = noteToGrid(n.note, n.time);
      // Calculate dynamic measure width based on screen width
      const gridWidth = gridRef.current?.clientWidth || 1;
      const measureWidth = gridWidth / 32; // 32 measures total
      const noteWidth = (n.duration / 0.25) * measureWidth; // Duration in measures
      return (
        x >= pos.x && 
        x <= pos.x + noteWidth && 
        Math.abs(pos.y - y) < keyHeight / 2 // Half the height of a key
      );
    });
    
    if (clickedNote) {
      // Select/deselect note
      const newSelected = new Set(selectedNotes);
      if (newSelected.has(clickedNote.id)) {
        newSelected.delete(clickedNote.id);
      } else {
        newSelected.add(clickedNote.id);
      }
      setSelectedNotes(newSelected);
    } else {
      // Add new note
      const newNote: Note = {
        id: Date.now().toString(),
        note,
        time: Math.round(time * 16) / 16, // Snap to 16th notes
        duration: 0.25,
        velocity: 0.8
      };
      
      setNotes(prev => [...prev, newNote]);
    }
  }, [notes, selectedNotes, gridToNote, noteToGrid]);
  
  // Handle key press for piano keys
  const handleKeyPress = useCallback(async (note: string) => {
    if (!synthRef.current) return;
    
    // Start audio context if needed
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    synthRef.current.triggerAttackRelease(note, '8n');
  }, []);
  
  // Delete selected notes
  const deleteSelectedNotes = useCallback(() => {
    setNotes(prev => prev.filter(note => !selectedNotes.has(note.id)));
    setSelectedNotes(new Set());
  }, [selectedNotes]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedNotes();
      }
      if (event.key === 'Escape') {
        setSelectedNotes(new Set());
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNotes]);

  return (
    <div className="midi-editor-fullscreen">
      <div className="piano-roll-container">
        {/* Piano keys on the left */}
        <div className="piano-keys">
          {/* Header spacer to align with grid header */}
          <div style={{ 
            height: '35px', 
            flexShrink: 0,
            background: '#2a2a2a',
            borderBottom: '1px solid #333'
          }}></div>
          {pianoKeys.map((key) => (
            <div
              key={key}
              className={`key-label ${blackKeys.includes(key) ? 'black' : ''} ${
                notes.some(note => note.note === key) ? 'active' : ''
              }`}
              onClick={() => handleKeyPress(key)}
              title={`Click to play ${key}`}
            >
              {key}
            </div>
          ))}
        </div>

        {/* Main grid area */}
        <div className="piano-grid">
          <div className="grid-header">
            {Array.from({ length: 32 }, (_, i) => (
              <div key={i} className={`measure ${(i + 1) % 4 === 0 ? 'measure-end' : ''}`}>
                {/* Empty - just visual bars */}
              </div>
            ))}
          </div>
          
          <div 
            className="grid-content"
            ref={gridRef}
            onClick={handleGridClick}
          >
            <div className="grid-placeholder">
              <div className="sample-notes">
                {notes.map(note => {
                  const position = noteToGrid(note.note, note.time);
                  const isSelected = selectedNotes.has(note.id);
                  
                  // Calculate width based on fixed measure width
                  const measureWidth = 100; // Fixed 100px per measure
                  const noteWidth = (note.duration / 0.25) * measureWidth; // Duration in measures
                  
                  return (
                    <div
                      key={note.id}
                      className={`note sample-note ${isSelected ? 'selected' : ''}`}
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        width: `${noteWidth}px`
                      }}
                      title={`${note.note} - ${note.duration}s`}
                    >
                      {note.note}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIDIEditor;
