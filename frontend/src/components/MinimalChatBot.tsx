import React, { useState, useRef, useEffect } from 'react';
import { musicAnalyzer, AnalyzedNote } from '../services/musicAnalyzer';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isAnalysis?: boolean;
}

interface MinimalChatBotProps {
  generatedNotes?: AnalyzedNote[];
  bpm?: number;
}

const MinimalChatBot: React.FC<MinimalChatBotProps> = ({ generatedNotes, bpm = 120 }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I can help with music theory and MIDI generation. Generate some music and I\'ll analyze it for you!',
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get context from recent analysis and current notes
  const getConversationContext = (): string => {
    let context = 'You are a music theory expert and AI assistant helping users learn about music composition, theory, and analysis. ';
    
    if (generatedNotes && generatedNotes.length > 0) {
      const analysis = musicAnalyzer.analyzeMusic(generatedNotes);
      
      // Add detailed musical context
      context += `\n\n=== CURRENT MUSICAL CONTEXT ===`;
      context += `\nTempo: ${bpm} BPM`;
      context += `\nKey: ${analysis.key} ${analysis.scale}`;
      context += `\nMood: ${analysis.mood}`;
      context += `\nSuggested genres: ${analysis.genres.join(', ')}`;
      
      if (analysis.chords.length > 0) {
        context += `\nDetected chords: ${analysis.chords.join(', ')}`;
      }
      
      // Add detailed note information
      context += `\n\n=== NOTE SEQUENCE (${generatedNotes.length} notes) ===`;
      generatedNotes.forEach((note, index) => {
        const timeInBeats = (note.time * bpm / 60).toFixed(2);
        const durationInBeats = (note.duration * bpm / 60).toFixed(2);
        context += `\n${index + 1}. ${note.note} - Time: ${note.time}s (beat ${timeInBeats}) - Duration: ${note.duration}s (${durationInBeats} beats) - Velocity: ${note.velocity}`;
      });
      
      // Add timing analysis
      const totalDuration = Math.max(...generatedNotes.map(note => note.time + note.duration));
      const totalBeats = (totalDuration * bpm / 60).toFixed(2);
      context += `\n\nTotal sequence duration: ${totalDuration.toFixed(2)}s (${totalBeats} beats)`;
      
      // Add note range analysis
      const noteNames = generatedNotes.map(note => note.note.replace(/\d/, ''));
      const uniqueNotes = [...new Set(noteNames)];
      const octaves = [...new Set(generatedNotes.map(note => note.note.match(/\d/)?.[0] || '4'))];
      context += `\nNote range: ${uniqueNotes.join(', ')} across octaves ${octaves.join(', ')}`;
      
      // Add rhythm analysis
      const rhythmPattern = generatedNotes.map(note => note.duration).join('-');
      context += `\nRhythm pattern (durations): ${rhythmPattern}`;
    }
    
    // Add recent conversation context
    const recentMessages = messages.slice(-4).filter(m => !m.isAnalysis);
    if (recentMessages.length > 0) {
      context += '\n\n=== RECENT CONVERSATION ===';
      recentMessages.forEach(msg => {
        context += `\n${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`;
      });
    }
    
    context += '\n\n=== INSTRUCTIONS ===';
    context += '\nProvide a helpful, educational response about music theory, composition, or analysis.';
    context += '\nBe specific about the current musical context when relevant.';
    context += '\nKeep responses conversational and informative, around 2-3 sentences.';
    context += '\nUse emojis appropriately. Reference specific notes, timing, or BPM when helpful.';
    
    return context;
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      setIsThinking(true);
      console.log('🤖 Generating AI response for:', userInput);
      
      const context = getConversationContext();
      const prompt = `${context}\n\nUser question: "${userInput}"\n\nProvide a helpful response:`;
      
      // Use the existing Gemini service but with a different approach
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      console.log('✅ AI response generated:', generatedText);
      return generatedText.trim();
      
    } catch (error) {
      console.error('❌ AI response generation failed:', error);
      
      // Fallback to enhanced keyword-based responses
      const userInputLower = userInput.toLowerCase();
      
      if (userInputLower.includes('chord') || userInputLower.includes('harmony')) {
        return '🎹 Chords are combinations of 3+ notes played together that create harmony. Major chords (like C-E-G) sound bright and happy, while minor chords (like A-C-E) sound sad or contemplative. They form the harmonic foundation of most music!';
      } else if (userInputLower.includes('scale') || userInputLower.includes('key')) {
        return '🎼 Scales are collections of notes that define a musical key. Major scales (Do-Re-Mi pattern) sound bright and resolved, while minor scales have a flattened third that creates a more melancholic sound. The key tells us which notes naturally "belong" together!';
      } else if (userInputLower.includes('melody')) {
        return '🎵 Melodies are sequences of single notes that create the main tune. Great melodies have shape (rising and falling), memorable intervals, and rhythmic variety. They often outline the underlying chord progression while creating their own musical narrative!';
      } else if (userInputLower.includes('tempo') || userInputLower.includes('rhythm') || userInputLower.includes('beat')) {
        return '⏱️ Tempo is the speed of music measured in BPM (beats per minute). Slow tempos (60-80 BPM) work for ballads, medium tempos (100-120 BPM) for pop/rock, and fast tempos (140+ BPM) for dance music. Rhythm is the pattern of durations!';
      } else if (userInputLower.includes('genre') || userInputLower.includes('style')) {
        return '🎸 Musical genres are characterized by specific elements: Jazz uses complex chords and swing rhythms, Rock emphasizes power chords and strong beats, Classical features orchestral arrangements, and Pop focuses on catchy melodies and accessible structures!';
      } else if (userInputLower.includes('theory') || userInputLower.includes('learn')) {
        return '📚 Music theory is like the grammar of music! It explains intervals (distances between notes), scales (note collections), chord progressions (sequences of chords), and form (how music is structured). It helps you understand why certain combinations sound good together!';
      } else {
        return '🎵 That\'s an interesting question! I can help explain music theory concepts, analyze generated music, or discuss composition techniques. Try generating some music first so I can give you specific insights about what you\'ve created!';
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Analyze generated notes when they change
  useEffect(() => {
    if (generatedNotes && generatedNotes.length > 0) {
      const analysis = musicAnalyzer.analyzeMusic(generatedNotes);
      
      const analysisMessage: Message = {
        id: `analysis-${Date.now()}`,
        text: analysis.explanation,
        isUser: false,
        isAnalysis: true
      };

      const theoryMessage: Message = {
        id: `theory-${Date.now()}`,
        text: `🎓 **Music Theory Insights:**\n\n${analysis.theory.join('\n\n')}`,
        isUser: false,
        isAnalysis: true
      };

      setMessages(prev => [...prev, analysisMessage, theoryMessage]);
    }
  }, [generatedNotes]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      const userInput = inputValue;
      setInputValue('');
      
      // Generate AI response
      const aiResponse = await generateAIResponse(userInput);
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false
      };
      setMessages(prev => [...prev, responseMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (text: string) => {
    // Simple markdown-like rendering for **bold** and line breaks
    const parts = text.split(/(\*\*.*?\*\*|\n)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part === '\n') {
        return <br key={index} />;
      }
      return part;
    });
  };

  return (
    <div className={`minimal-chatbot ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chatbot-header">
        <span className="chatbot-title">🎵 Music AI</span>
        <button 
          className="minimize-toggle"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '▼' : '▲'}
        </button>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.isUser ? 'user' : 'ai'} ${message.isAnalysis ? 'analysis' : ''}`}
              >
                <div className="message-content">
                  {renderMessage(message.text)}
                </div>
              </div>
            ))}
            
            {/* Thinking indicator */}
            {isThinking && (
              <div className="message-row">
                <div className="message ai">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="input-field"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="send-button"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MinimalChatBot;
