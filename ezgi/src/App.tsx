import './App.css';
import { useState } from 'react';
import MIDIEditor from './components/MIDIEditor';
import FloatingGenerateButton from './components/FloatingGenerateButton';
import MinimalChatBot from './components/MinimalChatBot';
import { geminiService, GeneratedNote } from './services/geminiService';

function App() {
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bpm, setBpm] = useState(120); // Add BPM state

  const handleGenerate = async (type: 'melody' | 'chords' | 'both' | 'clear') => {
    console.log('🎹 Generate button clicked:', type);
    
    // Handle clear action
    if (type === 'clear') {
      console.log('🗑️ Clearing all notes');
      setGeneratedNotes([]);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      console.log('🔄 Starting generation process...');
      
      if (type === 'both') {
        console.log('🎵 Generating both melody and chords...');
        // Generate melody first, then chords
        const melodyResult = await geminiService.generateMusic({ type: 'melody' });
        const chordsResult = await geminiService.generateMusic({ type: 'chords' });
        
        const combinedNotes = [...melodyResult.notes, ...chordsResult.notes];
        console.log('✨ Combined notes generated:', combinedNotes);
        setGeneratedNotes(combinedNotes);
        
        console.log('Generated melody + chords:', combinedNotes);
      } else {
        console.log(`🎼 Generating ${type}...`);
        const result = await geminiService.generateMusic({ type });
        console.log('✅ Generation successful:', result);
        setGeneratedNotes(result.notes);
        
        console.log(`Generated ${type}:`, result.notes);
        console.log('Description:', result.description);
      }
    } catch (error) {
      console.error('❌ Generation failed, using fallback:', error);
      
      // Use fallback when API fails
      if (type === 'both') {
        const melodyFallback = geminiService.generateFallback('melody');
        const chordsFallback = geminiService.generateFallback('chords');
        const combinedNotes = [...melodyFallback.notes, ...chordsFallback.notes];
        console.log('🔄 Using fallback for both:', combinedNotes);
        setGeneratedNotes(combinedNotes);
      } else {
        const fallback = geminiService.generateFallback(type);
        console.log(`🔄 Using fallback for ${type}:`, fallback.notes);
        setGeneratedNotes(fallback.notes);
      }
    } finally {
      setIsGenerating(false);
      console.log('🏁 Generation process completed');
    }
  };

  return (
    <div className="App">
      {/* Full-screen MIDI Editor background */}
      <MIDIEditor 
        externalNotes={generatedNotes}
        replaceNotes={true}
        bpm={bpm}
        onBpmChange={setBpm}
      />
      
      {/* Floating Generate Button */}
      <FloatingGenerateButton 
        onGenerate={handleGenerate}
        isLoading={isGenerating}
      />
      
      {/* Minimal AI Chatbot */}
      <MinimalChatBot 
        generatedNotes={generatedNotes} 
        bpm={bpm}
      />
      
      {/* Floating controls and chat boxes - temporarily hidden */}
      {/* <FloatingControls /> */}
      {/* <FloatingChat /> */}
    </div>
  );
}

export default App;
