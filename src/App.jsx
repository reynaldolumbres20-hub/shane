import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  
  // Performance: Cache DOM elements and use refs to prevent re-renders
  const abortControllerRef = useRef(null);
  const processingTimeoutRef = useRef(null);
  const speechTimeoutRef = useRef(null);

  // GROQ API KEY
  const GROQ_API_KEY = "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";

  // ============================================
  // GROQ TRANSLATION (OPTIMIZED)
  // ============================================
  
  const translateWithGroq = useCallback(async (text, targetLang) => {
    if (!text || text.trim() === '') return '';
    
    const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
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
        }),
        signal: abortControllerRef.current.signal
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
      if (error.name === 'AbortError') {
        console.log('Translation request cancelled');
        return text;
      }
      console.error('Groq Translation Error:', error);
      setError('Translation failed.');
      return text;
    }
  }, []);

  // ============================================
  // GROQ AI RESPONSE (OPTIMIZED)
  // ============================================
  
  const getGroqAIResponse = useCallback(async (text, targetLang) => {
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
  }, []);

  // ============================================
  // SPEECH FUNCTIONS (OPTIMIZED)
  // ============================================
  
  const speakText = useCallback((text, langType) => {
    if (!text || text.trim() === '') return;
    
    // Clear previous speech timeout
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Small delay to ensure clean state
    speechTimeoutRef.current = setTimeout(() => {
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
    }, 50);
  }, []);

  // ============================================
  // VOICE PROCESSING (OPTIMIZED)
  // ============================================
  
  const processVoiceInput = useCallback(async (text) => {
    // Clear any pending processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    setIsProcessing(true);
    setError('');
    
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      processingTimeoutRef.current = setTimeout(async () => {
        try {
          // Run translations in parallel for better performance
          const [translated, ai] = await Promise.all([
            translateWithGroq(text, selectedLanguage),
            getGroqAIResponse(text, selectedLanguage)
          ]);
          
          // Batch state updates to prevent multiple re-renders
          setTranslation(translated);
          setAiResponse(ai);
          
          // Auto-speak the AI response with smooth delay
          if (ai) {
            setTimeout(() => speakText(ai, selectedLanguage), 300);
          }
          
        } catch (err) {
          setError('Translation failed. Please try again.');
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      }, 10);
    });
  }, [selectedLanguage, translateWithGroq, getGroqAIResponse, speakText]);

  // ============================================
  // VOICE RECOGNITION (OPTIMIZED)
  // ============================================
  
  const startRecording = useCallback(() => {
    // Check for Speech Recognition API
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert('Voice recognition not supported. Please use Chrome browser.');
      return;
    }
    
    // Cancel any ongoing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch(e) {}
    }
    
    // Reset state with batch update
    setError('');
    setUserMessage('');
    setTranslation('');
    setAiResponse('');
    accumulatedTextRef.current = '';
    
    // Create recognition instance
    const recognition = new SpeechRecognitionAPI();
    
    // Optimized settings for Android
    recognition.lang = 'fil-PH';
    recognition.continuous = false;
    recognition.interimResults = false; // Changed to false for better performance
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      console.log('Recognition started');
      setIsRecording(true);
      setUserMessage('🎤 Listening... Speak now');
    };
    
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      if (result) {
        accumulatedTextRef.current = result;
        setUserMessage(result);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Recognition Error:', event.error);
      setIsRecording(false);
      
      const errorMessages = {
        'not-allowed': 'Microphone access denied. Please allow microphone permission.',
        'audio-capture': 'No microphone detected on your device.',
        'no-speech': 'No speech detected. Please try again.',
        'network': 'Network error. Please check your connection.'
      };
      
      setError(errorMessages[event.error] || `Error: ${event.error}. Please try again.`);
    };
    
    recognition.onend = () => {
      console.log('Recognition ended');
      setIsRecording(false);
      
      if (accumulatedTextRef.current && accumulatedTextRef.current.trim()) {
        processVoiceInput(accumulatedTextRef.current.trim());
      } else if (!accumulatedTextRef.current && !error) {
        setUserMessage('No speech detected. Tap START MIC and speak again.');
      }
    };
    
    // Start recognition with error handling
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start:', err);
      setError('Failed to start voice recognition. Please try again.');
      setIsRecording(false);
    }
  }, [processVoiceInput, error]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Cleanup on unmount - optimized
  useEffect(() => {
    return () => {
      // Cancel all pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear all timeouts
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      
      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
      }
      
      // Cancel speech
      window.speechSynthesis.cancel();
    };
  }, []);

  // Memoize language selector to prevent unnecessary re-renders
  const handleLanguageChange = useCallback((lang) => {
    if (!isRecording && !isProcessing) {
      setSelectedLanguage(lang);
    }
  }, [isRecording, isProcessing]);

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
          <div className="badge">ANDROID • GROQ AI</div>
        </div>
        
        <p className="subtitle">Magsalita ng Tagalog • Awtomatikong isasalin • May boses na sagot</p>
        
        <div className="language-selector">
          <button 
            className={`lang-btn ${selectedLanguage === 'spanish' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('spanish')}
            disabled={isRecording || isProcessing}
          >
            🇪🇸 SPANISH
          </button>
          <button 
            className={`lang-btn ${selectedLanguage === 'english' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('english')}
            disabled={isRecording || isProcessing}
          >
            🇺🇸 ENGLISH
          </button>
        </div>
        
        <div className="control-group">
          <button 
            className={`btn-start ${isRecording ? 'recording' : ''}`} 
            onClick={startRecording} 
            disabled={isRecording || isProcessing}
          >
            🎤 {isRecording ? '🔴 LISTENING...' : 'START MIC'}
          </button>
          
          {isRecording && (
            <button className="btn-stop" onClick={stopRecording}>
              ⏹️ STOP
            </button>
          )}
        </div>
        
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>
              {isRecording 
                ? '🔴 Nakikinig... Magsalita ka ng Tagalog' 
                : '🔄 Ginagamit ang Groq AI...'}
            </span>
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
            <div className="result-content">{userMessage || 'Tap START MIC at magsalita...'}</div>
          </div>
          
          <div className="result-card translation">
            <div className="result-header">
              <span className="result-icon">{selectedLanguage === 'spanish' ? '🇪🇸' : '🇺🇸'}</span>
              <span>{selectedLanguage === 'spanish' ? '🌍 SPANISH TRANSLATION' : '🌍 ENGLISH TRANSLATION'}</span>
              <button className="mini-play" onClick={() => speakText(translation, selectedLanguage)} disabled={!translation}>
                🔊
              </button>
            </div>
            <div className="result-content">{translation || 'Maghintay ng translation...'}</div>
          </div>
          
          <div className="result-card ai-response">
            <div className="result-header">
              <span className="result-icon">🤖</span>
              <span>🤖 AI RESPONSE</span>
              <button className="mini-play" onClick={() => speakText(aiResponse, selectedLanguage)} disabled={!aiResponse}>
                🔊
              </button>
            </div>
            <div className="result-content">{aiResponse || 'Maghintay ng AI sagot...'}</div>
          </div>
        </div>
        
        <div className="footer">
          <p>🎤 Powered by Groq AI (Llama 3) • Tagalog to Spanish/English • LIBRE</p>
          <p style={{ fontSize: '11px', marginTop: '5px' }}>
            📱 Android: Pindutin START MIC → Magsalita → Awtomatikong magta-translate at sasagot ang AI
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
