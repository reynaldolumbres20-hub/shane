export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { message, language } = req.body;
  // GAMITIN ANG ENVIRONMENT VARIABLE (hindi hardcoded)
  const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;
  
  const languageName = language === 'spanish' ? 'Spanish' : 'English';
  
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
            content: `You are a friendly AI assistant. Respond ONLY in ${languageName}. Keep responses short (1-2 sentences). Be natural and engaging.`
          },
          {
            role: 'user',
            content: `User said in Tagalog: "${message}". Respond in ${languageName}:`
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });
    
    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      throw new Error('Invalid response');
    }
    
  } catch (error) {
    console.error('DeepSeek error:', error);
    return res.status(500).json({ 
      reply: language === 'spanish' 
        ? 'Lo siento, error técnico. ¿Puedes repetir?'
        : 'Sorry, technical error. Can you repeat?'
    });
  }
}