import React from 'react';

const AIDialog: React.FC = () => {
  return (
    <div className="ai-dialog">
      <div className="ai-header">
        <h3>🤖 AI Music Theory Assistant</h3>
        <div className="ai-status">
          <span className="status-indicator online"></span>
          <span>Gemini AI Ready</span>
        </div>
      </div>

      {/* Theory Concepts Section */}
      <div className="theory-concepts">
        <h4>📚 Theory Concepts</h4>
        <div className="concept-buttons">
          <button className="concept-btn">🎵 Scales</button>
          <button className="concept-btn">🎶 Chords</button>
          <button className="concept-btn">🔺 Augmented Chords</button>
          <button className="concept-btn">🔻 Diminished Chords</button>
          <button className="concept-btn">7️⃣ 7th Chords</button>
          <button className="concept-btn">🔄 Chord Progressions</button>
          <button className="concept-btn">🎼 Modes</button>
          <button className="concept-btn">🎯 Intervals</button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="chat-interface">
        <div className="chat-messages">
          <div className="message ai-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <p>Hello! I'm your AI music theory assistant. I can help you learn music theory concepts and generate musical examples.</p>
              <p>Try clicking on a theory concept above, or ask me anything about music!</p>
            </div>
          </div>
          
          <div className="message user-message">
            <div className="message-content">
              <p>Tell me about augmented chords</p>
            </div>
            <div className="message-avatar">👤</div>
          </div>

          <div className="message ai-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <p>Augmented chords are built with a major third and an augmented fifth. They have a distinctive "dreamy" or "mysterious" sound!</p>
              <p><strong>Example:</strong> C+ = C - E - G#</p>
              <p>Would you like me to demonstrate this on the piano roll?</p>
              <button className="demo-btn">🎹 Show on Piano Roll</button>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="chat-input">
          <input 
            type="text" 
            placeholder="Ask about music theory, request explanations..."
            className="chat-text-input"
          />
          <button className="send-btn">📤</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>⚡ Quick Actions</h4>
        <div className="action-buttons">
          <button className="quick-btn">🎼 Analyze My Composition</button>
          <button className="quick-btn">🎯 Practice Exercises</button>
          <button className="quick-btn">📈 My Progress</button>
          <button className="quick-btn">🎵 Song Suggestions</button>
        </div>
      </div>
    </div>
  );
};

export default AIDialog;
