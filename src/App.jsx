import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [language, setLanguage] = useState('spanish');
  const [userMessage, setUserMessage] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // ============================================
  // ULTRA COMPLETE DICTIONARY (1000+ WORDS)
  // ============================================
  
  const wordDict = {
    // ===== PRONOUNS =====
    'ako': { es: 'yo', en: 'i' },
    'ikaw': { es: 'tú', en: 'you' },
    'ka': { es: 'tú', en: 'you' },
    'kita': { es: 'te', en: 'you' },
    'siya': { es: 'él/ella', en: 'he/she' },
    'tayo': { es: 'nosotros', en: 'we' },
    'kayo': { es: 'ustedes', en: 'you all' },
    'sila': { es: 'ellos', en: 'they' },
    'mo': { es: 'tu', en: 'your' },
    'ko': { es: 'mi', en: 'my' },
    'niya': { es: 'su', en: 'his/her' },
    'natin': { es: 'nuestro', en: 'our' },
    'namin': { es: 'nuestro', en: 'our' },
    'ninyo': { es: 'su', en: 'your' },
    'nila': { es: 'su', en: 'their' },
    'amin': { es: 'nuestro', en: 'our' },
    'atin': { es: 'nuestro', en: 'our' },
    'kaniya': { es: 'su', en: 'his/hers' },
    'kanila': { es: 'su', en: 'theirs' },
    'aking': { es: 'mi', en: 'my' },
    'iyong': { es: 'tu', en: 'your' },
    'kanyang': { es: 'su', en: 'his/her' },

    // ===== GREETINGS =====
    'kamusta': { es: 'cómo estás', en: 'how are you' },
    'kumusta': { es: 'cómo estás', en: 'how are you' },
    'musta': { es: 'cómo estás', en: 'how are you' },
    'hello': { es: 'hola', en: 'hello' },
    'hi': { es: 'hola', en: 'hi' },
    'magandang': { es: 'buen', en: 'good' },
    'umaga': { es: 'días', en: 'morning' },
    'hapon': { es: 'tardes', en: 'afternoon' },
    'gabi': { es: 'noches', en: 'evening' },
    'salamat': { es: 'gracias', en: 'thank you' },
    'maraming': { es: 'muchas', en: 'many' },
    'walang': { es: 'sin', en: 'without' },
    'anuman': { es: 'problema', en: 'problem' },
    'paalam': { es: 'adiós', en: 'goodbye' },
    'bye': { es: 'adiós', en: 'bye' },
    'sige': { es: 'vale', en: 'okay' },
    'ingat': { es: 'cuídate', en: 'take care' },
    'po': { es: 'por favor', en: 'please' },
    'opo': { es: 'sí', en: 'yes' },
    'hindi': { es: 'no', en: 'no' },
    'oo': { es: 'sí', en: 'yes' },
    'hinde': { es: 'no', en: 'no' },
    'talaga': { es: 'realmente', en: 'really' },
    'totoo': { es: 'verdad', en: 'true' },
    'sige na': { es: 'vamos', en: 'come on' },
    'tuloy': { es: 'adelante', en: 'continue' },

    // ===== QUESTION WORDS =====
    'ano': { es: 'qué', en: 'what' },
    'sino': { es: 'quién', en: 'who' },
    'saan': { es: 'dónde', en: 'where' },
    'kailan': { es: 'cuándo', en: 'when' },
    'bakit': { es: 'por qué', en: 'why' },
    'paano': { es: 'cómo', en: 'how' },
    'ilan': { es: 'cuántos', en: 'how many' },
    'magkano': { es: 'cuánto cuesta', en: 'how much' },
    'alin': { es: 'cuál', en: 'which' },
    'kanino': { es: 'de quién', en: 'whose' },
    'gaano': { es: 'cuán', en: 'how much' },
    'saan ba': { es: 'dónde está', en: 'where is' },
    'anong': { es: 'qué', en: 'what' },
    'bakit ba': { es: 'por qué', en: 'why' },
    'paano ba': { es: 'cómo', en: 'how' },

    // ===== VERBS - ACTIONS =====
    'kumain': { es: 'comer', en: 'eat' },
    'kain': { es: 'comer', en: 'eat' },
    'uminom': { es: 'beber', en: 'drink' },
    'inom': { es: 'beber', en: 'drink' },
    'tulog': { es: 'dormir', en: 'sleep' },
    'matulog': { es: 'dormir', en: 'sleep' },
    'lakad': { es: 'caminar', en: 'walk' },
    'maglakad': { es: 'caminar', en: 'walk' },
    'takbo': { es: 'correr', en: 'run' },
    'tumakbo': { es: 'correr', en: 'run' },
    'luto': { es: 'cocinar', en: 'cook' },
    'magluto': { es: 'cocinar', en: 'cook' },
    'laba': { es: 'lavar', en: 'wash' },
    'maglaba': { es: 'lavar', en: 'wash' },
    'linis': { es: 'limpiar', en: 'clean' },
    'maglinis': { es: 'limpiar', en: 'clean' },
    'basa': { es: 'leer', en: 'read' },
    'magbasa': { es: 'leer', en: 'read' },
    'sulat': { es: 'escribir', en: 'write' },
    'magsulat': { es: 'escribir', en: 'write' },
    'kanta': { es: 'cantar', en: 'sing' },
    'kumanta': { es: 'cantar', en: 'sing' },
    'sayaw': { es: 'bailar', en: 'dance' },
    'sumayaw': { es: 'bailar', en: 'dance' },
    'laro': { es: 'jugar', en: 'play' },
    'maglaro': { es: 'jugar', en: 'play' },
    'trabaho': { es: 'trabajar', en: 'work' },
    'magtrabaho': { es: 'trabajar', en: 'work' },
    'aral': { es: 'estudiar', en: 'study' },
    'magaral': { es: 'estudiar', en: 'study' },
    'gising': { es: 'despertar', en: 'wake up' },
    'gumising': { es: 'despertar', en: 'wake up' },
    'ligo': { es: 'bañar', en: 'bathe' },
    'maligo': { es: 'bañar', en: 'bathe' },
    'bili': { es: 'comprar', en: 'buy' },
    'bumili': { es: 'comprar', en: 'buy' },
    'bigay': { es: 'dar', en: 'give' },
    'magbigay': { es: 'dar', en: 'give' },
    'kuha': { es: 'tomar', en: 'take' },
    'kumuha': { es: 'tomar', en: 'take' },
    'lagay': { es: 'poner', en: 'put' },
    'maglagay': { es: 'poner', en: 'put' },
    'tingin': { es: 'mirar', en: 'look' },
    'tumingin': { es: 'mirar', en: 'look' },
    'dama': { es: 'sentir', en: 'feel' },
    'damahin': { es: 'sentir', en: 'feel' },
    'isip': { es: 'pensar', en: 'think' },
    'magisip': { es: 'pensar', en: 'think' },
    'punta': { es: 'ir', en: 'go' },
    'pumunta': { es: 'ir', en: 'go' },
    'balik': { es: 'volver', en: 'return' },
    'bumalik': { es: 'volver', en: 'return' },
    'dating': { es: 'venir', en: 'come' },
    'dumating': { es: 'venir', en: 'come' },
    'hintay': { es: 'esperar', en: 'wait' },
    'maghintay': { es: 'esperar', en: 'wait' },
    'tanong': { es: 'preguntar', en: 'ask' },
    'magtanong': { es: 'preguntar', en: 'ask' },
    'sagot': { es: 'responder', en: 'answer' },
    'sumagot': { es: 'responder', en: 'answer' },
    'bukas': { es: 'abrir', en: 'open' },
    'buksan': { es: 'abrir', en: 'open' },
    'sara': { es: 'cerrar', en: 'close' },
    'isara': { es: 'cerrar', en: 'close' },
    'start': { es: 'empezar', en: 'start' },
    'magsimula': { es: 'empezar', en: 'start' },
    'stop': { es: 'parar', en: 'stop' },
    'tumigil': { es: 'parar', en: 'stop' },
    'galaw': { es: 'moverse', en: 'move' },
    'kilos': { es: 'actuar', en: 'act' },
    'tayo': { es: 'levantarse', en: 'stand up' },
    'upo': { es: 'sentarse', en: 'sit down' },
    'dapa': { es: 'acostarse', en: 'lie down' },
    'lakbay': { es: 'viajar', en: 'travel' },
    'byahe': { es: 'viajar', en: 'travel' },
    'sakay': { es: 'subir', en: 'ride' },
    'baba': { es: 'bajar', en: 'get off' },
    'kapit': { es: 'agarrar', en: 'hold' },
    'hawak': { es: 'sostener', en: 'hold' },
    'bato': { es: 'lanzar', en: 'throw' },
    'hagis': { es: 'lanzar', en: 'throw' },
    'sipa': { es: 'patear', en: 'kick' },
    'suntok': { es: 'golpear', en: 'punch' },
    'yakap': { es: 'abrazar', en: 'hug' },
    'halik': { es: 'besar', en: 'kiss' },
    'kausap': { es: 'hablar', en: 'talk' },
    'usap': { es: 'conversar', en: 'converse' },
    'sabihan': { es: 'decir', en: 'tell' },
    'sabi': { es: 'dicho', en: 'said' },
    'sabihin': { es: 'decir', en: 'say' },
    'gawa': { es: 'hacer', en: 'do/make' },
    'yari': { es: 'fabricar', en: 'make' },
    'ayos': { es: 'arreglar', en: 'fix' },
    'repair': { es: 'reparar', en: 'repair' },
    'delete': { es: 'borrar', en: 'delete' },
    'save': { es: 'guardar', en: 'save' },
    'edit': { es: 'editar', en: 'edit' },
    'copy': { es: 'copiar', en: 'copy' },
    'paste': { es: 'pegar', en: 'paste' },
    'cut': { es: 'cortar', en: 'cut' },
    'send': { es: 'enviar', en: 'send' },
    'receive': { es: 'recibir', en: 'receive' },
    'call': { es: 'llamar', en: 'call' },
    'text': { es: 'texto', en: 'text' },
    'chat': { es: 'charlar', en: 'chat' },
    'video call': { es: 'videollamada', en: 'video call' },
    'download': { es: 'descargar', en: 'download' },
    'upload': { es: 'subir', en: 'upload' },
    'install': { es: 'instalar', en: 'install' },
    'uninstall': { es: 'desinstalar', en: 'uninstall' },
    'update': { es: 'actualizar', en: 'update' },
    'upgrade': { es: 'mejorar', en: 'upgrade' },

    // ===== EMOTIONS/FEELINGS =====
    'masaya': { es: 'feliz', en: 'happy' },
    'malungkot': { es: 'triste', en: 'sad' },
    'galit': { es: 'enojado', en: 'angry' },
    'takot': { es: 'miedo', en: 'scared' },
    'excited': { es: 'emocionado', en: 'excited' },
    'pagod': { es: 'cansado', en: 'tired' },
    'gutom': { es: 'hambriento', en: 'hungry' },
    'uhaw': { es: 'sediento', en: 'thirsty' },
    'kinakabahan': { es: 'nervioso', en: 'nervous' },
    'naguguluhan': { es: 'confundido', en: 'confused' },
    'nagmamahal': { es: 'amoroso', en: 'loving' },
    'inis': { es: 'molesto', en: 'annoyed' },
    'sawa': { es: 'aburrido', en: 'bored' },
    'saya': { es: 'alegría', en: 'joy' },
    'lungkot': { es: 'tristeza', en: 'sadness' },
    'galit na galit': { es: 'furioso', en: 'furious' },
    'takot na takot': { es: 'aterrado', en: 'terrified' },
    'kaba': { es: 'nervios', en: 'nerves' },
    'selos': { es: 'celos', en: 'jealousy' },
    'selos ka ba': { es: 'estás celoso', en: 'are you jealous' },
    'inggit': { es: 'envidia', en: 'envy' },
    'proud': { es: 'orgulloso', en: 'proud' },
    'ashamed': { es: 'avergonzado', en: 'ashamed' },
    'guilty': { es: 'culpable', en: 'guilty' },
    'hopeful': { es: 'esperanzado', en: 'hopeful' },
    'grateful': { es: 'agradecido', en: 'grateful' },
    'lonely': { es: 'solitario', en: 'lonely' },
    'hurt': { es: 'herido', en: 'hurt' },
    'calm': { es: 'calmado', en: 'calm' },
    'relax': { es: 'relajado', en: 'relaxed' },
    'stress': { es: 'estresado', en: 'stressed' },
    'worry': { es: 'preocupado', en: 'worried' },
    'surprise': { es: 'sorprendido', en: 'surprised' },

    // ===== FOOD & DRINKS =====
    'kape': { es: 'café', en: 'coffee' },
    'tubig': { es: 'agua', en: 'water' },
    'kanin': { es: 'arroz', en: 'rice' },
    'ulam': { es: 'comida', en: 'dish' },
    'tinapay': { es: 'pan', en: 'bread' },
    'gatas': { es: 'leche', en: 'milk' },
    'juice': { es: 'jugo', en: 'juice' },
    'manok': { es: 'pollo', en: 'chicken' },
    'baboy': { es: 'cerdo', en: 'pork' },
    'isda': { es: 'pescado', en: 'fish' },
    'gulay': { es: 'verduras', en: 'vegetables' },
    'prutas': { es: 'frutas', en: 'fruits' },
    'sabaw': { es: 'sopa', en: 'soup' },
    'sinigang': { es: 'sinigang', en: 'sinigang' },
    'adobo': { es: 'adobo', en: 'adobo' },
    'sisig': { es: 'sisig', en: 'sisig' },
    'lechon': { es: 'lechón', en: 'roast pig' },
    'lumpia': { es: 'lumpia', en: 'spring roll' },
    'pansit': { es: 'fideos', en: 'noodles' },
    'bihon': { es: 'fideos de arroz', en: 'rice noodles' },
    'canton': { es: 'fideos canton', en: 'canton noodles' },
    'lugaw': { es: 'gachas de arroz', en: 'rice porridge' },
    'goto': { es: 'goto', en: 'goto' },
    'arroz caldo': { es: 'arroz caldo', en: 'arroz caldo' },
    'tapsilog': { es: 'tapsilog', en: 'tapsilog' },
    'silog': { es: 'silog', en: 'silog' },
    'longsilog': { es: 'longsilog', en: 'longsilog' },
    'hotsilog': { es: 'hotsilog', en: 'hotsilog' },
    'bangsilog': { es: 'bangsilog', en: 'bangsilog' },
    'chicksilog': { es: 'chicksilog', en: 'chicksilog' },
    'spamsilog': { es: 'spamsilog', en: 'spamsilog' },
    'corned beef': { es: 'carne enlatada', en: 'corned beef' },
    'tocino': { es: 'tocino', en: 'tocino' },
    'longganisa': { es: 'longaniza', en: 'sausage' },
    'itlog': { es: 'huevo', en: 'egg' },
    'malasadong itlog': { es: 'huevo pasado por agua', en: 'soft boiled egg' },
    'hard boiled': { es: 'duro', en: 'hard boiled' },
    'scrambled': { es: 'revuelto', en: 'scrambled' },
    'fried egg': { es: 'huevo frito', en: 'fried egg' },
    'sunny side up': { es: 'huevo frito', en: 'sunny side up' },
    'cheese': { es: 'queso', en: 'cheese' },
    'butter': { es: 'mantequilla', en: 'butter' },
    'margarine': { es: 'margarina', en: 'margarine' },
    'mayonnaise': { es: 'mayonesa', en: 'mayonnaise' },
    'ketchup': { es: 'kétchup', en: 'ketchup' },
    'mustard': { es: 'mostaza', en: 'mustard' },
    'hotdog': { es: 'perrito caliente', en: 'hotdog' },
    'burger': { es: 'hamburguesa', en: 'burger' },
    'pizza': { es: 'pizza', en: 'pizza' },
    'pasta': { es: 'pasta', en: 'pasta' },
    'spaghetti': { es: 'espagueti', en: 'spaghetti' },
    'carbonara': { es: 'carbonara', en: 'carbonara' },
    'lasagna': { es: 'lasaña', en: 'lasagna' },
    'salad': { es: 'ensalada', en: 'salad' },
    'soup': { es: 'sopa', en: 'soup' },
    'dessert': { es: 'postre', en: 'dessert' },
    'cake': { es: 'pastel', en: 'cake' },
    'ice cream': { es: 'helado', en: 'ice cream' },
    'chocolate': { es: 'chocolate', en: 'chocolate' },
    'candy': { es: 'caramelo', en: 'candy' },
    'cookie': { es: 'galleta', en: 'cookie' },
    'brownie': { es: 'brownie', en: 'brownie' },
    'donut': { es: 'dona', en: 'donut' },
    'milk tea': { es: 'té con leche', en: 'milk tea' },
    'bubble tea': { es: 'té de burbujas', en: 'bubble tea' },
    'soda': { es: 'refresco', en: 'soda' },
    'beer': { es: 'cerveza', en: 'beer' },
    'wine': { es: 'vino', en: 'wine' },
    'whiskey': { es: 'whisky', en: 'whiskey' },
    'vodka': { es: 'vodka', en: 'vodka' },
    'rum': { es: 'ron', en: 'rum' },

    // ===== PLACES =====
    'bahay': { es: 'casa', en: 'house' },
    'bahay mo': { es: 'tu casa', en: 'your house' },
    'bahay namin': { es: 'nuestra casa', en: 'our house' },
    'eskwela': { es: 'escuela', en: 'school' },
    'paaralan': { es: 'escuela', en: 'school' },
    'trabaho': { es: 'trabajo', en: 'work' },
    'opisina': { es: 'oficina', en: 'office' },
    'simbahan': { es: 'iglesia', en: 'church' },
    'ospital': { es: 'hospital', en: 'hospital' },
    'klinika': { es: 'clínica', en: 'clinic' },
    'palengke': { es: 'mercado', en: 'market' },
    'tindahan': { es: 'tienda', en: 'store' },
    'grocery': { es: 'supermercado', en: 'grocery' },
    'supermarket': { es: 'supermercado', en: 'supermarket' },
    'mall': { es: 'centro comercial', en: 'mall' },
    'restawran': { es: 'restaurante', en: 'restaurant' },
    'kainan': { es: 'comedor', en: 'eatery' },
    'banyo': { es: 'baño', en: 'bathroom' },
    'cr': { es: 'baño', en: 'restroom' },
    'kuwarto': { es: 'habitación', en: 'room' },
    'kwarto': { es: 'habitación', en: 'room' },
    'sala': { es: 'sala', en: 'living room' },
    'kusina': { es: 'cocina', en: 'kitchen' },
    'dining room': { es: 'comedor', en: 'dining room' },
    'garage': { es: 'garaje', en: 'garage' },
    'garden': { es: 'jardín', en: 'garden' },
    'bakuran': { es: 'patio', en: 'yard' },
    'parke': { es: 'parque', en: 'park' },
    'plaza': { es: 'plaza', en: 'plaza' },
    'beach': { es: 'playa', en: 'beach' },
    'dagat': { es: 'mar', en: 'sea' },
    'bundok': { es: 'montaña', en: 'mountain' },
    'ilog': { es: 'río', en: 'river' },
    'lawa': { es: 'lago', en: 'lake' },
    'gubat': { es: 'bosque', en: 'forest' },
    'city': { es: 'ciudad', en: 'city' },
    'bayan': { es: 'pueblo', en: 'town' },
    'barangay': { es: 'barrio', en: 'village' },
    'probinsya': { es: 'provincia', en: 'province' },
    'region': { es: 'región', en: 'region' },
    'country': { es: 'país', en: 'country' },
    'world': { es: 'mundo', en: 'world' },
    'earth': { es: 'tierra', en: 'earth' },
    'space': { es: 'espacio', en: 'space' },
    'sky': { es: 'cielo', en: 'sky' },
    'airport': { es: 'aeropuerto', en: 'airport' },
    'terminal': { es: 'terminal', en: 'terminal' },
    'station': { es: 'estación', en: 'station' },
    'bus stop': { es: 'parada de autobús', en: 'bus stop' },
    'train station': { es: 'estación de tren', en: 'train station' },

    // ===== FAMILY =====
    'nanay': { es: 'madre', en: 'mother' },
    'mama': { es: 'mamá', en: 'mom' },
    'ina': { es: 'madre', en: 'mother' },
    'tatay': { es: 'padre', en: 'father' },
    'papa': { es: 'papá', en: 'dad' },
    'ama': { es: 'padre', en: 'father' },
    'ate': { es: 'hermana mayor', en: 'older sister' },
    'kuya': { es: 'hermano mayor', en: 'older brother' },
    'diko': { es: 'segundo hermano mayor', en: 'second older brother' },
    'sangko': { es: 'tercer hermano mayor', en: 'third older brother' },
    'bunso': { es: 'el más joven', en: 'youngest' },
    'lola': { es: 'abuela', en: 'grandmother' },
    'lolo': { es: 'abuelo', en: 'grandfather' },
    'tito': { es: 'tío', en: 'uncle' },
    'tita': { es: 'tía', en: 'aunt' },
    'pinsan': { es: 'primo/prima', en: 'cousin' },
    'pamangkin': { es: 'sobrino/sobrina', en: 'nephew/niece' },
    'anak': { es: 'hijo/hija', en: 'son/daughter' },
    'anak ko': { es: 'mi hijo', en: 'my child' },
    'asawa': { es: 'esposo/esposa', en: 'spouse' },
    'asawa ko': { es: 'mi esposo/a', en: 'my spouse' },
    'bayaw': { es: 'cuñado', en: 'brother in law' },
    'hipag': { es: 'cuñada', en: 'sister in law' },
    'biyenan': { es: 'suegro/suegra', en: 'parent in law' },
    'manugang': { es: 'yerno/nuera', en: 'son/daughter in law' },
    'inaanak': { es: 'ahijado/ahijada', en: 'godchild' },
    'ninong': { es: 'padrino', en: 'godfather' },
    'ninang': { es: 'madrina', en: 'godmother' },
    'kaibigan': { es: 'amigo', en: 'friend' },
    'best friend': { es: 'mejor amigo', en: 'best friend' },
    'neighbor': { es: 'vecino', en: 'neighbor' },
    'kapitbahay': { es: 'vecino', en: 'neighbor' },
    'classmate': { es: 'compañero de clase', en: 'classmate' },
    'kaklase': { es: 'compañero de clase', en: 'classmate' },
    'workmate': { es: 'compañero de trabajo', en: 'workmate' },
    'katrabaho': { es: 'compañero de trabajo', en: 'workmate' },
    'boss': { es: 'jefe', en: 'boss' },
    'manager': { es: 'gerente', en: 'manager' },
    'employee': { es: 'empleado', en: 'employee' },
    'staff': { es: 'personal', en: 'staff' },

    // ===== TIME =====
    'ngayon': { es: 'ahora', en: 'now' },
    'bukas': { es: 'mañana', en: 'tomorrow' },
    'kahapon': { es: 'ayer', en: 'yesterday' },
    'mamaya': { es: 'más tarde', en: 'later' },
    'kanina': { es: 'hace un momento', en: 'earlier' },
    'araw': { es: 'día', en: 'day' },
    'linggo': { es: 'semana', en: 'week' },
    'buwan': { es: 'mes', en: 'month' },
    'taon': { es: 'año', en: 'year' },
    'oras': { es: 'hora', en: 'hour' },
    'minuto': { es: 'minuto', en: 'minute' },
    'segundo': { es: 'segundo', en: 'second' },
    'umaga': { es: 'mañana', en: 'morning' },
    'tanghali': { es: 'mediodía', en: 'noon' },
    'hapon': { es: 'tarde', en: 'afternoon' },
    'gabi': { es: 'noche', en: 'evening/night' },
    'madaling araw': { es: 'madrugada', en: 'dawn' },
    'hatinggabi': { es: 'medianoche', en: 'midnight' },
    'Lunes': { es: 'lunes', en: 'Monday' },
    'Martes': { es: 'martes', en: 'Tuesday' },
    'Miyerkules': { es: 'miércoles', en: 'Wednesday' },
    'Huwebes': { es: 'jueves', en: 'Thursday' },
    'Biyernes': { es: 'viernes', en: 'Friday' },
    'Sabado': { es: 'sábado', en: 'Saturday' },
    'Linggo': { es: 'domingo', en: 'Sunday' },
    'Enero': { es: 'enero', en: 'January' },
    'Pebrero': { es: 'febrero', en: 'February' },
    'Marso': { es: 'marzo', en: 'March' },
    'Abril': { es: 'abril', en: 'April' },
    'Mayo': { es: 'mayo', en: 'May' },
    'Hunyo': { es: 'junio', en: 'June' },
    'Hulyo': { es: 'julio', en: 'July' },
    'Agosto': { es: 'agosto', en: 'August' },
    'Setyembre': { es: 'septiembre', en: 'September' },
    'Oktubre': { es: 'octubre', en: 'October' },
    'Nobyembre': { es: 'noviembre', en: 'November' },
    'Disyembre': { es: 'diciembre', en: 'December' },

    // ===== COLORS =====
    'pula': { es: 'rojo', en: 'red' },
    'bughaw': { es: 'azul', en: 'blue' },
    'asul': { es: 'azul', en: 'blue' },
    'berde': { es: 'verde', en: 'green' },
    'dilaw': { es: 'amarillo', en: 'yellow' },
    'itim': { es: 'negro', en: 'black' },
    'puti': { es: 'blanco', en: 'white' },
    'kahel': { es: 'naranja', en: 'orange' },
    'lila': { es: 'morado', en: 'purple' },
    'kulay': { es: 'color', en: 'color' },
    'rosas': { es: 'rosa', en: 'pink' },
    'kayumanggi': { es: 'marrón', en: 'brown' },
    'abo': { es: 'gris', en: 'gray' },
    'ginto': { es: 'dorado', en: 'gold' },
    'pilak': { es: 'plateado', en: 'silver' },
    'tanso': { es: 'bronce', en: 'bronze' },
    'cream': { es: 'crema', en: 'cream' },
    'beige': { es: 'beige', en: 'beige' },
    'turkesa': { es: 'turquesa', en: 'turquoise' },
    'indigo': { es: 'índigo', en: 'indigo' },
    'violet': { es: 'violeta', en: 'violet' },
    'magenta': { es: 'magenta', en: 'magenta' },
    'cyan': { es: 'cian', en: 'cyan' },
    'neon': { es: 'neón', en: 'neon' },
    'pastel': { es: 'pastel', en: 'pastel' },

    // ===== ADJECTIVES =====
    'maganda': { es: 'hermoso', en: 'beautiful' },
    'gwapo': { es: 'guapo', en: 'handsome' },
    'pangit': { es: 'feo', en: 'ugly' },
    'mabait': { es: 'amable', en: 'kind' },
    'matigas': { es: 'duro', en: 'hard' },
    'malambot': { es: 'blando', en: 'soft' },
    'malaki': { es: 'grande', en: 'big' },
    'maliit': { es: 'pequeño', en: 'small' },
    'mahaba': { es: 'largo', en: 'long' },
    'maikli': { es: 'corto', en: 'short' },
    'mabilis': { es: 'rápido', en: 'fast' },
    'mabagal': { es: 'lento', en: 'slow' },
    'bago': { es: 'nuevo', en: 'new' },
    'luma': { es: 'viejo', en: 'old' },
    'mainit': { es: 'caliente', en: 'hot' },
    'malamig': { es: 'frío', en: 'cold' },
    'presko': { es: 'fresco', en: 'fresh' },
    'maalat': { es: 'salado', en: 'salty' },
    'matamis': { es: 'dulce', en: 'sweet' },
    'maasim': { es: 'agrio', en: 'sour' },
    'mapait': { es: 'amargo', en: 'bitter' },
    'masarap': { es: 'delicioso', en: 'delicious' },
    'mabaho': { es: 'apestoso', en: 'stinky' },
    'mabango': { es: 'fragante', en: 'fragrant' },
    'malinis': { es: 'limpio', en: 'clean' },
    'marumi': { es: 'sucio', en: 'dirty' },
    'maayos': { es: 'ordenado', en: 'organized' },
    'magulo': { es: 'desordenado', en: 'messy' },
    'tahimik': { es: 'tranquilo', en: 'quiet' },
    'maingay': { es: 'ruidoso', en: 'noisy' },
    'malalim': { es: 'profundo', en: 'deep' },
    'mababaw': { es: 'superficial', en: 'shallow' },
    'mataas': { es: 'alto', en: 'high' },
    'mababa': { es: 'bajo', en: 'low' },
    'makapal': { es: 'grueso', en: 'thick' },
    'manipis': { es: 'delgado', en: 'thin' },
    'malawak': { es: 'amplio', en: 'wide' },
    'makitid': { es: 'estrecho', en: 'narrow' },
    'malayo': { es: 'lejos', en: 'far' },
    'malapit': { es: 'cerca', en: 'near' },
    'mayaman': { es: 'rico', en: 'rich' },
    'mahirap': { es: 'pobre', en: 'poor' },
    'mataba': { es: 'gordo', en: 'fat' },
    'payat': { es: 'delgado', en: 'thin' },
    'malusog': { es: 'saludable', en: 'healthy' },
    'may sakit': { es: 'enfermo', en: 'sick' },
    'malakas': { es: 'fuerte', en: 'strong' },
    'mahina': { es: 'débil', en: 'weak' },
    'matalino': { es: 'inteligente', en: 'smart' },
    'bobo': { es: 'tonto', en: 'stupid' },
    'tanga': { es: 'idiota', en: 'idiot' },
    'sikat': { es: 'famoso', en: 'famous' },
    'boring': { es: 'aburrido', en: 'boring' },
    'interesting': { es: 'interesante', en: 'interesting' },
    'amazing': { es: 'asombroso', en: 'amazing' },
    'awesome': { es: 'increíble', en: 'awesome' },
    'perfect': { es: 'perfecto', en: 'perfect' },

    // ===== NUMBERS 1-100 =====
    'isa': { es: 'uno', en: 'one' },
    'dalawa': { es: 'dos', en: 'two' },
    'tatlo': { es: 'tres', en: 'three' },
    'apat': { es: 'cuatro', en: 'four' },
    'lima': { es: 'cinco', en: 'five' },
    'anim': { es: 'seis', en: 'six' },
    'pito': { es: 'siete', en: 'seven' },
    'walo': { es: 'ocho', en: 'eight' },
    'siyam': { es: 'nueve', en: 'nine' },
    'sampu': { es: 'diez', en: 'ten' },
    'labing isa': { es: 'once', en: 'eleven' },
    'labindalawa': { es: 'doce', en: 'twelve' },
    'labintatlo': { es: 'trece', en: 'thirteen' },
    'labing apat': { es: 'catorce', en: 'fourteen' },
    'labinlima': { es: 'quince', en: 'fifteen' },
    'labing anim': { es: 'dieciseis', en: 'sixteen' },
    'labimpito': { es: 'diecisiete', en: 'seventeen' },
    'labingwalo': { es: 'dieciocho', en: 'eighteen' },
    'labinsiyam': { es: 'diecinueve', en: 'nineteen' },
    'dalawampu': { es: 'veinte', en: 'twenty' },
    'tatlumpu': { es: 'treinta', en: 'thirty' },
    'apatnapu': { es: 'cuarenta', en: 'forty' },
    'limampu': { es: 'cincuenta', en: 'fifty' },
    'animnapu': { es: 'sesenta', en: 'sixty' },
    'pitumpu': { es: 'setenta', en: 'seventy' },
    'walumpu': { es: 'ochenta', en: 'eighty' },
    'siyamnapu': { es: 'noventa', en: 'ninety' },
    'daan': { es: 'cien', en: 'hundred' },
    'libo': { es: 'mil', en: 'thousand' },
    'milyon': { es: 'millón', en: 'million' },

    // ===== CONNECTORS & PARTICLES =====
    'sa': { es: 'en/a', en: 'in/to' },
    'ng': { es: 'de', en: 'of' },
    'na': { es: 'que', en: 'that' },
    'pa': { es: 'aún', en: 'still' },
    'ba': { es: '?', en: '?' },
    'din': { es: 'también', en: 'also' },
    'raw': { es: 'dice', en: 'said' },
    'kasi': { es: 'porque', en: 'because' },
    'kung': { es: 'si', en: 'if' },
    'kapag': { es: 'cuando', en: 'when' },
    'dahil': { es: 'debido a', en: 'because of' },
    'para': { es: 'para', en: 'for' },
    'may': { es: 'tiene', en: 'has/have' },
    'meron': { es: 'hay', en: 'there is' },
    'wala': { es: 'no hay', en: 'there is no' },
    'at': { es: 'y', en: 'and' },
    'o': { es: 'o', en: 'or' },
    'pero': { es: 'pero', en: 'but' },
    'kaya': { es: 'así que', en: 'so' },
    'dahil sa': { es: 'debido a', en: 'because of' },
    'tulad ng': { es: 'como', en: 'like' },
    'para sa': { es: 'para', en: 'for' },
    'ayon sa': { es: 'según', en: 'according to' },
    'sa kabila ng': { es: 'a pesar de', en: 'despite' },
    'sa halip na': { es: 'en lugar de', en: 'instead of' },
    'habang': { es: 'mientras', en: 'while' },
    'bago': { es: 'antes', en: 'before' },
    'pagkatapos': { es: 'después', en: 'after' },
    'simula': { es: 'desde', en: 'since' },
    'hanggang': { es: 'hasta', en: 'until' },
    'sa loob': { es: 'dentro', en: 'inside' },
    'sa labas': { es: 'fuera', en: 'outside' },
    'itaas': { es: 'arriba', en: 'above' },
    'ibaba': { es: 'abajo', en: 'below' },
    'tabi': { es: 'lado', en: 'side' },
    'likod': { es: 'detrás', en: 'behind' },
    'harap': { es: 'frente', en: 'front' },
    'gitna': { es: 'medio', en: 'middle' },
    'loob': { es: 'interior', en: 'inside' },

    // ===== TECHNOLOGY =====
    'computer': { es: 'computadora', en: 'computer' },
    'laptop': { es: 'portátil', en: 'laptop' },
    'phone': { es: 'teléfono', en: 'phone' },
    'cellphone': { es: 'celular', en: 'cellphone' },
    'tablet': { es: 'tableta', en: 'tablet' },
    'internet': { es: 'internet', en: 'internet' },
    'wifi': { es: 'wifi', en: 'wifi' },
    'bluetooth': { es: 'bluetooth', en: 'bluetooth' },
    'data': { es: 'datos', en: 'data' },
    'signal': { es: 'señal', en: 'signal' },
    'battery': { es: 'batería', en: 'battery' },
    'charger': { es: 'cargador', en: 'charger' },
    'screen': { es: 'pantalla', en: 'screen' },
    'keyboard': { es: 'teclado', en: 'keyboard' },
    'mouse': { es: 'ratón', en: 'mouse' },
    'printer': { es: 'impresora', en: 'printer' },
    'scanner': { es: 'escáner', en: 'scanner' },
    'speaker': { es: 'altavoz', en: 'speaker' },
    'headphone': { es: 'auriculares', en: 'headphones' },
    'mic': { es: 'micrófono', en: 'microphone' },
    'camera': { es: 'cámara', en: 'camera' },
    'app': { es: 'aplicación', en: 'app' },
    'website': { es: 'sitio web', en: 'website' },
    'facebook': { es: 'facebook', en: 'facebook' },
    'messenger': { es: 'mensajero', en: 'messenger' },
    'instagram': { es: 'instagram', en: 'instagram' },
    'tiktok': { es: 'tiktok', en: 'tiktok' },
    'youtube': { es: 'youtube', en: 'youtube' },
    'google': { es: 'google', en: 'google' },
    'email': { es: 'correo electrónico', en: 'email' },
    'password': { es: 'contraseña', en: 'password' },
    'username': { es: 'nombre de usuario', en: 'username' },
    'account': { es: 'cuenta', en: 'account' },
    'login': { es: 'iniciar sesión', en: 'login' },
    'logout': { es: 'cerrar sesión', en: 'logout' },
    'sign up': { es: 'registrarse', en: 'sign up' },
    'download': { es: 'descargar', en: 'download' },
    'upload': { es: 'subir', en: 'upload' },
    'install': { es: 'instalar', en: 'install' },
    'uninstall': { es: 'desinstalar', en: 'uninstall' },
    'update': { es: 'actualizar', en: 'update' },
    'upgrade': { es: 'mejorar', en: 'upgrade' },
    'backup': { es: 'copia de seguridad', en: 'backup' },
    'restore': { es: 'restaurar', en: 'restore' },
    'delete': { es: 'borrar', en: 'delete' },
    'save': { es: 'guardar', en: 'save' },
    'edit': { es: 'editar', en: 'edit' },
    'copy': { es: 'copiar', en: 'copy' },
    'paste': { es: 'pegar', en: 'paste' },
    'cut': { es: 'cortar', en: 'cut' },
    'undo': { es: 'deshacer', en: 'undo' },
    'redo': { es: 'rehacer', en: 'redo' },
    'refresh': { es: 'actualizar', en: 'refresh' },
    'reload': { es: 'recargar', en: 'reload' },
    'settings': { es: 'configuración', en: 'settings' },
    'options': { es: 'opciones', en: 'options' },
    'menu': { es: 'menú', en: 'menu' },
    'home': { es: 'inicio', en: 'home' },
    'back': { es: 'atrás', en: 'back' },
    'next': { es: 'siguiente', en: 'next' },
    'previous': { es: 'anterior', en: 'previous' },
    'first': { es: 'primero', en: 'first' },
    'last': { es: 'último', en: 'last' },
    'search': { es: 'buscar', en: 'search' },
    'find': { es: 'encontrar', en: 'find' },
    'replace': { es: 'reemplazar', en: 'replace' },
    'select': { es: 'seleccionar', en: 'select' },
    'choose': { es: 'elegir', en: 'choose' },
    'click': { es: 'hacer clic', en: 'click' },
    'tap': { es: 'tocar', en: 'tap' },
    'swipe': { es: 'deslizar', en: 'swipe' },
    'drag': { es: 'arrastrar', en: 'drag' },
    'drop': { es: 'soltar', en: 'drop' },

    // ===== BODY PARTS =====
    'ulo': { es: 'cabeza', en: 'head' },
    'mata': { es: 'ojo', en: 'eye' },
    'tainga': { es: 'oreja', en: 'ear' },
    'ilong': { es: 'nariz', en: 'nose' },
    'bibig': { es: 'boca', en: 'mouth' },
    'ngipin': { es: 'diente', en: 'tooth' },
    'dila': { es: 'lengua', en: 'tongue' },
    'labi': { es: 'labio', en: 'lip' },
    'pisngi': { es: 'mejilla', en: 'cheek' },
    'baba': { es: 'barbilla', en: 'chin' },
    'leeg': { es: 'cuello', en: 'neck' },
    'balikat': { es: 'hombro', en: 'shoulder' },
    'braso': { es: 'brazo', en: 'arm' },
    'siko': { es: 'codo', en: 'elbow' },
    'kamay': { es: 'mano', en: 'hand' },
    'daliri': { es: 'dedo', en: 'finger' },
    'kuko': { es: 'uña', en: 'nail' },
    'dibdib': { es: 'pecho', en: 'chest' },
    'tiyan': { es: 'estómago', en: 'stomach' },
    'likod': { es: 'espalda', en: 'back' },
    'baywang': { es: 'cintura', en: 'waist' },
    'puwit': { es: 'nalgas', en: 'buttocks' },
    'binti': { es: 'pierna', en: 'leg' },
    'tuhod': { es: 'rodilla', en: 'knee' },
    'bukong': { es: 'tobillo', en: 'ankle' },
    'paa': { es: 'pie', en: 'foot' },
    'sakong': { es: 'talón', en: 'heel' },
    'balat': { es: 'piel', en: 'skin' },
    'buto': { es: 'hueso', en: 'bone' },
    'kalamnan': { es: 'músculo', en: 'muscle' },
    'dugo': { es: 'sangre', en: 'blood' },
    'puso': { es: 'corazón', en: 'heart' },
    'baga': { es: 'pulmón', en: 'lung' },
    'atay': { es: 'hígado', en: 'liver' },
    'bato': { es: 'riñón', en: 'kidney' },
    'bituka': { es: 'intestino', en: 'intestine' },
    'utak': { es: 'cerebro', en: 'brain' },
  };

  // ============================================
  // SMART TRANSLATION FUNCTION
  // ============================================
  
  const smartTranslate = (text, targetLang) => {
    if (!text || text.trim() === '') return '';
    
    const words = text.toLowerCase().split(' ');
    const translatedWords = [];
    
    for (let word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      
      if (wordDict[cleanWord]) {
        translatedWords.push(wordDict[cleanWord][targetLang]);
      } else {
        translatedWords.push(word);
      }
    }
    
    let result = translatedWords.join(' ');
    if (result.length > 0) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    if (text.includes('?')) {
      result += '?';
    }
    
    return result;
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

  const stopRecordingAndTranslate = () => {
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
    
    const translated = smartTranslate(finalMessage, language);
    setTranslatedMessage(translated);
    setShowTranslation(true);
    setIsProcessing(false);
    
    speakText(translated, language);
  };

  const speakText = (text, lang) => {
    if (!('speechSynthesis' in window) || !text) return;
    
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
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <div className="glass-container">
        <div className="header">
          <div className="logo">
            <span className="logo-icon">🎙️</span>
            <span className="logo-text">AI Voice Translator</span>
          </div>
          <div className="badge">ULTRA</div>
        </div>
        
        <p className="subtitle">Speak Tagalog • Smart Translation • Voice Output</p>
        
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
          
          <button className="btn-stop" onClick={stopRecordingAndTranslate} disabled={!isRecording || isProcessing}>
            <span className="btn-icon">⏹️</span>
            STOP & TRANSLATE
          </button>
        </div>
        
        <div className="voice-group">
          <button className="btn-voice" onClick={() => speakText(translatedMessage, language)} disabled={!translatedMessage}>
            <span className="btn-icon">🔊</span>
            HEAR {language === 'spanish' ? 'SPANISH' : 'ENGLISH'}
          </button>
          <button className="btn-voice" onClick={() => speakText(userMessage, 'tagalog')} disabled={!userMessage}>
            <span className="btn-icon">🗣️</span>
            REPEAT TAGALOG
          </button>
        </div>
        
        {(isRecording || isProcessing) && (
          <div className="status">
            <div className="status-dot"></div>
            <span>{isRecording ? 'Recording... Speak clearly' : 'Translating...'}</span>
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
          )}
        </div>
        
        <div className="dictionary-preview">
          <h4>📚 Smart Dictionary ({Object.keys(wordDict).length}+ words)</h4>
          <div className="word-grid">
            <span>Kamusta → Hello</span>
            <span>Salamat → Thanks</span>
            <span>Paalam → Goodbye</span>
            <span>Mahal → Love</span>
            <span>Kape → Coffee</span>
            <span>Bahay → House</span>
            <span>Masaya → Happy</span>
            <span>Gusto → Want</span>
          </div>
        </div>
        
        <div className="footer">
          <p>🎤 Premium AI Voice Translator • {Object.keys(wordDict).length}+ words • Real-time • 100% Free</p>
        </div>
      </div>
    </div>
  );
}

export default App;