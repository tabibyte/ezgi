import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import PlaybackControls from './PlaybackControls';

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
  const [notes, setNotes] = useState<Note[]>([]);
  
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizedNote, setResizedNote] = useState<string | null>(null);
  const [justFinishedDrag, setJustFinishedDrag] = useState(false);
  
  // Selection box states
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  
  const gridRef = useRef<HTMLDivElement>(null);
  const samplerRef = useRef<Tone.Sampler | null>(null);
  
  // Piano key mappings (2 octaves: C4-B5)
  const pianoKeys = [
    'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 
    'E5', 'D#5', 'D5', 'C#5', 'C5', 'B4', 'A#4', 'A4', 
    'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4'
  ];
  
  const blackKeys = ['A#5', 'G#5', 'F#5', 'D#5', 'C#5', 'A#4', 'G#4', 'F#4', 'D#4', 'C#4'];
  
  // Create sample mapping for all piano keys
  const createSampleMap = () => {
    const sampleMap: { [key: string]: string } = {};
    pianoKeys.forEach(note => {
      // URL encode the note name to handle # characters properly
      const encodedNote = encodeURIComponent(note);
      sampleMap[note] = `/samples/${encodedNote}.wav`;
    });
    return sampleMap;
  };
  
  // Initialize Tone.js
  useEffect(() => {
    console.log('Initializing Tone.js sampler...');
    console.log('Sample map:', createSampleMap());
    
    samplerRef.current = new Tone.Sampler({
      urls: createSampleMap(),
      onload: () => {
        console.log('Piano samples loaded successfully');
      },
      onerror: (error) => {
        console.error('Error loading samples:', error);
      }
    }).toDestination();
    
    return () => {
      samplerRef.current?.dispose();
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
  
  // Handle note mouse down for dragging
  const handleNoteMouseDown = useCallback((event: React.MouseEvent, noteId: string) => {
    event.stopPropagation(); // Prevent grid click
    
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Handle selection/deselection if Ctrl is held
    if (event.ctrlKey) {
      const newSelected = new Set(selectedNotes);
      if (selectedNotes.has(noteId)) {
        newSelected.delete(noteId);
        setSelectedNotes(newSelected);
        // If we deselected the note, don't start dragging
        return;
      } else {
        newSelected.add(noteId);
        setSelectedNotes(newSelected);
      }
    } else {
      // If not holding Ctrl and the note is already selected among multiple notes,
      // keep the current selection to allow multi-note dragging
      if (!selectedNotes.has(noteId)) {
        // Only change selection if the note wasn't already selected
        setSelectedNotes(new Set([noteId]));
      }
      // If the note is already selected, keep the current selection unchanged
    }
    
    const notePosition = noteToGrid(note.note, note.time);
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    setIsDragging(true);
    setDraggedNote(noteId);
    setDragOffset({
      x: mouseX - notePosition.x,
      y: mouseY - notePosition.y
    });
  }, [notes, selectedNotes, noteToGrid]);

  // Handle resize handle mouse down
  const handleResizeMouseDown = useCallback((event: React.MouseEvent, noteId: string) => {
    event.stopPropagation(); // Prevent grid click and note drag
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    setIsResizing(true);
    setResizedNote(noteId);
    
    // Select the note being resized if not already selected
    if (!selectedNotes.has(noteId)) {
      setSelectedNotes(new Set([noteId]));
    }
  }, [notes, selectedNotes]);

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    if (isDragging && draggedNote) {
      // Handle note dragging
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;
      
      // Convert back to note and time
      const { note, time } = gridToNote(newX, newY);
      
      // Get the current note to check its duration
      const currentNote = notes.find(n => n.id === draggedNote);
      if (!currentNote) return;
      
      // Calculate the change in position using note indices
      const currentNoteIndex = pianoKeys.indexOf(currentNote.note);
      const newNoteIndex = pianoKeys.indexOf(note);
      const deltaNote = newNoteIndex - currentNoteIndex;
      const deltaTime = time - currentNote.time;
      
      // If multiple notes are selected, move them all together
      if (selectedNotes.has(draggedNote) && selectedNotes.size > 1) {
        setNotes(prevNotes => 
          prevNotes.map(n => {
            if (selectedNotes.has(n.id)) {
              const currentIndex = pianoKeys.indexOf(n.note);
              const newIndex = currentIndex + deltaNote;
              const newTime = n.time + deltaTime;
              
              // Clamp each note to valid bounds
              const clampedIndex = Math.max(0, Math.min(pianoKeys.length - 1, newIndex));
              const clampedNote = pianoKeys[clampedIndex];
              const maxStartTime = 8 - n.duration;
              const clampedTime = Math.max(0, Math.min(maxStartTime, newTime));
              const snappedTime = Math.round(clampedTime * 16) / 16;
              
              return { ...n, note: clampedNote, time: snappedTime };
            }
            return n;
          })
        );
      } else {
        // Single note dragging (original behavior)
        const maxStartTime = 8 - currentNote.duration;
        const clampedTime = Math.max(0, Math.min(maxStartTime, time));
        const snappedTime = Math.round(clampedTime * 16) / 16;
        
        setNotes(prevNotes => 
          prevNotes.map(n => 
            n.id === draggedNote 
              ? { ...n, note, time: snappedTime }
              : n
          )
        );
      }
    } else if (isResizing && resizedNote) {
      // Handle note resizing
      const note = notes.find(n => n.id === resizedNote);
      if (!note) return;
      
      const notePosition = noteToGrid(note.note, note.time);
      const gridWidth = gridRef.current?.clientWidth || 1;
      const measureWidth = gridWidth / 32; // 32 measures total
      
      // Calculate new duration based on mouse position
      const newWidth = mouseX - notePosition.x;
      const newDuration = Math.max(0.0625, (newWidth / measureWidth) * 0.25); // Minimum 1/16 note
      
      // Calculate the duration change ratio
      const durationRatio = newDuration / note.duration;
      
      // If multiple notes are selected, resize them all proportionally
      if (selectedNotes.has(resizedNote) && selectedNotes.size > 1) {
        setNotes(prevNotes => 
          prevNotes.map(n => {
            if (selectedNotes.has(n.id)) {
              const scaledDuration = n.duration * durationRatio;
              const minDuration = 0.0625; // Minimum 1/16 note
              const maxDuration = 8 - n.time; // Don't extend beyond grid
              const clampedDuration = Math.max(minDuration, Math.min(maxDuration, scaledDuration));
              const snappedDuration = Math.round(clampedDuration * 16) / 16;
              
              return { ...n, duration: snappedDuration };
            }
            return n;
          })
        );
      } else {
        // Single note resizing (original behavior)
        const maxDuration = 8 - note.time;
        const clampedDuration = Math.min(newDuration, maxDuration);
        const snappedDuration = Math.round(clampedDuration * 16) / 16;
        
        setNotes(prevNotes => 
          prevNotes.map(n => 
            n.id === resizedNote 
              ? { ...n, duration: snappedDuration }
              : n
          )
        );
      }
    } else if (isSelecting) {
      // Handle selection box dragging
      setSelectionEnd({ x: mouseX, y: mouseY });
    }
  }, [isDragging, draggedNote, dragOffset, gridToNote, isResizing, resizedNote, notes, noteToGrid, isSelecting, selectedNotes]);

  // Handle mouse up to end dragging or resizing
  const handleMouseUp = useCallback(() => {
    const wasDragging = isDragging;
    const wasResizing = isResizing;
    const wasSelecting = isSelecting;
    
    if (wasSelecting) {
      // Complete selection box operation
      const selectionRect = {
        left: Math.min(selectionStart.x, selectionEnd.x),
        right: Math.max(selectionStart.x, selectionEnd.x),
        top: Math.min(selectionStart.y, selectionEnd.y),
        bottom: Math.max(selectionStart.y, selectionEnd.y)
      };
      
      // Find notes within selection rectangle
      const containerHeight = window.innerHeight - 35;
      const keyHeight = containerHeight / 24;
      const gridWidth = gridRef.current?.clientWidth || 1;
      const measureWidth = gridWidth / 32;
      
      const selectedInRect = notes.filter(note => {
        const pos = noteToGrid(note.note, note.time);
        const noteWidth = (note.duration / 0.25) * measureWidth;
        
        // Check if note overlaps with selection rectangle
        const noteLeft = pos.x;
        const noteRight = pos.x + noteWidth;
        const noteTop = pos.y - keyHeight / 2;
        const noteBottom = pos.y + keyHeight / 2;
        
        return (
          noteRight >= selectionRect.left &&
          noteLeft <= selectionRect.right &&
          noteBottom >= selectionRect.top &&
          noteTop <= selectionRect.bottom
        );
      });
      
      // Update selected notes
      const newSelected = new Set(selectedNotes);
      selectedInRect.forEach(note => newSelected.add(note.id));
      setSelectedNotes(newSelected);
    }
    
    setIsDragging(false);
    setDraggedNote(null);
    setDragOffset({ x: 0, y: 0 });
    setIsResizing(false);
    setResizedNote(null);
    setIsSelecting(false);
    setSelectionStart({ x: 0, y: 0 });
    setSelectionEnd({ x: 0, y: 0 });
    
    // Set flag to prevent immediate grid click after drag/resize/select
    if (wasDragging || wasResizing || wasSelecting) {
      setJustFinishedDrag(true);
      // Clear the flag after a short delay
      setTimeout(() => {
        setJustFinishedDrag(false);
      }, 50);
    }
  }, [isDragging, isResizing, isSelecting, selectionStart, selectionEnd, notes, noteToGrid, selectedNotes]);

  // Handle grid click to add/select notes
  const handleGridClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current || isDragging || isResizing || justFinishedDrag) return; // Don't add notes while dragging, resizing, or just after
    
    // Skip if we're in selection mode (Ctrl was held)
    if (isSelecting) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left + gridRef.current.scrollLeft; // Account for scroll position
    const y = event.clientY - rect.top;
    
    const { note, time } = gridToNote(x, y);
    
    // Check if clicking on existing note with consistent calculation
    const containerHeight = window.innerHeight - 35; // Available height for grid content
    const keyHeight = containerHeight / 24; // Dynamic key height
    const gridWidth = gridRef.current?.clientWidth || 1;
    const measureWidth = gridWidth / 32; // 32 measures total - use dynamic width consistently
    
    const clickedNote = notes.find(n => {
      const pos = noteToGrid(n.note, n.time);
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
      if (selectedNotes.has(clickedNote.id)) {
        newSelected.delete(clickedNote.id);
      } else {
        newSelected.add(clickedNote.id);
      }
      setSelectedNotes(newSelected);
    } else {
      // Add new note only if no existing note was found and not during/after selection
      if (!isSelecting) {
        // Clamp time to valid bounds, accounting for default note duration (0.25s)
        const defaultDuration = 0.25;
        const maxStartTime = 8 - defaultDuration; // Ensure note doesn't extend beyond 8 seconds
        const clampedTime = Math.max(0, Math.min(maxStartTime, time));
        const snappedTime = Math.round(clampedTime * 16) / 16; // Snap to 16th notes
        
        const newNote: Note = {
          id: Date.now().toString(),
          note,
          time: snappedTime,
          duration: defaultDuration,
          velocity: 0.8
        };
        
        setNotes(prev => [...prev, newNote]);
        
        // Automatically select the newly created note
        setSelectedNotes(new Set([newNote.id]));
      }
    }
  }, [notes, selectedNotes, gridToNote, noteToGrid, isDragging, isResizing, justFinishedDrag, isSelecting]);
  
  // Handle grid mouse down for immediate selection start
  const handleGridMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current || isDragging || isResizing || justFinishedDrag) return;
    
    // Check if Ctrl is held for selection box - start immediately on mouse down
    if (event.ctrlKey) {
      const rect = gridRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left + gridRef.current.scrollLeft;
      const y = event.clientY - rect.top;
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
      event.preventDefault(); // Prevent default behavior
    }
  }, [isDragging, isResizing, justFinishedDrag]);
  
  // Handle key press for piano keys
  const handleKeyPress = useCallback(async (note: string) => {
    try {
      console.log(`Attempting to play note: ${note}`);
      
      if (!samplerRef.current) {
        console.error('Sampler not initialized');
        return;
      }
      
      // Start audio context if needed
      if (Tone.context.state !== 'running') {
        console.log('Starting audio context...');
        await Tone.start();
        console.log('Audio context started');
      }
      
      console.log('Triggering note...');
      samplerRef.current.triggerAttackRelease(note, '8n');
      console.log(`Note ${note} triggered successfully`);
    } catch (error) {
      console.error('Error playing note:', error);
    }
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
      {/* Floating Playback Controls */}
      <PlaybackControls notes={notes} sampler={samplerRef.current} />
      
      <div className="piano-roll-container">
        {/* Piano keys on the left */}
        <div className="piano-keys">
          {/* Header spacer with ezgi logo */}
          <div className="piano-header-logo">
            <span className="ezgi-logo">ezgi</span>
          </div>
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
            onMouseDown={handleGridMouseDown}
            onClick={handleGridClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // End dragging if mouse leaves grid
          >
            <div className="grid-placeholder">
              <div className="sample-notes">
                {notes.map(note => {
                  const position = noteToGrid(note.note, note.time);
                  const isSelected = selectedNotes.has(note.id);
                  
                  // Calculate width based on dynamic measure width (consistent with click detection)
                  const gridWidth = gridRef.current?.clientWidth || 1;
                  const measureWidth = gridWidth / 32; // 32 measures total
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
                      onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
                    >
                      {note.note}
                      {/* Resize handle */}
                      <div
                        className="note-resize-handle"
                        onMouseDown={(e) => handleResizeMouseDown(e, note.id)}
                        title="Drag to resize note duration"
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Selection box */}
              {isSelecting && (
                <div
                  className="selection-box"
                  style={{
                    left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                    top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                    width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
                    height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
                    position: 'absolute',
                    border: '1px dashed #007acc',
                    backgroundColor: 'rgba(0, 122, 204, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIDIEditor;
