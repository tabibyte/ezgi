# Gemini API Integration Setup

## Getting Started

To use the AI music generation features, you'll need to set up the Gemini API:

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key or use an existing one
3. Copy your API key

### 2. Configure Environment Variables

1. In the `frontend` folder, you'll find a `.env` file
2. Replace `your_api_key_here` with your actual Gemini API key:

```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Development Server

```bash
cd frontend
npm run dev
```

## How It Works

### AI Music Generation Features

1. **Generate Melody**: Creates unique melodic note sequences (4-bar loops)
2. **Generate Chords**: Creates harmonic chord progressions (4-bar loops)
3. **Generate Both**: Creates melody and chords together

### Generation Specifications

- **Length**: 4-bar loops (16 beats in 4/4 time)
- **Note Range**: C4 to B5 only (2-octave range optimized for melody/harmony)
- **Uniqueness**: Each generation uses randomization for different results
- **Musical Styles**: Varies between flowing, rhythmic, melodic, harmonic, dynamic, smooth, energetic, and peaceful styles

### Usage

1. Click the floating "Generate" button at the bottom of the screen
2. Choose your generation type from the dropdown menu
3. Wait for the AI to generate music (loading spinner will appear)
4. Generated notes will automatically appear in the MIDI editor

### Fallback Mode

If the API is not configured or fails, the system will use fallback melodies/chords so you can still test the interface.

## Technical Details

### Generated Note Format

The AI generates notes in this format for 4-bar musical loops:
```typescript
{
  id: string;           // Unique identifier
  note: string;         // Note name (C4 to B5 range only)
  time: number;         // Start time in seconds (0-16 for 4 bars)
  duration: number;     // Note duration in seconds
  velocity: number;     // Note velocity (0.6 to 1.0)
}
```

### Note Range Details

- **Melody**: 8-16 notes spanning 4 bars with varied rhythms
- **Chords**: 3-4 chords with 3-4 notes each, lasting 1-4 beats
- **Range**: C4, C#4, D4, D#4, E4, F4, F#4, G4, G#4, A4, A#4, B4, C5, C#5, D5, D#5, E5, F5, F#5, G5, G#5, A5, A#5, B5

### API Integration

- Uses Google's Gemini Pro model
- Sends structured prompts for music generation
- Parses JSON responses into MIDI-compatible note data
- Handles errors gracefully with fallback content

### File Structure

```
src/
├── services/
│   └── geminiService.ts     # Gemini API integration
├── components/
│   ├── MIDIEditor.tsx       # Updated to accept external notes
│   └── FloatingGenerateButton.tsx  # Updated with loading states
└── vite-env.d.ts           # Environment variable types
```

## Customization

You can modify the generation prompts in `src/services/geminiService.ts` to:
- Change the musical style
- Adjust the complexity
- Modify the note ranges
- Add different generation parameters

## Troubleshooting

### API Key Issues
- Make sure your API key is valid and has Gemini Pro access
- Check that the `.env` file is in the `frontend` directory
- Restart the dev server after changing environment variables

### Generation Failures
- The system will automatically fall back to sample music
- Check the browser console for error messages
- Verify your internet connection

### Rate Limiting
- Gemini API has usage limits
- If you hit limits, the fallback system will activate
- Consider implementing request queuing for high usage
