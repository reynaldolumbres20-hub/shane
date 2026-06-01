import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [translation, setTranslation] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('spanish'); // 'spanish' or 'english'
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // GEMINI API KEY
  const GEMINI_API_KEY = "AQ.Ab8RN6Jp0dO4qEuRTIzGvgPCJFJyu-hmCsv9-LfGUnBDIdOJH4";

  // ============================================
  // GEMINI TRANSLATION FUNCTION
  // ============================================
  
  const translateWithGemini = async (text, targetLang) => {
    if (!text || text.trim() === '') return '';
    
    const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate this Tagalog text to ${languageName}. Return ONLY the translation, nothing else. No explanations, no quotes. Tagalog text: "${text}"`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200
          }
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Gemini Error:', data.error);
        setError(`API Error: ${data.error.message}`);
        return `[Error: ${text}]`;
      }
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let translation = data.candidates[0].content.parts[0].text;
        translation = translation.replace(/^["']|["']$/g, '');
        return translation;
      }
      
      return text;
      
    } catch (error) {
      console.error('Gemini Translation Error:', error);
      setError('Translation failed. Check API key.');
      return text;
    }
  };

  // ============================================
  // GEMINI AI RESPONSE FUNCTION
  // ============================================
  
  const getGeminiAIResponse = async (text, targetLang) => {
    const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a friendly AI assistant. Respond ONLY in ${languageName}. Keep response very short (max 15 words). Be natural and friendly. User said in Tagalog: "${text}". Respond directly:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 60
          }
        })
      });
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      
      return targetLang === 'spanish' ? '¡Hola! ¿Cómo estás?' : 'Hello! How are you?';
      
    } catch (error) {
      console.error('Gemini AI Error:', error);
      return targetLang === 'spanish' ? '¡Hola! ¿Cómo estás?' : 'Hello! How are you?';
    }
  };

  // ============================================
  // SPEECH FUNCTIONS
  // ============================================
  
  const speakText = (text, langType) => {
    if (!text || text.trim() === '') return;
    
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
    
    setError('');
    accumulatedTextRef.current = '';
    setUserMessage('');
    setTranslation('');
    setAiResponse('');
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
      setError('Microphone error. Please check permissions.');
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopAndProcess = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setIsProcessing(true);
    setError('');
    
    const message = accumulatedTextRef.current.trim();
    if (!message) {
      setUserMessage('No speech detected. Try again.');
      setIsProcessing(false);
      return;
    }
    
    setUserMessage(message);
    
    try {
      // Translate to selected language (Spanish or English)
      const translatedText = await translateWithGemini(message, selectedLanguage);
      setTranslation(translatedText);
      
      // Get AI response in selected language
      const ai = await getGeminiAIResponse(message, selectedLanguage);
      setAiResponse(ai);
      
      setShowTranslation(true);
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error(err);
    }
    
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
          <div className="badge">GEMINI AI</div>
        </div>
        
        <p className="subtitle">Magsalita ng Tagalog • Piliin ang lengguwahe • Voice Output</p>
        
        {/* LANGUAGE SELECTION BUTTONS */}
        <div className="language-selector">
          <button 
            className={`lang-btn ${selectedLanguage === 'spanish' ? 'active' : ''}`}
            onClick={() => setSelectedLanguage('spanish')}
            disabled={isRecording || isProcessing}
          >
            🇪🇸 SPANISH
          </button>
          <button 
            className={`lang-btn ${selectedLanguage === 'english' ? 'active' : ''}`}
            onClick={() => setSelectedLanguage('english')}
            disabled={isRecording || isProcessing}
          >
            🇺🇸 ENGLISH
          </button>
        </div>
        
        <div className="control-group">
          <button className={`btn-start ${isRecording ? 'recording' : ''}`} onClick={startRecording} disabled={isRecording || isProcessing}>
            🎤 {isRecording ? 'RECORDING...' : 'START MIC'}
          </button>
          
          <button className="btn-stop" onClick={stopAndProcess} disabled={!isRecording || isProcessing}>
            ⏹️ STOP & TRANSLATE
          </button>
        </div>
        
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>{isRecording ? '🔴 Nakikinig...' : '🔄 Gemini AI translating...'}</span>
          </div>
        )}
        
        {error && (
          <div className="status" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
            <span>⚠️ {error}</span>
          </div>
        )}
        
        <div className="results">
          {/* SINABI MO BOX */}
          <div className="result-card tagalog">
            <div className="result-header">
              <span className="result-icon">🇵🇭</span>
              <span>📝 SINABI MO (TAGALOG)</span>
            </div>
            <div className="result-content">{userMessage || 'Click START MIC...'}</div>
          </div>
          
          {/* TRANSLATION BOX - DITO LALABAS ANG TRANSLATION */}
          {showTranslation && (
            <>
              <div className="result-card translation">
                <div className="result-header">
                  <span className="result-icon">{selectedLanguage === 'spanish' ? '🇪🇸' : '🇺🇸'}</span>
                  <span>{selectedLanguage === 'spanish' ? '🌍 SPANISH TRANSLATION' : '🌍 ENGLISH TRANSLATION'}</span>
                  <button className="mini-play" onClick={() => speakText(translation, selectedLanguage)}>
                    🔊 HEAR {selectedLanguage === 'spanish' ? 'SPANISH' : 'ENGLISH'}
                  </button>
                </div>
                <div className="result-content">{translation}</div>
              </div>
              
              {/* AI RESPONSE BOX */}
              <div className="result-card ai-response fade-in">
                <div className="result-header">
                  <span className="result-icon">🤖</span>
                  <span>AI RESPONSE (Gemini)</span>
                  <button className="mini-play" onClick={() => speakText(aiResponse, selectedLanguage)}>
                    🔊 HEAR AI
                  </button>
                </div>
                <div className="result-content">{aiResponse}</div>
              </div>
            </>
          )}
        </div>
        
        <div className="footer">
          <p>🎤 Powered by Google Gemini AI • Piliin ang Spanish o English • Libre</p>
        </div>
      </div>
    </div>
  );
}

export default App;
