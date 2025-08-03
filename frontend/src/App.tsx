import './App.css';
import MIDIEditor from './components/MIDIEditor';
// import FloatingControls from './components/FloatingControls';
// import FloatingChat from './components/FloatingChat';

function App() {
  return (
    <div className="App">
      {/* Full-screen MIDI Editor background */}
      <MIDIEditor />
      
      {/* Floating controls and chat boxes - temporarily hidden */}
      {/* <FloatingControls /> */}
      {/* <FloatingChat /> */}
    </div>
  );
}

export default App;
