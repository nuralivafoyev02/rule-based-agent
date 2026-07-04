import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';

const nlp = new NLPProcessor();

// 1. Asosiy ongni qayta tiklaymiz (Bularni tushunishi shart)
nlp.train('greeting', "salom qalay nima gap yaxshimisiz ishlaringiz qanday");
nlp.train('work', "smeta hisobot loyiha ishlar qanday ketyapti pul moliya");
nlp.train('weather', "ob havo qanday harorat necha gradus isitadimi sovuqmi");
nlp.train('search', "qidir internetdan top skraping qil nima degani");
nlp.train('agreement', "ha xop mayli yaxshi ok tushunarli");
nlp.train('disagreement', "yoq yo'q kerakmas bekor qil");
nlp.train('profanity', "dnx jallab jalab onangni onagni e gandon axmoq tushunmading it omi"); // Rasmdagi holatlar uchun himoya

const sessions = {};
function getSession(id) {
    if (!sessions[id]) {
        sessions[id] = { state: 'idle', history: [] };
    }
    return sessions[id];
}

const reflections = {
    "men": "siz", "menga": "sizga", "meni": "sizni", "o'zimni": "o'zingizni",
    "qildim": "qildingiz", "boraman": "borasiz", "xohlayman": "xohlaysiz",
    "charchadim": "charchadingiz", "qilaman": "qilasiz", "yoqmayapti": "yoqmayapti"
};

function reflect(text) {
    return text.split(' ').map(word => {
        const cleanWord = word.replace(/[^\w\s\'oʻgʻ]/gi, '');
        return reflections[cleanWord] ? reflections[cleanWord] : word;
    }).join(' ');
}

const humanPatterns = [
    { pattern: /menga (.*) kerak/i, responses: ["Nega aynan {0} kerak sizga?", "Boshqa muqobil varianti yo'qmi?"] },
    { pattern: /men (.*) his qilyapman|men (.*)man/i, responses: ["Nima uchun o'zingizni {0} his qilyapsiz?"] },
    { pattern: /(.*) xohlayman/i, responses: ["{0} xohlashingizni tushunaman. Bunga qanday erishamiz?"] },
    { pattern: /zerikdim|charchadim/i, responses: ["Juda ko'p ishlab yubordingiz shekilli. Keling, chalg'itamiz, internetdan qiziq narsa topaymi?"] }
];

export const analyzeIntent = async (text, sessionId = 'default') => {
    try {
        const session = getSession(sessionId);
        if (!text) return { ui_component: 'TextBubble', data: { text: "Eshityapman... Nimadir demoqchimidingiz?" } };

        const input = text.toLowerCase().trim();
        const intent = nlp.predict(input);

        // 1. Qisqa, aniq va emotsional gaplarga (NLP) reaksiyalar!
        if (intent === 'profanity' || input.includes('dnx') || input.includes('omi') || input.includes('it')) {
            return { ui_component: 'TextBubble', data: { text: "O'o'o', asablar tarang-ku! 😅 So'kinmasdan kelishaylik, aniq nima muammo bo'lyapti o'zi?" } };
        }
        
        if (intent === 'greeting' || input === 'salom' || input === 'nima gap') {
            return { ui_component: 'TextBubble', data: { text: "Assalomu alaykum! Xush kelibsiz. Nima gaplar, ishlaringiz yaxshimi?" } };
        }

        if (intent === 'disagreement' || input === 'yoq' || input === 'yo') {
            return { ui_component: 'TextBubble', data: { text: "Yo'q bo'lsa yo'q-da. Boshqa qanday yordam bera olaman?" } };
        }

        if (intent === 'agreement' || input === 'ha' || input === 'ok') {
            return { ui_component: 'TextBubble', data: { text: "Yaxshi, kelishdik." } };
        }

        // 2. Psixologik Pattern Matching (Faqat gap uzunroq bo'lsa)
        for (let item of humanPatterns) {
            const match = input.match(item.pattern);
            if (match) {
                const capturedText = match[1] || match[2] || match[0];
                const reflectedText = reflect(capturedText);
                const randomResponse = item.responses[Math.floor(Math.random() * item.responses.length)];
                return { ui_component: 'TextBubble', data: { text: randomResponse.replace(/\{0\}/g, reflectedText) } };
            }
        }

        // 3. API Integratsiyalar (Ob-havo, Qidiruv)
        if (intent === 'weather' || input.includes('havo') || input.includes('harorat')) {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
                if (response.ok) {
                    const data = await response.json();
                    return { ui_component: 'TextBubble', data: { text: `Toshkentda hozir harorat **${data.current_weather.temperature}°C** 🌡️` } };
                }
            } catch (e) {}
        }

        if (intent === 'search' || input.includes('qidir') || input.includes('top')) {
            try {
                const searchResults = await searchWeb(input);
                return { ui_component: 'TextBubble', data: { text: `Qidiruv natijalari:\n\n` + searchResults.join('\n\n') } };
            } catch (err) {
                return { ui_component: 'ErrorWidget', data: { title: 'Xatolik', message: err.message } };
            }
        }

        // 4. Mantiqli Fallback (Agar hech qaysi qolipga tushmasa)
        session.history.push(input);
        
        // Qisqa so'zlar uchun "Tushunmadim" deb yotmasligi uchun
        if (input.split(' ').length <= 2) {
             return { ui_component: 'TextBubble', data: { text: "Xo'sh? Fikringizni davom ettiring." } };
        }

        const fallbacks = [
            `Ushbu gapingizni tahlil qilyapman. Boshqacha so'zlar bilan tushuntira olasizmi?`,
            "Bu qiziq fikr. Batafsilroq gaplashamizmi bu haqida?",
            "Tushunaman. Keyin nima qilsak ekan?"
        ];
        
        return { ui_component: 'TextBubble', data: { text: fallbacks[Math.floor(Math.random() * fallbacks.length)] } };

    } catch (error) {
        return { ui_component: 'ErrorWidget', data: { title: 'Tizim xatosi', message: "Kichik uzilish bo'ldi. Yana qaytara olasizmi?" } };
    }
};