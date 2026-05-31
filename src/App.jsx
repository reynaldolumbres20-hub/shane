import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Libreng translation (MyMemory API)
  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tl|${targetLang}`
      );
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Voice recognition not supported. Use Chrome browser!');
      return;
    }
    
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e) {}
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'tl-PH';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setUserMessage('🎤 Nakikinig... magsalita ka na');
      setTranslatedMessage('');
    };
    
    recognition.onresult = async (event) => {
      const tagalogText = event.results[0][0].transcript;
      setUserMessage(tagalogText);
      
      const targetLang = language === 'spanish' ? 'es' : 'en';
      const translated = await translateText(tagalogText, targetLang);
      setTranslatedMessage(translated);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setUserMessage('❌ Hindi pinayagan ang microphone. I-click ang Allow!');
      } else if (event.error === 'no-speech') {
        setUserMessage('❌ Walang narinig. Subukan ulit.');
      } else {
        setUserMessage(`❌ Error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="App">
      <div className="container">
        <h1>🎙️ Voice Translator</h1>
        <p className="subtitle">Magsalita ng Tagalog → Isasalin sa Spanish o English</p>
        
        <div className="language-selector">
          <button className={language === 'spanish' ? 'active' : ''} onClick={() => setLanguage('spanish')}>
            🇪🇸 Spanish
          </button>
          <button className={language === 'english' ? 'active' : ''} onClick={() => setLanguage('english')}>
            🇺🇸 English
          </button>
        </div>
        
        <div className="mic-container">
          <button 
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={startListening}
          >
            {isListening ? '🔴 Nakikinig...' : '🎤 I-click para Magsalita'}
          </button>
          <p className="mic-hint">💡 I-click ang button → Magsalita ng TAGALOG → Awtomatikong isasalin</p>
        </div>
        
        <div className="messages">
          <div className="message-card user">
            <div className="message-label">📝 Sinabi mo (Tagalog):</div>
            <div className="message-text">{userMessage || 'Wala pa...'}</div>
          </div>
          
          <div className="message-card translated">
            <div className="message-label">🌍 Isinalin sa {language === 'spanish' ? 'Spanish' : 'English'}:</div>
            <div className="message-text">{translatedMessage || 'Wala pa...'}</div>
          </div>
        </div>
        
        <div className="instructions">
          <h3>📖 Paano gamitin:</h3>
          <ol>
            <li>Piliin kung Spanish o English</li>
            <li><strong>I-CLICK</strong> ang mic button</li>
            <li><strong>I-ALLOW</strong> ang microphone permission</li>
            <li>Magsalita ng <strong>TAGALOG</strong> (1-2 pangungusap)</li>
            <li>Makikita mo agad ang translation!</li>
          </ol>
          <p className="note">🎤 Libre ito, walang API key na kailangan. Gumagarin dapat sa Android Chrome!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
