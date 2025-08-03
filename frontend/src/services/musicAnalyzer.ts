export interface MusicAnalysis {
  key: string;
  scale: string;
  chords: string[];
  genres: string[];
  theory: string[];
  mood: string;
  tempo: string;
  explanation: string;
}

export interface AnalyzedNote {
  note: string;
  time: number;
  duration: number;
  velocity: number;
}

class MusicAnalyzer {
  private noteToNumber(note: string): number {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
      'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const noteName = note.replace(/\d/, '');
    return noteMap[noteName] || 0;
  }

  private detectKey(notes: AnalyzedNote[]): { key: string; scale: string } {
    const noteFreq: { [key: number]: number } = {};
    
    // Count note frequencies
    notes.forEach(note => {
      const noteNum = this.noteToNumber(note.note);
      noteFreq[noteNum] = (noteFreq[noteNum] || 0) + 1;
    });

    // Simple key detection based on most frequent notes
    const sortedNotes = Object.entries(noteFreq)
      .sort(([,a], [,b]) => b - a)
      .map(([note]) => parseInt(note));

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const mostFrequent = sortedNotes[0];
    
    // Basic major/minor detection
    const majorPattern = [0, 2, 4, 5, 7, 9, 11];
    const minorPattern = [0, 2, 3, 5, 7, 8, 10];
    
    let majorMatches = 0;
    let minorMatches = 0;
    
    sortedNotes.slice(0, 5).forEach(note => {
      const interval = (note - mostFrequent + 12) % 12;
      if (majorPattern.includes(interval)) majorMatches++;
      if (minorPattern.includes(interval)) minorMatches++;
    });

    const scale = majorMatches >= minorMatches ? 'Major' : 'Minor';
    return { key: noteNames[mostFrequent], scale };
  }

  private detectChords(notes: AnalyzedNote[]): string[] {
    const chords: string[] = [];
    const timeGroups: { [key: number]: AnalyzedNote[] } = {};
    
    // Group notes by time (for chord detection)
    notes.forEach(note => {
      const timeKey = Math.floor(note.time * 2) / 2; // Round to nearest 0.5 seconds
      if (!timeGroups[timeKey]) timeGroups[timeKey] = [];
      timeGroups[timeKey].push(note);
    });

    // Analyze each time group for chords
    Object.values(timeGroups).forEach(group => {
      if (group.length >= 3) {
        const noteNumbers = group.map(n => this.noteToNumber(n.note)).sort();
        const root = noteNumbers[0];
        const intervals = noteNumbers.map(n => (n - root + 12) % 12).sort();
        
        // Basic chord detection
        if (intervals.includes(0) && intervals.includes(4) && intervals.includes(7)) {
          chords.push(`${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root]} Major`);
        } else if (intervals.includes(0) && intervals.includes(3) && intervals.includes(7)) {
          chords.push(`${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root]} Minor`);
        }
      }
    });

    return [...new Set(chords)]; // Remove duplicates
  }

  private suggestGenres(analysis: { key: string; scale: string; chords: string[] }): string[] {
    const genres: string[] = [];
    
    if (analysis.scale === 'Minor') {
      genres.push('Blues', 'Jazz', 'Ambient', 'Alternative Rock');
    } else {
      genres.push('Pop', 'Folk', 'Country', 'Classical');
    }

    if (analysis.chords.length >= 3) {
      genres.push('Jazz', 'Neo-Soul', 'R&B');
    }

    // Key-based suggestions
    const darkKeys = ['D#', 'G#', 'A#', 'F#'];
    const brightKeys = ['C', 'G', 'D', 'F'];
    
    if (darkKeys.includes(analysis.key)) {
      genres.push('Electronic', 'Synthwave', 'Dubstep');
    }
    
    if (brightKeys.includes(analysis.key)) {
      genres.push('Indie Pop', 'Acoustic', 'Singer-Songwriter');
    }

    return [...new Set(genres)].slice(0, 4); // Return top 4 unique genres
  }

  private generateTheoryInsights(analysis: { key: string; scale: string; chords: string[] }): string[] {
    const insights: string[] = [];
    
    insights.push(`This piece is in ${analysis.key} ${analysis.scale}, which ${analysis.scale === 'Major' ? 'typically sounds bright and uplifting' : 'often conveys melancholy or introspective moods'}.`);
    
    if (analysis.chords.length > 0) {
      insights.push(`Detected chords: ${analysis.chords.join(', ')}. These create harmonic movement and structure.`);
    }

    if (analysis.scale === 'Major') {
      insights.push(`Major scales follow the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half steps.`);
    } else {
      insights.push(`Minor scales follow the pattern: Whole-Half-Whole-Whole-Half-Whole-Whole steps.`);
    }

    if (analysis.chords.length >= 3) {
      insights.push(`With multiple chords, this creates a chord progression - the backbone of harmonic movement in music.`);
    }

    return insights;
  }

  analyzeMusic(notes: AnalyzedNote[]): MusicAnalysis {
    if (notes.length === 0) {
      return {
        key: 'C',
        scale: 'Major',
        chords: [],
        genres: ['Ambient'],
        theory: ['No notes to analyze'],
        mood: 'Neutral',
        tempo: 'Medium',
        explanation: 'No musical content detected.'
      };
    }

    const keyScale = this.detectKey(notes);
    const chords = this.detectChords(notes);
    const genres = this.suggestGenres({ ...keyScale, chords });
    const theory = this.generateTheoryInsights({ ...keyScale, chords });

    // Analyze tempo based on note timing
    const noteDurations = notes.map(n => n.duration);
    const avgDuration = noteDurations.reduce((a, b) => a + b, 0) / noteDurations.length;
    const tempo = avgDuration < 0.5 ? 'Fast' : avgDuration > 1.0 ? 'Slow' : 'Medium';

    // Determine mood
    const mood = keyScale.scale === 'Minor' ? 
      (chords.length > 2 ? 'Melancholic but Rich' : 'Contemplative') :
      (chords.length > 2 ? 'Uplifting and Complex' : 'Bright and Simple');

    const explanation = this.generateExplanation({ 
      key: keyScale.key,
      scale: keyScale.scale,
      chords, 
      genres, 
      theory,
      mood, 
      tempo 
    } as MusicAnalysis);

    return {
      key: keyScale.key,
      scale: keyScale.scale,
      chords,
      genres,
      theory,
      mood,
      tempo,
      explanation
    };
  }

  private generateExplanation(analysis: MusicAnalysis): string {
    let explanation = `🎵 **Musical Analysis**\n\n`;
    explanation += `This ${analysis.tempo.toLowerCase()}-paced piece in ${analysis.key} ${analysis.scale} `;
    explanation += `creates a ${analysis.mood.toLowerCase()} atmosphere. `;
    
    if (analysis.chords.length > 0) {
      explanation += `The chord progression (${analysis.chords.join(' → ')}) provides harmonic foundation. `;
    }
    
    explanation += `\n\n🎼 **Genre Suggestions**: ${analysis.genres.join(', ')}\n\n`;
    explanation += `💡 **Why these genres?** `;
    
    if (analysis.scale === 'Minor') {
      explanation += `Minor keys often work well in introspective genres. `;
    } else {
      explanation += `Major keys typically suit upbeat, accessible genres. `;
    }
    
    if (analysis.chords.length >= 3) {
      explanation += `Multiple chords suggest complexity suitable for jazz or neo-soul styles.`;
    }

    return explanation;
  }
}

export const musicAnalyzer = new MusicAnalyzer();
