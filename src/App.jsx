import React, { useState, useRef, useEffect } from 'react';
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

  const DEEPSEEK_API_KEY = "sk-428130307ade4e22bd2b44db21124da7";

  // ============================================
  // TRANSLATION FUNCTIONS (Para sa BOTH languages)
  // ============================================
  
  const translateToSpanish = async (text) => {
    if (!text || text.trim() === '') return '';
    
    try {
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'tl',
          target: 'es',
          format: 'text'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.translatedText) {
          return data.translatedText;
        }
      }
      throw new Error('API failed');
      
    } catch (error) {
      // Fallback dictionary for Spanish
      const fallback = {
        'kamusta': 'cómo estás',
        'kumusta': 'cómo estás',
        'salamat': 'gracias',
        'mahal': 'amor',
        'paalam': 'adiós',
        'kape': 'café',
        'tubig': 'agua',
        'kain': 'comer',
        'tulog': 'dormir',
        'masaya': 'feliz',
        'malungkot': 'triste',
        'gutom': 'hambre',
        'ako': 'yo',
        'ikaw': 'tú',
        'ka': 'tú',
        'siya': 'él/ella',
        'tayo': 'nosotros',
        'sila': 'ellos',
      };
      
      const lowerText = text.toLowerCase();
      for (const [key, value] of Object.entries(fallback)) {
        if (lowerText.includes(key)) {
          return value;
        }
      }
      return text;
    }
  };

  const translateToEnglish = async (text) => {
    if (!text || text.trim() === '') return '';
    
    try {
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'tl',
          target: 'en',
          format: 'text'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.translatedText) {
          return data.translatedText;
        }
      }
      throw new Error('API failed');
      
    } catch (error) {
      // Fallback dictionary for English
      const fallback = {
        'kamusta': 'how are you',
        'kumusta': 'how are you',
        'salamat': 'thank you',
        'mahal': 'love',
        'paalam': 'goodbye',
        'kape': 'coffee',
        'tubig': 'water',
        'kain': 'eat',
        'tulog': 'sleep',
        'masaya': 'happy',
        'malungkot': 'sad',
        'gutom': 'hungry',
        'ako': 'i',
        'ikaw': 'you',
        'ka': 'you',
        'siya': 'he/she',
        'tayo': 'we',
        'sila': 'they',
      };
      
      const lowerText = text.toLowerCase();
      for (const [key, value] of Object.entries(fallback)) {
        if (lowerText.includes(key)) {
          return value;
        }
      }
      return text;
    }
  };

  // ============================================
  // DEEPSEEK AI FUNCTION
  // ============================================
  
  const callDeepSeek = async (message, targetLang) => {
    try {
      const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a friendly AI assistant. The user speaks Tagalog. You must respond ONLY in ${languageName}. Keep responses short (1-2 sentences). Be natural and engaging.`
            },
            {
              role: 'user',
              content: `User said in Tagalog: "${message}". Respond in ${languageName} naturally:`
            }
          ],
          max_tokens: 100,
          temperature: 0.8
        })
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      }
      
      throw new Error('Invalid response');
      
    } catch (error) {
      console.error('DeepSeek Error:', error);
      const fallbackResponses = {
        spanish: [
          'Lo siento, estoy teniendo problemas técnicos. ¿Puedes repetir?',
          '¡Interesante! ¿Puedes contarme más?',
          'Gracias por compartir. ¿Algo más?'
        ],
        english: [
          "Sorry, I'm having technical issues. Can you repeat?",
          "Interesting! Can you tell me more?",
          "Thanks for sharing. Anything else?"
        ]
      };
      const fallbackList = fallbackResponses[targetLang];
      const randomIndex = Math.floor(Math.random() * fallbackList.length);
      return fallbackList[randomIndex];
    }
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
    console.log(`Speaking ${langType}:`, text);
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

  const stopRecordingAndProcess = async () => {
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
    const spanishTrans = await translateToSpanish(finalMessage);
    const englishTrans = await translateToEnglish(finalMessage);
    
    setSpanishTranslation(spanishTrans);
    setEnglishTranslation(englishTrans);
    
    // Get AI response based on selected language
    const aiResponse = await callDeepSeek(finalMessage, language);
    setAiReply(aiResponse);
    
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
        
        <p className="subtitle">Speak Tagalog • See BOTH Spanish & English Translations • AI Response</p>
        
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
          
          <button className="btn-stop" onClick={stopRecordingAndProcess} disabled={!isRecording || isProcessing}>
            <span className="btn-icon">⏹️</span>
            STOP & TRANSLATE
          </button>
        </div>
        
        <div className="voice-group">
          <button className="btn-voice" onClick={() => speakText(aiReply, language)} disabled={!aiReply}>
            <span className="btn-icon">🔊</span>
            HEAR AI RESPONSE ({language === 'spanish' ? 'SPANISH' : 'ENGLISH'})
          </button>
          <button className="btn-voice" onClick={() => speakText(userMessage, 'tagalog')} disabled={!userMessage}>
            <span className="btn-icon">🗣️</span>
            REPEAT TAGALOG
          </button>
        </div>
        
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>{isRecording ? 'Recording... Speak clearly' : isProcessing ? 'Translating to Spanish & English...' : ''}</span>
          </div>
        )}
        
        <div className="results">
          <div className="result-card tagalog">
            <div className="result-header">
              <span className="result-icon">🇵🇭</span>
              <span>📝 Sinabi mo (Tagalog)</span>
            </div>
            <div className="result-content">{userMessage || 'Click START MIC and speak Tagalog...'}</div>
          </div>
          
          {showTranslation && (
            <>
              <div className="result-card translation spanish fade-in">
                <div className="result-header">
                  <span className="result-icon">🇪🇸</span>
                  <span>🌍 Spanish Translation</span>
                  <button className="mini-play" onClick={() => speakText(spanishTranslation, 'spanish')}>🔊</button>
                </div>
                <div className="result-content">{spanishTranslation || 'Translation failed'}</div>
              </div>
              
              <div className="result-card translation english fade-in">
                <div className="result-header">
                  <span className="result-icon">🇺🇸</span>
                  <span>🌍 English Translation</span>
                  <button className="mini-play" onClick={() => speakText(englishTranslation, 'english')}>🔊</button>
                </div>
                <div className="result-content">{englishTranslation || 'Translation failed'}</div>
              </div>
              
              <div className="result-card ai-response fade-in">
                <div className="result-header">
                  <span className="result-icon">🤖</span>
                  <span>AI Response ({language === 'spanish' ? 'Spanish' : 'English'})</span>
                  <button className="mini-play" onClick={() => speakText(aiReply, language)}>🔊</button>
                </div>
                <div className="result-content">{aiReply}</div>
              </div>
            </>
          )}
        </div>
        
        <div className="dictionary-preview">
          <h4>📖 Paano gamitin:</h4>
          <div className="word-grid">
            <span>1. I-click ang START MIC</span>
            <span>2. Magsalita ng TAGALOG (hal: "Kamusta ka?")</span>
            <span>3. I-click STOP & TRANSLATE</span>
            <span>4. Makikita mo ang SPANISH at ENGLISH translation!</span>
            <span>5. Pindutin ang 🔊 para marinig ang translation</span>
          </div>
        </div>
        
        <div className="footer">
          <p>🎤 AI Voice Translator • Tagalog → Spanish & English • Dual Translation • Free</p>
        </div>
      </div>
    </div>
  );
}

export default App;