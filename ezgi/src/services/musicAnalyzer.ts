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
    
    insights.push(`Bu parça ${analysis.key} ${analysis.scale} tonunda, ${analysis.scale === 'Major' ? 'tipik olarak parlak ve neşeli duyulur' : 'genellikle melankolik veya içe dönük ruh halleri iletir'}.`);
    
    if (analysis.chords.length > 0) {
      insights.push(`Tespit edilen akorlar: ${analysis.chords.join(', ')}. Bunlar harmonik hareket ve yapı yaratır.`);
    }

    if (analysis.scale === 'Major') {
      insights.push(`Majör diziler şu deseni takip eder: Tam-Tam-Yarım-Tam-Tam-Tam-Yarım adımlar.`);
    } else {
      insights.push(`Minör diziler şu deseni takip eder: Tam-Yarım-Tam-Tam-Yarım-Tam-Tam adımlar.`);
    }

    if (analysis.chords.length >= 3) {
      insights.push(`Çoklu akorlarla bu bir akor ilerleyişi yaratır - müzikte harmonik hareketin omurgası.`);
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
        theory: ['Analiz edilecek nota yok'],
        mood: 'Neutral',
        tempo: 'Medium',
        explanation: 'Müzikal içerik tespit edilmedi.'
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
    let explanation = `🎵 **Müzikal Analiz**\n\n`;
    explanation += `${analysis.key} ${analysis.scale} tonundaki bu ${analysis.tempo.toLowerCase()} tempolu parça `;
    explanation += `${analysis.mood.toLowerCase()} bir atmosfer yaratıyor. `;
    
    if (analysis.chords.length > 0) {
      explanation += `Akor ilerleyişi (${analysis.chords.join(' → ')}) harmonik temel sağlıyor. `;
    }
    
    explanation += `\n\n🎼 **Tür Önerileri**: ${analysis.genres.join(', ')}\n\n`;
    explanation += `💡 **Neden bu türler?** `;
    
    if (analysis.scale === 'Minor') {
      explanation += `Minör tonlar genellikle içe dönük türlerde iyi çalışır. `;
    } else {
      explanation += `Majör tonlar tipik olarak neşeli, erişilebilir türlere uyar. `;
    }
    
    if (analysis.chords.length >= 3) {
      explanation += `Çoklu akorlar caz veya neo-soul tarzları için uygun karmaşıklık önerir.`;
    }

    return explanation;
  }
}

export const musicAnalyzer = new MusicAnalyzer();
