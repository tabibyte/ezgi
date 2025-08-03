import axios from 'axios';

export interface GeneratedNote {
  id: string;
  note: string;
  time: number;
  duration: number;
  velocity: number;
}

export interface GenerationRequest {
  type: 'melody' | 'chords';
  context?: {
    key?: string;
    bpm?: number;
    existingNotes?: GeneratedNote[];
  };
}

export interface GenerationResponse {
  notes: GeneratedNote[];
  description: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Gemini API Key loaded:', this.apiKey ? 'Yes (length: ' + this.apiKey.length + ')' : 'No');
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
    }
    
    // Test API on initialization
    if (this.apiKey) {
      this.testAPI();
    }
  }

  private async testAPI() {
    try {
      console.log('🧪 Testing Gemini API connection...');
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: 'Hello, respond with just "API working"'
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log('✅ API test successful:', response.data);
    } catch (error) {
      console.error('❌ API test failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('🌐 API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
    }
  }

  private createPrompt(request: GenerationRequest): string {
    const { type, context } = request;
    
    // Add randomization elements for unique generation
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);
    const musicalStyles = ['flowing', 'rhythmic', 'melodic', 'harmonic', 'dynamic', 'smooth', 'energetic', 'peaceful'];
    const randomStyle = musicalStyles[Math.floor(Math.random() * musicalStyles.length)];
    
    let prompt = `You are a music composition AI. Generate a unique ${randomStyle} ${type} for a MIDI composition.

Session: ${timestamp}-${randomSeed} (use this for variation)
`;
    
    if (context?.key) {
      prompt += `Key: ${context.key}\n`;
    } else {
      prompt += `Key: C major\n`;
    }
    
    if (context?.bpm) {
      prompt += `BPM: ${context.bpm}\n`;
    } else {
      prompt += `BPM: 120\n`;
    }
    
    if (type === 'melody') {
      prompt += `Create a unique ${randomStyle} melody:
- 4-bar loop (16 beats total in 4/4 time)
- Use notes ONLY between C4 and B5 (no notes below C4 or above B5)
- 8-16 notes total for a complete melodic phrase
- Vary note durations (mix of quarter, eighth, sixteenth notes)
- Make it musically interesting and ${randomStyle}
`;
    } else {
      prompt += `Create a unique ${randomStyle} chord progression:
- 4-bar loop (16 beats total in 4/4 time)
- Use notes ONLY between C4 and B5 (no notes below C4 or above B5)
- 3-4 chords total, each lasting 1-4 beats
- Use 3-4 notes per chord
- Create harmonic movement and ${randomStyle} progression
`;
    }
    
    prompt += `
IMPORTANT: Return ONLY valid JSON in this exact format (no additional text):

{
  "notes": [
    {
      "id": "note_1",
      "note": "C4",
      "time": 0,
      "duration": 0.5,
      "velocity": 0.8
    }
  ],
  "description": "Brief description of the generated ${type}"
}

STRICT Requirements:
- Notes MUST be between C4 and B5 only: C4, C#4, D4, D#4, E4, F4, F#4, G4, G#4, A4, A#4, B4, C5, C#5, D5, D#5, E5, F5, F#5, G5, G#5, A5, A#5, B5
- Time span: 0 to 16 seconds (4 bars × 4 beats × 1 second per beat at 120 BPM)
- Duration in seconds (0.25=sixteenth, 0.5=eighth, 1.0=quarter, 2.0=half note)
- Velocity between 0.6 and 1.0 for good audibility
- For chords: multiple notes at same time value
- Generate unique ${randomStyle} ${type} - be creative and vary from previous generations`;

    return prompt;
  }

  async generateMusic(request: GenerationRequest): Promise<GenerationResponse> {
    console.log('🎵 Starting music generation:', request);
    
    if (!this.apiKey) {
      console.log('❌ No API key - using fallback');
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = this.createPrompt(request);
      console.log('📝 Generated prompt:', prompt.substring(0, 200) + '...');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };
      
      console.log('🚀 Sending request to Gemini API...');
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ Received response from Gemini API:', response.status);
      console.log('📦 Response data:', response.data);

      const generatedText = response.data.candidates[0].content.parts[0].text;
      console.log('📝 Generated text:', generatedText);
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No valid JSON found in response');
        throw new Error('No valid JSON found in response');
      }

      console.log('🔍 Extracted JSON:', jsonMatch[0]);
      const result = JSON.parse(jsonMatch[0]);
      
      // Add unique IDs if not provided
      result.notes = result.notes.map((note: any, index: number) => ({
        ...note,
        id: note.id || `generated-${Date.now()}-${index}`
      }));

      console.log('🎼 Final generated notes:', result);
      return result;
    } catch (error) {
      console.error('❌ Error generating music:', error);
      if (axios.isAxiosError(error)) {
        console.error('🌐 API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw new Error('Failed to generate music. Please try again.');
    }
  }

  // Generate a fallback response when API is not available
  generateFallback(type: 'melody' | 'chords'): GenerationResponse {
    const baseTime = Date.now();
    const randomVariation = Math.floor(Math.random() * 3); // 3 different variations
    
    if (type === 'melody') {
      // Generate different melody variations
      const melodyVariations = [
        // Variation 1: C Major scale melody
        [
          { note: 'C4', time: 0, duration: 1.0, velocity: 0.8 },
          { note: 'D4', time: 1.0, duration: 0.5, velocity: 0.7 },
          { note: 'E4', time: 1.5, duration: 0.5, velocity: 0.8 },
          { note: 'F4', time: 2.0, duration: 1.0, velocity: 0.7 },
          { note: 'G4', time: 3.0, duration: 0.5, velocity: 0.9 },
          { note: 'A4', time: 3.5, duration: 0.5, velocity: 0.8 },
          { note: 'B4', time: 4.0, duration: 1.0, velocity: 0.8 },
          { note: 'C5', time: 5.0, duration: 1.0, velocity: 0.9 },
          { note: 'G4', time: 6.0, duration: 1.0, velocity: 0.8 },
          { note: 'C4', time: 7.0, duration: 1.0, velocity: 0.8 }
        ],
        // Variation 2: More rhythmic melody
        [
          { note: 'E4', time: 0, duration: 0.5, velocity: 0.8 },
          { note: 'G4', time: 0.5, duration: 0.5, velocity: 0.8 },
          { note: 'C5', time: 1.0, duration: 1.0, velocity: 0.9 },
          { note: 'A4', time: 2.0, duration: 0.5, velocity: 0.7 },
          { note: 'F4', time: 2.5, duration: 0.5, velocity: 0.7 },
          { note: 'D4', time: 3.0, duration: 1.0, velocity: 0.8 },
          { note: 'G4', time: 4.0, duration: 0.5, velocity: 0.8 },
          { note: 'B4', time: 4.5, duration: 0.5, velocity: 0.8 },
          { note: 'A4', time: 5.0, duration: 1.0, velocity: 0.9 },
          { note: 'E4', time: 6.0, duration: 1.0, velocity: 0.7 },
          { note: 'C4', time: 7.0, duration: 1.0, velocity: 0.8 }
        ],
        // Variation 3: Flowing melody
        [
          { note: 'F4', time: 0, duration: 0.75, velocity: 0.8 },
          { note: 'A4', time: 0.75, duration: 0.75, velocity: 0.8 },
          { note: 'C5', time: 1.5, duration: 0.5, velocity: 0.9 },
          { note: 'B4', time: 2.0, duration: 0.5, velocity: 0.8 },
          { note: 'G4', time: 2.5, duration: 0.75, velocity: 0.7 },
          { note: 'E4', time: 3.25, duration: 0.75, velocity: 0.7 },
          { note: 'D4', time: 4.0, duration: 1.0, velocity: 0.8 },
          { note: 'F4', time: 5.0, duration: 0.5, velocity: 0.8 },
          { note: 'A4', time: 5.5, duration: 0.5, velocity: 0.8 },
          { note: 'G4', time: 6.0, duration: 2.0, velocity: 0.9 }
        ]
      ];
      
      const selectedMelody = melodyVariations[randomVariation];
      const notes = selectedMelody.map((note, index) => ({
        id: `fallback-${baseTime}-${index}`,
        ...note
      }));
      
      return {
        notes,
        description: `4-bar C major melody variation ${randomVariation + 1} (fallback)`
      };
    } else {
      // Generate different chord variations
      const chordVariations = [
        // Variation 1: I-V-vi-IV progression
        [
          // C major chord (I)
          { note: 'C4', time: 0, duration: 4.0, velocity: 0.7 },
          { note: 'E4', time: 0, duration: 4.0, velocity: 0.7 },
          { note: 'G4', time: 0, duration: 4.0, velocity: 0.7 },
          // G major chord (V)
          { note: 'G4', time: 4.0, duration: 4.0, velocity: 0.7 },
          { note: 'B4', time: 4.0, duration: 4.0, velocity: 0.7 },
          { note: 'D5', time: 4.0, duration: 4.0, velocity: 0.7 },
          // A minor chord (vi)
          { note: 'A4', time: 8.0, duration: 4.0, velocity: 0.7 },
          { note: 'C5', time: 8.0, duration: 4.0, velocity: 0.7 },
          { note: 'E5', time: 8.0, duration: 4.0, velocity: 0.7 },
          // F major chord (IV)
          { note: 'F4', time: 12.0, duration: 4.0, velocity: 0.7 },
          { note: 'A4', time: 12.0, duration: 4.0, velocity: 0.7 },
          { note: 'C5', time: 12.0, duration: 4.0, velocity: 0.7 }
        ],
        // Variation 2: vi-IV-I-V progression
        [
          // A minor chord (vi)
          { note: 'A4', time: 0, duration: 4.0, velocity: 0.7 },
          { note: 'C5', time: 0, duration: 4.0, velocity: 0.7 },
          { note: 'E5', time: 0, duration: 4.0, velocity: 0.7 },
          // F major chord (IV)
          { note: 'F4', time: 4.0, duration: 4.0, velocity: 0.7 },
          { note: 'A4', time: 4.0, duration: 4.0, velocity: 0.7 },
          { note: 'C5', time: 4.0, duration: 4.0, velocity: 0.7 },
          // C major chord (I)
          { note: 'C4', time: 8.0, duration: 4.0, velocity: 0.7 },
          { note: 'E4', time: 8.0, duration: 4.0, velocity: 0.7 },
          { note: 'G4', time: 8.0, duration: 4.0, velocity: 0.7 },
          // G major chord (V)
          { note: 'G4', time: 12.0, duration: 4.0, velocity: 0.7 },
          { note: 'B4', time: 12.0, duration: 4.0, velocity: 0.7 },
          { note: 'D5', time: 12.0, duration: 4.0, velocity: 0.7 }
        ],
        // Variation 3: I-vi-IV-V progression
        [
          // C major chord (I)
          { note: 'C4', time: 0, duration: 4.0, velocity: 0.7 },
          { note: 'E4', time: 0, duration: 4.0, velocity: 0.7 },
          { note: 'G4', time: 0, duration: 4.0, velocity: 0.7 },
          // A minor chord (vi)
          { note: 'A4', time: 4.0, duration: 4.0, velocity: 0.7 },
          { note: 'C5', time: 4.0, duration: 4.0, velocity: 0.7 },
          { note: 'E5', time: 4.0, duration: 4.0, velocity: 0.7 },
          // F major chord (IV)
          { note: 'F4', time: 8.0, duration: 4.0, velocity: 0.7 },
          { note: 'A4', time: 8.0, duration: 4.0, velocity: 0.7 },
          { note: 'C5', time: 8.0, duration: 4.0, velocity: 0.7 },
          // G major chord (V)
          { note: 'G4', time: 12.0, duration: 4.0, velocity: 0.7 },
          { note: 'B4', time: 12.0, duration: 4.0, velocity: 0.7 },
          { note: 'D5', time: 12.0, duration: 4.0, velocity: 0.7 }
        ]
      ];
      
      const selectedChords = chordVariations[randomVariation];
      const notes = selectedChords.map((note, index) => ({
        id: `fallback-${baseTime}-${index}`,
        ...note
      }));
      
      return {
        notes,
        description: `4-bar chord progression variation ${randomVariation + 1} (fallback)`
      };
    }
  }
}

export const geminiService = new GeminiService();
