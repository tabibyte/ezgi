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
      text: 'Merhaba! Müzik teorisi ve MIDI üretimi konularında size yardımcı olabilirim. Biraz müzik oluşturun, sizin için analiz edeyim!',
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get context from recent analysis and current notes
  const getConversationContext = (): string => {
    let context = 'Sen bir müzik teorisi uzmanı ve AI asistanısın. Kullanıcılara müzik kompozisyonu, teorisi ve analizi konularında yardım ediyorsun. Türkçe yanıt ver. ';
    
    if (generatedNotes && generatedNotes.length > 0) {
      const analysis = musicAnalyzer.analyzeMusic(generatedNotes);
      
      // Add detailed musical context in Turkish
      context += `\n\n=== MEVCUT MÜZİKAL BAĞLAM ===`;
      context += `\nTempo: ${bpm} BPM`;
      context += `\nTon: ${analysis.key} ${analysis.scale}`;
      context += `\nRuh Hali: ${analysis.mood}`;
      context += `\nÖnerilen türler: ${analysis.genres.join(', ')}`;
      
      if (analysis.chords.length > 0) {
        context += `\nTespit edilen akorlar: ${analysis.chords.join(', ')}`;
      }
      
      // Add detailed note information in Turkish
      context += `\n\n=== NOTA DİZİSİ (${generatedNotes.length} nota) ===`;
      generatedNotes.forEach((note, index) => {
        const timeInBeats = (note.time * bpm / 60).toFixed(2);
        const durationInBeats = (note.duration * bpm / 60).toFixed(2);
        context += `\n${index + 1}. ${note.note} - Zaman: ${note.time}s (vuruş ${timeInBeats}) - Süre: ${note.duration}s (${durationInBeats} vuruş) - Şiddet: ${note.velocity}`;
      });
      
      // Add timing analysis in Turkish
      const totalDuration = Math.max(...generatedNotes.map(note => note.time + note.duration));
      const totalBeats = (totalDuration * bpm / 60).toFixed(2);
      context += `\n\nToplam dizi süresi: ${totalDuration.toFixed(2)}s (${totalBeats} vuruş)`;
      
      // Add note range analysis in Turkish
      const noteNames = generatedNotes.map(note => note.note.replace(/\d/, ''));
      const uniqueNotes = [...new Set(noteNames)];
      const octaves = [...new Set(generatedNotes.map(note => note.note.match(/\d/)?.[0] || '4'))];
      context += `\nNota aralığı: ${uniqueNotes.join(', ')} oktavlar ${octaves.join(', ')} arasında`;
      
      // Add rhythm analysis in Turkish
      const rhythmPattern = generatedNotes.map(note => note.duration).join('-');
      context += `\nRitim deseni (süreler): ${rhythmPattern}`;
    }
    
    // Add recent conversation context in Turkish
    const recentMessages = messages.slice(-4).filter(m => !m.isAnalysis);
    if (recentMessages.length > 0) {
      context += '\n\n=== SON KONUŞMA ===';
      recentMessages.forEach(msg => {
        context += `\n${msg.isUser ? 'Kullanıcı' : 'Asistan'}: ${msg.text}`;
      });
    }
    
    context += '\n\n=== TALİMATLAR ===';
    context += '\nMüzik teorisi, kompozisyon veya analiz hakkında yardımcı ve eğitici bir yanıt ver.';
    context += '\nİlgili olduğunda mevcut müzikal bağlam hakkında spesifik ol.';
    context += '\nYanıtları konuşma tarzında ve bilgilendirici tut, yaklaşık 2-3 cümle.';
    context += '\nUygun yerlerde emoji kullan. Yardımcı olduğunda spesifik notalar, zamanlama veya BPM\'e referans ver.';
    context += '\nHer zaman Türkçe yanıt ver.';
    
    return context;
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      setIsThinking(true);
      console.log('🤖 Generating AI response for:', userInput);
      
      const context = getConversationContext();
      const prompt = `${context}\n\nKullanıcı sorusu: "${userInput}"\n\nYardımcı bir yanıt ver:`;
      
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
      
      // Fallback to enhanced keyword-based responses in Turkish
      const userInputLower = userInput.toLowerCase();
      
      if (userInputLower.includes('akor') || userInputLower.includes('chord') || userInputLower.includes('harmoni')) {
        return '🎹 Akorlar, harmoni oluşturan 3+ notanın birlikte çalınmasıdır. Majör akorlar (C-E-G gibi) parlak ve mutlu duyulur, minör akorlar (A-C-E gibi) üzgün veya düşünceli duyulur. Müziğin harmonik temelini oluştururlar!';
      } else if (userInputLower.includes('dizi') || userInputLower.includes('scale') || userInputLower.includes('ton') || userInputLower.includes('key')) {
        return '🎼 Diziler, müzikal bir tonu tanımlayan nota koleksiyonlarıdır. Majör diziler (Do-Re-Mi deseni) parlak ve çözümlenmiş duyulur, minör diziler düz üçlü ile daha melankolik bir ses yaratır. Ton bize hangi notaların doğal olarak "birbirine ait" olduğunu söyler!';
      } else if (userInputLower.includes('melodi') || userInputLower.includes('melody')) {
        return '🎵 Melodiler, ana ezgiyi oluşturan tek nota dizileridir. Harika melodilerin şekli (yükselip alçalma), akılda kalıcı aralıkları ve ritmik çeşitliliği vardır. Genellikle alttaki akor ilerleyişini özetlerken kendi müzikal anlatımlarını yaratırlar!';
      } else if (userInputLower.includes('tempo') || userInputLower.includes('ritim') || userInputLower.includes('vuruş') || userInputLower.includes('rhythm') || userInputLower.includes('beat')) {
        return '⏱️ Tempo, BPM (dakikadaki vuruş) ile ölçülen müziğin hızıdır. Yavaş tempolar (60-80 BPM) baladlar için, orta tempolar (100-120 BPM) pop/rock için, hızlı tempolar (140+ BPM) dans müziği için çalışır. Ritim, sürelerin desenidir!';
      } else if (userInputLower.includes('tür') || userInputLower.includes('stil') || userInputLower.includes('genre') || userInputLower.includes('style')) {
        return '🎸 Müzik türleri belirli öğelerle karakterize edilir: Caz karmaşık akorlar ve swing ritmleri kullanır, Rock güçlü akorları ve güçlü vuruşları vurgular, Klasik orkestral düzenlemelere sahiptir ve Pop akılda kalıcı melodiler ve erişilebilir yapılara odaklanır!';
      } else if (userInputLower.includes('teori') || userInputLower.includes('öğren') || userInputLower.includes('theory') || userInputLower.includes('learn')) {
        return '📚 Müzik teorisi müziğin grameri gibidir! Aralıkları (notalar arası mesafeler), dizileri (nota koleksiyonları), akor ilerleyişlerini (akor dizileri) ve formu (müziğin nasıl yapılandığı) açıklar. Belirli kombinasyonların neden birlikte güzel duyulduğunu anlamanıza yardımcı olur!';
      } else {
        return '🎵 İlginç bir soru! Müzik teorisi kavramlarını açıklayabilir, oluşturulan müziği analiz edebilir veya kompozisyon tekniklerini tartışabilirim. Önce biraz müzik oluşturun, böylece yarattığınız hakkında spesifik içgörüler verebilirim!';
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
        text: `🎓 **Müzik Teorisi İçgörüleri:**\n\n${analysis.theory.join('\n\n')}`,
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
        <span className="chatbot-title">🎵
        </span>
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
              placeholder="Bana sor..."
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
