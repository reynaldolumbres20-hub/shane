import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "sk-428130307ade4e22bd2b44db21124da7";

  // Translation function
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

  // DeepSeek AI function - Fixed
  const getDeepSeekResponse = async (userText, targetLang) => {
    try {
      setIsThinking(true);
      setError('');
      
      const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
      
      console.log('Calling DeepSeek API...');
      
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
              content: `User said in Tagalog: "${userText}". Respond in ${languageName} (one short sentence):`
            }
          ],
          max_tokens: 60,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      throw new Error('Invalid response format');
      
    } catch (error) {
      console.error('DeepSeek Error:', error);
      setError(error.message);
      
      // Fallback responses kung offline si DeepSeek
      const fallbackResponses = {
        spanish: [
          '¡Hola! ¿Cómo estás?',
          '¡Qué interesante! Cuéntame más.',
          '¡Gracias por compartir!',
          '¿En qué más puedo ayudarte?',
          '¡Excelente! Sigue adelante.'
        ],
        english: [
          'Hello! How are you?',
          'That\'s interesting! Tell me more.',
          'Thanks for sharing!',
          'How else can I help you?',
          'Excellent! Keep going.'
        ]
      };
      
      const fallbackList = fallbackResponses[targetLang];
      const randomIndex = Math.floor(Math.random() * fallbackList.length);
      return fallbackList[randomIndex];
      
    } finally {
      setIsThinking(false);
    }
  };

  // Voice Recognition - Fixed for mobile
  const startListening = () => {
    // Clear previous messages
    setUserMessage('');
    setTranslatedMessage('');
    setAiReply('');
    setError('');
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Voice recognition not supported. Please use Google Chrome on Android!');
      return;
    }
    
    // Cancel any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch(e) {}
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'tl-PH';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      console.log('Recognition started');
      setIsListening(true);
      setUserMessage('🎤 Nakikinig... magsalita ka na');
    };
    
    recognition.onresult = async (event) => {
      const tagalogText = event.results[0][0].transcript;
      console.log('Recognized:', tagalogText);
      setUserMessage(tagalogText);
      setIsListening(false);
      
      try {
        // Translate
        const targetLang = language === 'spanish' ? 'es' : 'en';
        const translated = await translateText(tagalogText, targetLang);
        setTranslatedMessage(translated);
        
        // Get AI response
        const aiResponse = await getDeepSeekResponse(tagalogText, language);
        setAiReply(aiResponse);
        
        // Text to speech (try on mobile)
        try {
          if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(aiResponse);
            speech.lang = language === 'spanish' ? 'es-ES' : 'en-US';
            speech.rate = 0.9;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(speech);
          }
        } catch(e) {
          console.log('Speech synthesis error:', e);
        }
        
      } catch (err) {
        console.error('Processing error:', err);
        setError('Error processing your request');
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setUserMessage('❌ Hindi pinayagan ang microphone. I-click ang Allow sa browser!');
      } else if (event.error === 'no-speech') {
        setUserMessage('❌ Walang narinig. Pindutin ang mic at magsalita nang malinaw.');
      } else {
        setUserMessage(`❌ Error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      console.log('Recognition ended');
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
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
            disabled={isThinking}
          >
            {isListening ? '🔴 Nakikinig...' : isThinking ? '🤖 Nag-iisip ang AI...' : '🎤 I-click para Magsalita'}
          </button>
          <p className="mic-hint">
            💡 I-click ang button → Magsalita ng TAGALOG → Hintayin ang sagot
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            ⚠️ Error: {error}
          </div>
        )}
        
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
            <div className="message-label">🤖 Sagot ng AI:</div>
            <div className="message-text">{aiReply || 'I-click ang mic para magsimula'}</div>
          </div>
        </div>
        
        <div className="instructions">
          <h3>📖 Paano gamitin:</h3>
          <ol>
            <li>Piliin kung Spanish o English</li>
            <li><strong>I-CLICK</strong> ang mic button (isang beses lang)</li>
            <li><strong>I-ALLOW</strong> ang microphone permission</li>
            <li>Magsalita ng <strong>TAGALOG</strong> (maikli lang, 1-2 pangungusap)</li>
            <li>Hintaying mag-translate at sumagot ang AI</li>
          </ol>
          <p className="note">🎤 Android + Chrome = Best Experience! Kapag may error sa AI, may fallback responses ang system.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
