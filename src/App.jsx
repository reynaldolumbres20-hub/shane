import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [translation, setTranslation] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // GROQ API KEY - LIBRE (Naka-set na!)
  const GROQ_API_KEY = "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";

  // ============================================
  // GROQ TRANSLATION - LIBRE AT GUMAGANA!
  // ============================================
  
  const translateWithGroq = async (text, targetLang) => {
    if (!text || text.trim() === '') return '';
    
    const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a translator. Translate Tagalog to ${languageName}. Return ONLY the translation, no explanations.`
            },
            {
              role: 'user',
              content: `Translate this Tagalog to ${languageName}: "${text}"`
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Groq Error:', data.error);
        setError(`API Error: ${data.error.message}`);
        return text;
      }
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      return text;
      
    } catch (error) {
      console.error('Groq Translation Error:', error);
      setError('Translation failed.');
      return text;
    }
  };

  // ============================================
  // GROQ AI RESPONSE - LIBRE AT GUMAGANA!
  // ============================================
  
  const getGroqAIResponse = async (text, targetLang) => {
    const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a friendly AI assistant. Respond ONLY in ${languageName}. Keep responses very short (1 sentence only, max 15 words). Be natural and friendly.`
            },
            {
              role: 'user',
              content: `User said in Tagalog: "${text}". Respond in ${languageName} (one short sentence):`
            }
          ],
          max_tokens: 60,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      return targetLang === 'spanish' ? '¡Hola! ¿Cómo estás?' : 'Hello! How are you?';
      
    } catch (error) {
      console.error('Groq AI Error:', error);
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
      const translated = await translateWithGroq(message, selectedLanguage);
      setTranslation(translated);
      
      const ai = await getGroqAIResponse(message, selectedLanguage);
      setAiResponse(ai);
      
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
          <div className="badge"></div>
        </div>
        
        <p className="subtitle">Magsalita ng Tagalog • Piliin ang lengguwahe • Voice Output</p>
        
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
            <span>{isRecording ? '🔴 Nakikinig...' : '🔄 Groq AI translating...'}</span>
          </div>
        )}
        
        {error && (
          <div className="status" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
            <span>⚠️ {error}</span>
          </div>
        )}
        
        <div className="results">
          <div className="result-card tagalog">
            <div className="result-header">
              <span className="result-icon">🇵🇭</span>
              <span>📝 SINABI MO (TAGALOG)</span>
            </div>
            <div className="result-content">{userMessage || 'Click START MIC...'}</div>
          </div>
          
          <div className="result-card translation">
            <div className="result-header">
              <span className="result-icon">{selectedLanguage === 'spanish' ? '🇪🇸' : '🇺🇸'}</span>
              <span>{selectedLanguage === 'spanish' ? '🌍 SPANISH TRANSLATION' : '🌍 ENGLISH TRANSLATION'}</span>
              <button className="mini-play" onClick={() => speakText(translation, selectedLanguage)} disabled={!translation}>
                🔊 HEAR
              </button>
            </div>
            <div className="result-content">{translation || 'Click STOP & TRANSLATE...'}</div>
          </div>
          
          <div className="result-card ai-response">
            <div className="result-header">
              <span className="result-icon">🤖</span>
              <span>🤖 AI RESPONSE</span>
              <button className="mini-play" onClick={() => speakText(aiResponse, selectedLanguage)} disabled={!aiResponse}>
                🔊 HEAR AI
              </button>
            </div>
            <div className="result-content">{aiResponse || 'AI response will appear here...'}</div>
          </div>
        </div>
        
        <div className="footer">
          <p>🎤 Powered by Groq AI (Llama 3) • Piliin ang Spanish o English • LIBRE</p>
        </div>
      </div>
    </div>
  );
}

export default App;
