import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const recognitionRef = useRef(null);
  const pressTimerRef = useRef(null);

  const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "sk-428130307ade4e22bd2b44db21124da7";

  // Translation
  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tl|${targetLang}`
      );
      const data = await response.json();
      return data.responseData?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // DeepSeek AI
  const getDeepSeekResponse = async (userText, targetLang) => {
    try {
      setIsThinking(true);
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
              content: `You are a friendly AI assistant. Respond ONLY in ${languageName}. Keep responses short (1-2 sentences). Be natural and engaging.`
            },
            {
              role: 'user',
              content: `User said in Tagalog: "${userText}". Respond in ${languageName}:`
            }
          ],
          max_tokens: 100,
          temperature: 0.8
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error('AI Error:', error);
      return targetLang === 'spanish' 
        ? "Lo siento, error técnico. ¿Puedes repetir?"
        : "Sorry, technical error. Can you repeat?";
    } finally {
      setIsThinking(false);
    }
  };

  // Start recording (pindot nang matagal)
  const startRecording = () => {
    // Request microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!SpeechRecognition) {
          alert('Voice recognition not supported. Use Chrome browser!');
          return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.lang = 'tl-PH';
        recognition.continuous = true; // Para tuloy-tuloy ang recording
        recognition.interimResults = true; // Para makita ang sinasabi habang nagsasalita
        
        let finalTranscript = '';
        
        recognition.onresult = (event) => {
          // Kunin ang kasalukuyang sinasabi
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          // Ipakita ang kasalukuyang sinasabi (interim)
          setUserMessage(finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
          console.error('Recognition error:', event.error);
        };
        
        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
        setUserMessage('🎤 Nakikinig...');
      })
      .catch(err => {
        console.error('Mic permission denied:', err);
        alert('Please allow microphone access!');
      });
  };

  // Stop recording at i-process (binitawan ang pindot)
  const stopRecordingAndProcess = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    
    const finalMessage = userMessage.replace('🎤 Nakikinig...', '').trim();
    if (!finalMessage) {
      setUserMessage('Walang narinig. Pindutin nang matagal ang mic at magsalita.');
      return;
    }
    
    setUserMessage(finalMessage);
    
    // Process the recorded message
    const targetLang = language === 'spanish' ? 'es' : 'en';
    const translated = await translateText(finalMessage, targetLang);
    setTranslatedMessage(translated);
    
    const aiResponse = await getDeepSeekResponse(finalMessage, language);
    setAiReply(aiResponse);
    
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', content: finalMessage },
      { role: 'assistant', content: aiResponse }
    ]);
    
    speakText(aiResponse, language);
  };

  // Text to Speech
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
        <p className="subtitle">Pindutin nang matagal ang mic → Magsalita ng Tagalog → Bitawan para isalin at sumagot ang AI</p>
        
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
            onMouseDown={startRecording}
            onMouseUp={stopRecordingAndProcess}
            onTouchStart={startRecording}
            onTouchEnd={stopRecordingAndProcess}
            disabled={isThinking}
          >
            {isListening ? '🔴 Nagsasalita ka... (bitawan para isalin)' : isThinking ? '🤖 Nag-iisip ang AI...' : '🎤 PINDUTIN nang matagal at magsalita'}
          </button>
          <p className="mic-hint">💡 Pindutin at hold → Magsalita ng Tagalog → Bitawan</p>
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
          
          <div className="message-card ai">
            <div className="message-label">🤖 Sagot ng AI {isSpeaking && '(nagsasalita...)'}:</div>
            <div className="message-text">{aiReply || 'Pindutin nang matagal ang mic para magsimula'}</div>
          </div>
        </div>
        
        <div className="instructions">
          <h3>📖 Paano gamitin (Hold to Talk):</h3>
          <ol>
            <li>Piliin kung Spanish o English</li>
            <li><strong>PINDUTIN nang matagal</strong> ang mic button</li>
            <li>Magsalita ng <strong>TAGALOG</strong> habang nakapindot</li>
            <li><strong>BITAWAN</strong> ang button para i-translate at sumagot ang AI</li>
            <li>Maririnig mo ang sagot ng AI sa napili mong wika!</li>
          </ol>
          <p className="note">🎤 Tulad ito ng walkie-talkie: pindot para magsalita, bitaw para mag-translate!</p>
        </div>
      </div>
    </div>
  );
}

export default App;