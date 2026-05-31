import React, { useState } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Translation gamit ang sariling API
  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          sourceLang: 'tl',
          targetLang: targetLang === 'spanish' ? 'es' : 'en'
        })
      });
      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // AI Response gamit ang sariling API
  const getAIResponse = async (userText, targetLang) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          language: targetLang
        })
      });
      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('AI Error:', error);
      return targetLang === 'spanish' 
        ? "Lo siento, error técnico. ¿Puedes repetir?"
        : "Sorry, technical error. Can you repeat?";
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Sorry, hindi supported ng browser mo. Gumamit ng Chrome!');
      return;
    }
    
    setIsListening(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'tl-PH';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = async (event) => {
      const tagalogText = event.results[0][0].transcript;
      setUserMessage(tagalogText);
      setIsListening(false);
      setIsThinking(true);
      
      const translated = await translateText(tagalogText, language);
      setTranslatedMessage(translated);
      
      const aiResponse = await getAIResponse(tagalogText, language);
      setAiReply(aiResponse);
      setIsThinking(false);
      
      speakText(aiResponse, language);
    };
    
    recognition.onerror = (event) => {
      console.error('Error:', event.error);
      setIsListening(false);
      alert('May error sa microphone. Payagan ang mic access sa browser!');
    };
    
    recognition.start();
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
      <div className="container">
        <h1>🎙️ AI Voice Translator</h1>
        <p className="subtitle">Magsalita ng Tagalog, sasagot ang AI sa Spanish o English</p>
        
        <div className="language-selector">
          <button 
            className={language === 'spanish' ? 'active' : ''}
            onClick={() => setLanguage('spanish')}
          >
            🇪🇸 Spanish
          </button>
          <button 
            className={language === 'english' ? 'active' : ''}
            onClick={() => setLanguage('english')}
          >
            🇺🇸 English
          </button>
        </div>
        
        <div className="mic-container">
          <button 
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={startListening}
            disabled={isListening || isThinking}
          >
            {isListening ? '🔴 Nakikinig...' : isThinking ? '🤔 Nag-iisip ang AI...' : '🎤 Magsalita (Tagalog)'}
          </button>
        </div>
        
        <div className="messages">
          <div className="message-card user">
            <div className="message-label">📝 Sinabi mo (Tagalog):</div>
            <div className="message-text">{userMessage || 'Wala pa...'}</div>
          </div>
          
          <div className="message-card translated">
            <div className="message-label">
              🌍 Isinalin sa {language === 'spanish' ? 'Spanish' : 'English'}:
            </div>
            <div className="message-text">{translatedMessage || 'Wala pa...'}</div>
          </div>
          
          <div className="message-card ai">
            <div className="message-label">
              🤖 Sagot ng AI {isSpeaking && '(nagsasalita...)'}:
            </div>
            <div className="message-text">{aiReply || 'I-click ang mic para magsimula'}</div>
          </div>
        </div>
        
        <div className="instructions">
          <h3>📖 Paano gamitin:</h3>
          <ol>
            <li>Piliin kung Spanish o English</li>
            <li>I-click ang mic button at magsalita ng <strong>TAGALOG</strong></li>
            <li>Awtomatikong magsa-translate at sasagot ang AI</li>
            <li>Maririnig mo ang sagot sa napili mong wika!</li>
          </ol>
          <p className="note">🎤 Libre ito at walang limit sa translation at AI responses!</p>
        </div>
      </div>
    </div>
  );
}

export default App;