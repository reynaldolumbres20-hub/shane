import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  const DEEPSEEK_API_KEY = "sk-428130307ade4e22bd2b44db21124da7";

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
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
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

  const translateText = async (text, targetLang) => {
    try {
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
      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // FIXED SPEECH FUNCTION - Gumagana na ito!
  const speakText = (text, lang) => {
    if (!text || text.trim() === '') {
      console.log('No text to speak');
      return;
    }
    
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      alert('Your browser does not support text-to-speech. Please use Chrome.');
      return;
    }
    
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(true);
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    
    // Set language
    if (lang === 'spanish') {
      speech.lang = 'es-ES';
    } else if (lang === 'english') {
      speech.lang = 'en-US';
    } else {
      speech.lang = 'tl-PH';
    }
    
    speech.rate = 0.9;
    speech.pitch = 1.0;
    speech.volume = 1;
    
    // Try to get a better voice
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (lang === 'spanish') {
          const spanishVoice = voices.find(v => v.lang === 'es-ES' || v.lang.startsWith('es'));
          if (spanishVoice) speech.voice = spanishVoice;
        } else if (lang === 'english') {
          const englishVoice = voices.find(v => v.lang === 'en-US');
          if (englishVoice) speech.voice = englishVoice;
        }
      }
    };
    
    // Voices might not be loaded yet
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
    
    speech.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };
    
    speech.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(speech);
    console.log('Speaking:', text, 'in', lang);
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
    
    const translated = await translateText(finalMessage, language);
    setTranslatedMessage(translated);
    
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
        
        <p className="subtitle">Powered by DeepSeek AI • Unlimited Conversations • Natural Responses</p>
        
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
            STOP & PROCESS
          </button>
        </div>
        
        <div className="voice-group">
          <button 
            className="btn-voice" 
            onClick={() => {
              console.log('Hear button clicked, text:', translatedMessage);
              speakText(translatedMessage, language);
            }} 
            disabled={!translatedMessage}
          >
            <span className="btn-icon">🔊</span>
            HEAR {language === 'spanish' ? 'SPANISH' : 'ENGLISH'}
          </button>
          <button 
            className="btn-voice" 
            onClick={() => {
              console.log('Repeat button clicked, text:', userMessage);
              speakText(userMessage, 'tagalog');
            }} 
            disabled={!userMessage}
          >
            <span className="btn-icon">🗣️</span>
            REPEAT TAGALOG
          </button>
        </div>
        
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>{isRecording ? 'Recording... Speak clearly' : isProcessing ? 'Processing with DeepSeek AI...' : ''}</span>
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
                <div className="result-content">{translatedMessage}</div>
                <button className="play-btn" onClick={() => speakText(translatedMessage, language)}>
                  ▶️ Play Audio
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
        
        <div className="footer">
          <p>🎤 AI Voice Translator • Powered by DeepSeek AI • Unlimited & Free</p>
        </div>
      </div>
    </div>
  );
}

export default App;