import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  const DEEPSEEK_API_KEY = "sk-428130307ade4e22bd2b44db21124da7";

  // ============================================
  // TRANSLATION FUNCTION (LIBRE)
  // ============================================
  
  const translateText = async (text, targetLang) => {
    if (!text || text.trim() === '') return '';
    
    try {
      // Try LibreTranslate first
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'tl',
          target: targetLang === 'spanish' ? 'es' : 'en',
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
      console.error('Translation error, using fallback:', error);
      // Fallback dictionary
      const fallbackDict = {
        'kamusta': targetLang === 'spanish' ? 'cómo estás' : 'how are you',
        'kumusta': targetLang === 'spanish' ? 'cómo estás' : 'how are you',
        'salamat': targetLang === 'spanish' ? 'gracias' : 'thank you',
        'mahal': targetLang === 'spanish' ? 'amor' : 'love',
        'paalam': targetLang === 'spanish' ? 'adiós' : 'goodbye',
        'kape': targetLang === 'spanish' ? 'café' : 'coffee',
        'tubig': targetLang === 'spanish' ? 'agua' : 'water',
        'kain': targetLang === 'spanish' ? 'comer' : 'eat',
        'tulog': targetLang === 'spanish' ? 'dormir' : 'sleep',
        'masaya': targetLang === 'spanish' ? 'feliz' : 'happy',
        'malungkot': targetLang === 'spanish' ? 'triste' : 'sad',
        'gutom': targetLang === 'spanish' ? 'hambre' : 'hungry',
      };
      
      const lowerText = text.toLowerCase();
      for (const [key, value] of Object.entries(fallbackDict)) {
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
    setTranslatedMessage('');
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
    
    // Translate the message
    const translated = await translateText(finalMessage, language);
    setTranslatedMessage(translated);
    
    // Get AI response
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
          <div className="badge">DEEPSEEK AI</div>
        </div>
        
        <p className="subtitle">Speak Tagalog • Get Translation • AI Response • Voice Output</p>
        
        <div className="language-selector">
          <button className={`lang-btn ${language === 'spanish' ? 'active' : ''}`} onClick={() => setLanguage('spanish')}>
            🇪🇸 Spanish
          </button>
          <button className={`lang-btn ${language === 'english' ? 'active' : ''}`} onClick={() => setLanguage('english')}>
            🇺🇸 English
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
        
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>{isRecording ? 'Recording... Speak clearly' : isProcessing ? 'Translating & Processing...' : ''}</span>
          </div>
        )}
        
        <div className="results">
          <div className="result-card tagalog">
            <div className="result-header">
              <span className="result-icon">🇵🇭</span>
              <span>Tagalog (You said)</span>
            </div>
            <div className="result-content">{userMessage || 'Click START MIC and speak...'}</div>
          </div>
          
          {showTranslation && (
            <>
              <div className="result-card translation fade-in">
                <div className="result-header">
                  <span className="result-icon">{language === 'spanish' ? '🇪🇸' : '🇺🇸'}</span>
                  <span>Translation to {language === 'spanish' ? 'Spanish' : 'English'}</span>
                </div>
                <div className="result-content">{translatedMessage || 'Translation failed'}</div>
                <button className="play-btn" onClick={() => speakText(translatedMessage, language)}>
                  ▶️ Play Translation Audio
                </button>
              </div>
              
              <div className="result-card ai-response fade-in">
                <div className="result-header">
                  <span className="result-icon">🤖</span>
                  <span>AI Response (DeepSeek)</span>
                </div>
                <div className="result-content">{aiReply}</div>
                <button className="play-btn" onClick={() => speakText(aiReply, language)}>
                  ▶️ Play AI Voice
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="dictionary-preview">
          <h4>📚 How to use:</h4>
          <div className="word-grid">
            <span>1. Click START MIC</span>
            <span>2. Speak Tagalog</span>
            <span>3. Click STOP & TRANSLATE</span>
            <span>4. Click HEAR to listen</span>
          </div>
        </div>
        
        <div className="footer">
          <p>🎤 AI Voice Translator • Translation + AI Response • Free & Unlimited</p>
        </div>
      </div>
    </div>
  );
}

export default App;