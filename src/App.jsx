import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [spanishTranslation, setSpanishTranslation] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // ============================================
  // TRANSLATION FUNCTIONS
  // ============================================
  
  const translateToSpanish = async (text) => {
    if (!text || text.trim() === '') return '';
    
    // Dictionary for common Tagalog words to Spanish
    const dict = {
      'kamusta': 'cómo estás',
      'kumusta': 'cómo estás',
      'musta': 'cómo estás',
      'salamat': 'gracias',
      'maraming salamat': 'muchas gracias',
      'paalam': 'adiós',
      'bye': 'adiós',
      'mahal': 'amor',
      'mahal kita': 'te quiero',
      'gusto kita': 'me gustas',
      'kape': 'café',
      'tubig': 'agua',
      'kanin': 'arroz',
      'kain': 'comer',
      'kumain': 'comer',
      'tulog': 'dormir',
      'lakad': 'caminar',
      'takbo': 'correr',
      'masaya': 'feliz',
      'malungkot': 'triste',
      'galit': 'enojado',
      'pagod': 'cansado',
      'gutom': 'hambre',
      'uhaw': 'sed',
      'ako': 'yo',
      'ikaw': 'tú',
      'ka': 'tú',
      'siya': 'él/ella',
      'tayo': 'nosotros',
      'kayo': 'ustedes',
      'sila': 'ellos',
      'ano': 'qué',
      'sino': 'quién',
      'saan': 'dónde',
      'bakit': 'por qué',
      'paano': 'cómo',
      'kailan': 'cuándo',
      'magkano': 'cuánto cuesta',
      'bahay': 'casa',
      'eskwela': 'escuela',
      'trabaho': 'trabajo',
      'simbahan': 'iglesia',
      'ospital': 'hospital',
      'palengke': 'mercado',
      'nanay': 'madre',
      'tatay': 'padre',
      'ate': 'hermana mayor',
      'kuya': 'hermano mayor',
      'lola': 'abuela',
      'lolo': 'abuelo',
    };
    
    const lowerText = text.toLowerCase();
    let result = text;
    
    for (const [tagalog, spanish] of Object.entries(dict)) {
      if (lowerText.includes(tagalog)) {
        result = result.replace(new RegExp(tagalog, 'gi'), spanish);
      }
    }
    
    return result;
  };

  const translateToEnglish = async (text) => {
    if (!text || text.trim() === '') return '';
    
    // Dictionary for common Tagalog words to English
    const dict = {
      'kamusta': 'how are you',
      'kumusta': 'how are you',
      'musta': 'how are you',
      'salamat': 'thank you',
      'maraming salamat': 'thank you very much',
      'paalam': 'goodbye',
      'bye': 'goodbye',
      'mahal': 'love',
      'mahal kita': 'i love you',
      'gusto kita': 'i like you',
      'kape': 'coffee',
      'tubig': 'water',
      'kanin': 'rice',
      'kain': 'eat',
      'kumain': 'eat',
      'tulog': 'sleep',
      'lakad': 'walk',
      'takbo': 'run',
      'masaya': 'happy',
      'malungkot': 'sad',
      'galit': 'angry',
      'pagod': 'tired',
      'gutom': 'hungry',
      'uhaw': 'thirsty',
      'ako': 'i',
      'ikaw': 'you',
      'ka': 'you',
      'siya': 'he/she',
      'tayo': 'we',
      'kayo': 'you all',
      'sila': 'they',
      'ano': 'what',
      'sino': 'who',
      'saan': 'where',
      'bakit': 'why',
      'paano': 'how',
      'kailan': 'when',
      'magkano': 'how much',
      'bahay': 'house',
      'eskwela': 'school',
      'trabaho': 'work',
      'simbahan': 'church',
      'ospital': 'hospital',
      'palengke': 'market',
      'nanay': 'mother',
      'tatay': 'father',
      'ate': 'older sister',
      'kuya': 'older brother',
      'lola': 'grandmother',
      'lolo': 'grandfather',
    };
    
    const lowerText = text.toLowerCase();
    let result = text;
    
    for (const [tagalog, english] of Object.entries(dict)) {
      if (lowerText.includes(tagalog)) {
        result = result.replace(new RegExp(tagalog, 'gi'), english);
      }
    }
    
    return result;
  };

  // ============================================
  // SPEECH FUNCTIONS
  // ============================================
  
  const speakText = (text, langType) => {
    if (!text || text.trim() === '') {
      console.log('No text to speak');
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (langType === 'spanish') {
      utterance.lang = 'es-ES';
    } else if (langType === 'english') {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'tl-PH';
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    
    utterance.onerror = (e) => console.error('Speech error:', e);
    
    window.speechSynthesis.speak(utterance);
  };

  // ============================================
  // VOICE RECOGNITION
  // ============================================
  
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Please use Google Chrome browser!');
      return;
    }
    
    accumulatedTextRef.current = '';
    setUserMessage('');
    setSpanishTranslation('');
    setEnglishTranslation('');
    setAiReply('');
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

  const stopRecordingAndTranslate = async () => {
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
    
    // Translate to BOTH languages
    const spanish = await translateToSpanish(finalMessage);
    const english = await translateToEnglish(finalMessage);
    
    setSpanishTranslation(spanish);
    setEnglishTranslation(english);
    setAiReply(language === 'spanish' ? spanish : english);
    setShowTranslation(true);
    setIsProcessing(false);
  };

  return (
    <div className="App">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <div className="glass-container">
        <div className="header">
          <div className="logo">
            <span className="logo-icon">🎙️</span>
            <span className="logo-text">AI Voice Translator</span>
          </div>
          <div className="badge">DUAL TRANSLATION</div>
        </div>
        
        <p className="subtitle">Magsalita ng Tagalog • Makikita ang Spanish at English translation • Pindutin ang speaker para marinig</p>
        
        <div className="language-selector">
          <button className={`lang-btn ${language === 'spanish' ? 'active' : ''}`} onClick={() => setLanguage('spanish')}>
            🇪🇸 Spanish (AI Response)
          </button>
          <button className={`lang-btn ${language === 'english' ? 'active' : ''}`} onClick={() => setLanguage('english')}>
            🇺🇸 English (AI Response)
          </button>
        </div>
        
        <div className="control-group">
          <button className={`btn-start ${isRecording ? 'recording' : ''}`} onClick={startRecording} disabled={isRecording || isProcessing}>
            <span className="btn-icon">🎤</span>
            {isRecording ? 'RECORDING...' : 'START MIC'}
          </button>
          
          <button className="btn-stop" onClick={stopRecordingAndTranslate} disabled={!isRecording || isProcessing}>
            <span className="btn-icon">⏹️</span>
            STOP & TRANSLATE
          </button>
        </div>
        
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>{isRecording ? '🔴 Nakikinig... Magsalita ka ng Tagalog' : '🔄 Nagsa-translate...'}</span>
          </div>
        )}
        
        <div className="results">
          {/* Tagalog Box */}
          <div className="result-card tagalog">
            <div className="result-header">
              <span className="result-icon">🇵🇭</span>
              <span>📝 SINABI MO (TAGALOG)</span>
            </div>
            <div className="result-content">{userMessage || 'Click START MIC at magsalita ng Tagalog...'}</div>
          </div>
          
          {/* Spanish Translation Box */}
          <div className="result-card spanish">
            <div className="result-header">
              <span className="result-icon">🇪🇸</span>
              <span>🌍 SPANISH TRANSLATION</span>
              <button 
                className="mini-play" 
                onClick={() => speakText(spanishTranslation, 'spanish')}
                disabled={!spanishTranslation}
              >
                🔊 HEAR SPANISH
              </button>
            </div>
            <div className="result-content">{spanishTranslation || 'Mag-record muna bago mag-translate...'}</div>
          </div>
          
          {/* English Translation Box */}
          <div className="result-card english">
            <div className="result-header">
              <span className="result-icon">🇺🇸</span>
              <span>🌍 ENGLISH TRANSLATION</span>
              <button 
                className="mini-play" 
                onClick={() => speakText(englishTranslation, 'english')}
                disabled={!englishTranslation}
              >
                🔊 HEAR ENGLISH
              </button>
            </div>
            <div className="result-content">{englishTranslation || 'Mag-record muna bago mag-translate...'}</div>
          </div>
          
          {/* AI Response Box (Optional) */}
          {showTranslation && (
            <div className="result-card ai-response fade-in">
              <div className="result-header">
                <span className="result-icon">🤖</span>
                <span>AI RESPONSE ({language === 'spanish' ? 'SPANISH' : 'ENGLISH'})</span>
                <button 
                  className="mini-play" 
                  onClick={() => speakText(aiReply, language)}
                >
                  🔊 HEAR AI
                </button>
              </div>
              <div className="result-content">{aiReply}</div>
            </div>
          )}
        </div>
        
        <div className="dictionary-preview">
          <h4>📖 PAANO GAMITIN:</h4>
          <div className="word-grid">
            <span>1️⃣ I-click ang START MIC</span>
            <span>2️⃣ Magsalita ng TAGALOG (hal: "Kamusta ka?")</span>
            <span>3️⃣ I-click STOP & TRANSLATE</span>
            <span>4️⃣ Makikita ang SPANISH at ENGLISH translation</span>
            <span>5️⃣ Pindutin ang HEAR SPANISH o HEAR ENGLISH para marinig</span>
          </div>
        </div>
        
        <div className="footer">
          <p>🎤 Tagalog → Spanish & English Translator • Voice Recognition • Text-to-Speech • Free</p>
        </div>
      </div>
    </div>
  );
}

export default App;