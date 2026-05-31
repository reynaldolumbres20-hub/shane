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
  
  const { text, sourceLang, targetLang } = req.body;
  
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang || 'tl',
        target: targetLang || 'en',
        format: 'text'
      })
    });
    
    const data = await response.json();
    return res.status(200).json({ translatedText: data.translatedText });
    
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Translation failed', translatedText: text });
  }
}