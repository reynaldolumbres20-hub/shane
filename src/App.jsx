import React, { useState } from 'react';
import './App.css';

// DEEPSEEK API KEY - Ipasok mo ang iyong API key dito
const DEEPSEEK_API_KEY = "sk-428130307ade4e22bd2b44db21124da7";

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
<<<<<<< HEAD
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Translation gamit ang sarili mong API (sa Vercel)
=======
  const [conversationHistory, setConversationHistory] = useState([]);

  // Translation gamit ang MyMemory API (libre)
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
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
<<<<<<< HEAD
      return data.translatedText || text;
=======
      return data.responseData.translatedText;
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

<<<<<<< HEAD
  // AI Response gamit ang sarili mong API (sa Vercel)
  const getAIResponse = async (userText, targetLang) => {
    try {
      const response = await fetch('/api/chat', {
=======
  // DeepSeek AI - Walang limit sa usapan!
  const getDeepSeekResponse = async (userText, targetLang, history) => {
    try {
      setIsThinking(true);
      
      const languageName = targetLang === 'spanish' ? 'Spanish' : 'English';
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
<<<<<<< HEAD
          message: userText,
          language: targetLang
=======
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a friendly, conversational AI assistant. The user speaks Tagalog but you must respond ONLY in ${languageName}. Keep responses short (1-2 sentences only), natural, and engaging. Ask follow-up questions to keep the conversation going. Be a good friend!`
            },
            ...history.slice(-5),
            {
              role: 'user',
              content: `The user just said in Tagalog: "${userText}". Please respond in ${languageName} naturally.`
            }
          ],
          max_tokens: 100,
          temperature: 0.8
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
        })
      });
      const data = await response.json();
<<<<<<< HEAD
      return data.reply;
=======
      return data.choices[0].message.content;
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
    } catch (error) {
      console.error('DeepSeek Error:', error);
      return targetLang === 'spanish' 
<<<<<<< HEAD
        ? "Lo siento, error técnico. ¿Puedes repetir?"
        : "Sorry, technical error. Can you repeat?";
    }
  };

=======
        ? "Lo siento, tengo un problema técnico. ¿Puedes repetir?"
        : "Sorry, I'm having technical issues. Can you repeat?";
    } finally {
      setIsThinking(false);
    }
  };

  // Voice recognition (Tagalog)
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
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
<<<<<<< HEAD
      setIsThinking(true);
      
      const targetLang = language === 'spanish' ? 'es' : 'en';
      
      // Translate gamit ang sariling API
      const translated = await translateText(tagalogText, language);
      setTranslatedMessage(translated);
      
      // AI response gamit ang sariling API
      const aiResponse = await getAIResponse(tagalogText, language);
      setAiReply(aiResponse);
      setIsThinking(false);
=======
      
      const targetLang = language === 'spanish' ? 'es' : 'en';
      const translated = await translateText(tagalogText, targetLang);
      setTranslatedMessage(translated);
      
      const aiResponse = await getDeepSeekResponse(tagalogText, language, conversationHistory);
      setAiReply(aiResponse);
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: tagalogText },
        { role: 'assistant', content: aiResponse }
      ]);
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
      
      speakText(aiResponse, language);
    };
    
    recognition.onerror = (event) => {
      console.error('Error:', event.error);
      setIsListening(false);
      alert('May error sa microphone. Payagan ang mic access sa browser!');
    };
    
    recognition.start();
  };
  
<<<<<<< HEAD
=======
  // Text to Speech (boses ng AI)
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
  const speakText = (text, lang) => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    
    setIsSpeaking(true);
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.lang = lang === 'spanish' ? 'es-ES' : 'en-US';
    speech.rate = 0.9;
    speech.pitch = 1.0;
    
    speech.onend = () => {
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>🎙️ AI Voice Translator</h1>
<<<<<<< HEAD
        <p className="subtitle">Magsalita ng Tagalog, sasagot ang AI sa Spanish o English - WALANG LIMIT!</p>
=======
        <p className="subtitle">Magsalita ng Tagalog, sasagot ang AI sa Spanish o English</p>
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
        
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
<<<<<<< HEAD
            <li>Piliin kung Spanish o English</li>
            <li>I-click ang mic button at magsalita ng <strong>TAGALOG</strong></li>
            <li><strong>WALANG LIMIT ANG USAPAN!</strong> DeepSeek AI + LibreTranslate</li>
            <li>Sasagot ang AI sa napili mong wika - may boses pa!</li>
          </ol>
          <p className="note">🎤 Libre ito at walang limit sa translation at AI responses!</p>
=======
            <li>Piliin kung Spanish o English ang gusto mong kausapin ng AI</li>
            <li>I-click ang mic button at magsalita ng <strong>TAGALOG</strong></li>
            <li><strong>WALANG LIMIT ANG USAPAN!</strong> DeepSeek AI ang gamit natin</li>
            <li>Sasagot ang AI sa napili mong wika - may boses pa!</li>
            <li>Naalala ng AI ang usapan para natural ang conversation</li>
          </ol>
          <p className="note">💡 Chrome browser gamitin para sa voice features</p>
          <p className="note">🔑 Libre ang DeepSeek - gamit ang iyong API key</p>
>>>>>>> ad75505aec1cdc9adea2e00442abca3364ad05a8
        </div>
      </div>
    </div>
  );
}

export default App;
