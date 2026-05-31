import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [spanishTranslation, setSpanishTranslation] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // DeepSeek API Key
  const DEEPSEEK_API_KEY = "sk-2fd08f27f26c4384aba1e32dcdf6533e";

  // ============================================
  // DEEPSEEK TRANSLATION FUNCTION
  // ============================================
  
  const translateWithDeepSeek = async (text, targetLang) => {
    if (!text || text.trim() === '') return '';
    
    const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
    
    try {
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
              content: `You are a translator. Translate the following Tagalog text to ${languageName}. Return ONLY the translation, nothing else. No explanations.`
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
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      return text;
      
    } catch (error) {
      console.error('DeepSeek Translation Error:', error);
      return text;
    }
  };

  // ============================================
  // DEEPSEEK AI RESPONSE FUNCTION
  // ============================================
  
  const getAIResponse = async (text, targetLang) => {
    const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
    
    try {
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
      console.error('AI Response Error:', error);
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
    
    accumulatedTextRef.current = '';
    setUserMessage('');
    setSpanishTranslation('');
    setEnglishTranslation('');
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
      alert('Microphone error. Please check permissions.');
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
    
    const message = accumulatedTextRef.current.trim();
    if (!message) {
      setUserMessage('No speech detected. Try again.');
      setIsProcessing(false);
      return;
    }
    
    setUserMessage(message);
    
    // Translate using DeepSeek
    const spanish = await translateWithDeepSeek(message, 'spanish');
    const english = await translateWithDeepSeek(message, 'english');
    
    setSpanishTranslation(spanish);
    setEnglishTranslation(english);
    
    // Get AI response
    const ai = await getAIResponse(message, 'spanish');
    setAiResponse(ai);
    
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
        
        <p className="subtitle">Magsalita ng Tagalog • DeepSeek AI Translation • Voice Output</p>
        
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
            <span>{isRecording ? '🔴 Nakikinig...' : '🔄 DeepSeek AI translating...'}</span>
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
          
          {showTranslation && (
            <>
              <div className="result-card spanish">
                <div className="result-header">
                  <span className="result-icon">🇪🇸</span>
                  <span>🌍 SPANISH TRANSLATION</span>
                  <button className="mini-play" onClick={() => speakText(spanishTranslation, 'spanish')}>
                    🔊 HEAR SPANISH
                  </button>
                </div>
                <div className="result-content">{spanishTranslation}</div>
              </div>
              
              <div className="result-card english">
                <div className="result-header">
                  <span className="result-icon">🇺🇸</span>
                  <span>🌍 ENGLISH TRANSLATION</span>
                  <button className="mini-play" onClick={() => speakText(englishTranslation, 'english')}>
                    🔊 HEAR ENGLISH
                  </button>
                </div>
                <div className="result-content">{englishTranslation}</div>
              </div>
              
              <div className="result-card ai-response fade-in">
                <div className="result-header">
                  <span className="result-icon">🤖</span>
                  <span>AI RESPONSE (DeepSeek)</span>
                  <button className="mini-play" onClick={() => speakText(aiResponse, 'spanish')}>
                    🔊 HEAR AI
                  </button>
                </div>
                <div className="result-content">{aiResponse}</div>
              </div>
            </>
          )}
        </div>
        
        <div className="footer">
          <p>🎤 Powered by DeepSeek AI • Translation + AI Response • Free</p>
        </div>
      </div>
    </div>
  );
}

export default App;