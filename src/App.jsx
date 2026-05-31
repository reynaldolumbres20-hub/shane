import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // COMPLETE DICTIONARY
  const dictionary = {
    // GREETINGS
    'kamusta': { es: '¿cómo estás?', en: 'how are you?' },
    'kumusta': { es: '¿cómo estás?', en: 'how are you?' },
    'musta': { es: '¿cómo estás?', en: 'how are you?' },
    'hello': { es: 'hola', en: 'hello' },
    'hi': { es: 'hola', en: 'hi' },
    'magandang umaga': { es: 'buenos días', en: 'good morning' },
    'magandang hapon': { es: 'buenas tardes', en: 'good afternoon' },
    'magandang gabi': { es: 'buenas noches', en: 'good evening' },
    
    // RESPONSES
    'salamat': { es: 'gracias', en: 'thank you' },
    'maraming salamat': { es: 'muchas gracias', en: 'thank you very much' },
    'walang anuman': { es: 'de nada', en: 'you\'re welcome' },
    'paalam': { es: 'adiós', en: 'goodbye' },
    'bye': { es: 'adiós', en: 'bye' },
    'sige': { es: 'vale', en: 'okay' },
    'ingat': { es: 'cuídate', en: 'take care' },
    
    // QUESTIONS
    'ano': { es: 'qué', en: 'what' },
    'sino': { es: 'quién', en: 'who' },
    'saan': { es: 'dónde', en: 'where' },
    'kailan': { es: 'cuándo', en: 'when' },
    'bakit': { es: 'por qué', en: 'why' },
    'paano': { es: 'cómo', en: 'how' },
    'ilan': { es: 'cuántos', en: 'how many' },
    'magkano': { es: 'cuánto cuesta', en: 'how much' },
    
    // PEOPLE
    'ako': { es: 'yo', en: 'i' },
    'ikaw': { es: 'tú', en: 'you' },
    'siya': { es: 'él/ella', en: 'he/she' },
    'tayo': { es: 'nosotros', en: 'we' },
    'kayo': { es: 'ustedes', en: 'you (plural)' },
    'sila': { es: 'ellos', en: 'they' },
    'nanay': { es: 'madre', en: 'mother' },
    'tatay': { es: 'padre', en: 'father' },
    'ate': { es: 'hermana mayor', en: 'older sister' },
    'kuya': { es: 'hermano mayor', en: 'older brother' },
    'bunso': { es: 'el más joven', en: 'youngest' },
    'lola': { es: 'abuela', en: 'grandmother' },
    'lolo': { es: 'abuelo', en: 'grandfather' },
    
    // ACTIONS
    'kumain': { es: 'comer', en: 'eat' },
    'uminom': { es: 'beber', en: 'drink' },
    'tulog': { es: 'dormir', en: 'sleep' },
    'lakad': { es: 'caminar', en: 'walk' },
    'takbo': { es: 'correr', en: 'run' },
    'luto': { es: 'cocinar', en: 'cook' },
    'laba': { es: 'lavar', en: 'wash' },
    'linis': { es: 'limpiar', en: 'clean' },
    'basa': { es: 'leer', en: 'read' },
    'sulat': { es: 'escribir', en: 'write' },
    'kanta': { es: 'cantar', en: 'sing' },
    'sayaw': { es: 'bailar', en: 'dance' },
    'laro': { es: 'jugar', en: 'play' },
    'trabaho': { es: 'trabajar', en: 'work' },
    'aral': { es: 'estudiar', en: 'study' },
    
    // FOOD & DRINKS
    'kape': { es: 'café', en: 'coffee' },
    'tubig': { es: 'agua', en: 'water' },
    'kanin': { es: 'arroz', en: 'rice' },
    'ulam': { es: 'comida', en: 'dish' },
    'tinapay': { es: 'pan', en: 'bread' },
    'gatas': { es: 'leche', en: 'milk' },
    'juice': { es: 'jugo', en: 'juice' },
    'manok': { es: 'pollo', en: 'chicken' },
    'baboy': { es: 'cerdo', en: 'pork' },
    'isda': { es: 'pescado', en: 'fish' },
    'gulay': { es: 'verduras', en: 'vegetables' },
    'prutas': { es: 'frutas', en: 'fruits' },
    
    // EMOTIONS
    'masaya': { es: 'feliz', en: 'happy' },
    'malungkot': { es: 'triste', en: 'sad' },
    'galit': { es: 'enojado', en: 'angry' },
    'takot': { es: 'miedo', en: 'scared' },
    'excited': { es: 'emocionado', en: 'excited' },
    'pagod': { es: 'cansado', en: 'tired' },
    'gutom': { es: 'hambriento', en: 'hungry' },
    'uhaw': { es: 'sediento', en: 'thirsty' },
    'kinakabahan': { es: 'nervioso', en: 'nervous' },
    'naguguluhan': { es: 'confundido', en: 'confused' },
    
    // PLACES
    'bahay': { es: 'casa', en: 'house' },
    'eskwela': { es: 'escuela', en: 'school' },
    'trabaho': { es: 'trabajo', en: 'work' },
    'simbahan': { es: 'iglesia', en: 'church' },
    'ospital': { es: 'hospital', en: 'hospital' },
    'palengke': { es: 'mercado', en: 'market' },
    'parke': { es: 'parque', en: 'park' },
    'mall': { es: 'centro comercial', en: 'mall' },
    'restawran': { es: 'restaurante', en: 'restaurant' },
    'banyo': { es: 'baño', en: 'bathroom' },
    
    // TIME
    'ngayon': { es: 'ahora', en: 'now' },
    'bukas': { es: 'mañana', en: 'tomorrow' },
    'kahapon': { es: 'ayer', en: 'yesterday' },
    'mamaya': { es: 'más tarde', en: 'later' },
    'kanina': { es: 'hace un momento', en: 'earlier' },
    
    // COLORS
    'pula': { es: 'rojo', en: 'red' },
    'bughaw': { es: 'azul', en: 'blue' },
    'berde': { es: 'verde', en: 'green' },
    'dilaw': { es: 'amarillo', en: 'yellow' },
    'itim': { es: 'negro', en: 'black' },
    'puti': { es: 'blanco', en: 'white' },
    'kahel': { es: 'naranja', en: 'orange' },
    'lila': { es: 'morado', en: 'purple' },
  };

  // SENTENCE RESPONSES
  const sentenceResponses = {
    'kamusta ka': {
      es: '¡Estoy bien, gracias! ¿Y tú cómo estás?',
      en: "I'm fine, thanks! And you, how are you?"
    },
    'ano pangalan mo': {
      es: 'Me llamo AI Voice Assistant. ¿Y tú?',
      en: "My name is AI Voice Assistant. And you?"
    },
    'saan ka galing': {
      es: 'Vengo del mundo digital. ¿Y tú?',
      en: "I come from the digital world. And you?"
    },
    'mahal kita': {
      es: 'Qué bonito. Te aprecio mucho también.',
      en: "How nice. I appreciate you too."
    },
    'gusto kita': {
      es: 'Eres especial. Me gusta conversar contigo.',
      en: "You're special. I like chatting with you."
    },
  };

  const translateText = (text, targetLang) => {
    const lowerText = text.toLowerCase();
    let translated = '';
    const words = lowerText.split(' ');
    
    for (let word of words) {
      if (dictionary[word]) {
        translated += dictionary[word][targetLang] + ' ';
      } else {
        translated += word + ' ';
      }
    }
    
    // Check for sentence responses
    for (const [sentence, response] of Object.entries(sentenceResponses)) {
      if (lowerText.includes(sentence)) {
        return response[targetLang];
      }
    }
    
    return translated.trim() || text;
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Please use Google Chrome browser!');
      return;
    }
    
    accumulatedTextRef.current = '';
    setUserMessage('');
    setShowTranslation(false);
    setIsRecording(true);
    
    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tl-PH';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let finalTranscript = '';
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      accumulatedTextRef.current = finalTranscript + interimTranscript;
      setUserMessage(accumulatedTextRef.current || '🎤 Speaking...');
    };
    
    recognition.onerror = (event) => {
      console.error('Error:', event.error);
      setIsRecording(false);
      alert('Microphone error. Please check permissions.');
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecordingAndTranslate = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setIsProcessing(true);
    
    const finalMessage = accumulatedTextRef.current.trim();
    if (!finalMessage) {
      setUserMessage('No speech detected. Try again.');
      setIsProcessing(false);
      return;
    }
    
    setUserMessage(finalMessage);
    
    // Translate to selected language
    const targetLang = language;
    const translated = translateText(finalMessage, targetLang);
    setTranslatedMessage(translated);
    setAiReply(translated);
    setShowTranslation(true);
    setIsProcessing(false);
  };

  const speakText = (text, lang) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.lang = lang === 'spanish' ? 'es-ES' : 'en-US';
    speech.rate = 0.9;
    speech.pitch = 1.0;
    speech.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="App">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="clouds"></div>
      
      <div className="glass-container">
        <div className="header">
          <div className="logo">
            <span className="logo-icon">🎙️</span>
            <span className="logo-text">AI Voice Translator</span>
          </div>
          <div className="badge">PREMIUM</div>
        </div>
        
        <p className="subtitle">Speak Tagalog • Get Spanish/English Translation • Voice Output</p>
        
        {/* Language Selector */}
        <div className="language-selector">
          <button 
            className={`lang-btn ${language === 'spanish' ? 'active' : ''}`}
            onClick={() => setLanguage('spanish')}
          >
            🇪🇸 Spanish
          </button>
          <button 
            className={`lang-btn ${language === 'english' ? 'active' : ''}`}
            onClick={() => setLanguage('english')}
          >
            🇺🇸 English
          </button>
        </div>
        
        {/* Control Buttons */}
        <div className="control-group">
          <button 
            className={`btn-start ${isRecording ? 'recording' : ''}`}
            onClick={startRecording}
            disabled={isRecording || isProcessing}
          >
            <span className="btn-icon">🎤</span>
            {isRecording ? 'RECORDING...' : 'START MIC'}
          </button>
          
          <button 
            className="btn-stop"
            onClick={stopRecordingAndTranslate}
            disabled={!isRecording || isProcessing}
          >
            <span className="btn-icon">⏹️</span>
            STOP & TRANSLATE
          </button>
        </div>
        
        {/* Voice Output Buttons */}
        <div className="voice-group">
          <button 
            className="btn-voice"
            onClick={() => speakText(translatedMessage, language)}
            disabled={!translatedMessage}
          >
            <span className="btn-icon">🔊</span>
            HEAR {language === 'spanish' ? 'SPANISH' : 'ENGLISH'}
          </button>
          <button 
            className="btn-voice"
            onClick={() => speakText(userMessage, 'tagalog')}
            disabled={!userMessage}
          >
            <span className="btn-icon">🗣️</span>
            REPEAT TAGALOG
          </button>
        </div>
        
        {/* Status Indicator */}
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>{isRecording ? 'Recording in progress... Speak clearly' : 'Translating...'}</span>
          </div>
        )}
        
        {/* Results */}
        <div className="results">
          <div className="result-card tagalog">
            <div className="result-header">
              <span className="result-icon">🇵🇭</span>
              <span>Tagalog (You said)</span>
            </div>
            <div className="result-content">{userMessage || 'Click START MIC and speak...'}</div>
          </div>
          
          {showTranslation && (
            <div className="result-card translation fade-in">
              <div className="result-header">
                <span className="result-icon">{language === 'spanish' ? '🇪🇸' : '🇺🇸'}</span>
                <span>Translation to {language === 'spanish' ? 'Spanish' : 'English'}</span>
              </div>
              <div className="result-content">{translatedMessage}</div>
              <button 
                className="play-btn"
                onClick={() => speakText(translatedMessage, language)}
              >
                ▶️ Play Audio
              </button>
            </div>
          )}
        </div>
        
        {/* Dictionary Preview */}
        <div className="dictionary-preview">
          <h4>📚 Sample Dictionary ({Object.keys(dictionary).length}+ words)</h4>
          <div className="word-grid">
            <span>Kamusta → Hello</span>
            <span>Salamat → Thanks</span>
            <span>Paalam → Goodbye</span>
            <span>Mahal → Love</span>
            <span>Kape → Coffee</span>
            <span>Bahay → House</span>
          </div>
        </div>
        
        <div className="footer">
          <p>🎤 Premium AI Voice Translator • Real-time • No limits • 100% Free</p>
        </div>
      </div>
    </div>
  );
}

export default App;