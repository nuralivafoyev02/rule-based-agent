import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';

const nlp = new NLPProcessor();

// Intent Classifier (Niyatni aniqlash - 5-6 ta qat'iy kategoriya)
nlp.train('greeting', "salom qalay nima gap yaxshimisiz ishlaringiz qanday");
nlp.train('work', "smeta hisobot loyiha ishlar vazifa monitor pul uyqur procoin");
nlp.train('weather', "ob havo qanday harorat necha gradus isitadimi sovuqmi");
nlp.train('profanity', "dnx onangni e gandon axmoq tushunmading it omi");

// State Machine (Holatlar dvigateli)
const sessions = {};
function getSession(id) {
    if (!sessions[id]) {
        // Holat 0: Kutish (Idle)
        // Holat 1: Smeta/Loyiha nomi kutilmoqda
        sessions[id] = { state: 0, history: [] }; 
    }
    return sessions[id];
}

// A. Lug'at va Qoidalar bazasi (Transformation)
const substitutions = {
    "men": "siz", "man": "siz", "menga": "sizga", "meni": "sizni", 
    "qildim": "qildingiz", "boraman": "borasiz", "xohlayman": "xohlaysiz", 
    "charchadim": "charchadingiz"
};

function reflect(text) {
    return text.split(' ').map(word => {
        const cleanWord = word.replace(/[^\w\s\'oʻgʻ]/gi, '');
        return substitutions[cleanWord] || word;
    }).join(' ');
}

// B. Pattern Matching (Decomposition & Reassembly)
const elizaPatterns = [
    { pattern: /menga (.*) kerak/i, responses: ["Tushunarli. Nega aynan {0} kerak sizga?", "Agar {0} topsak, qolgan ishlar yurishib ketadimi?"] },
    { pattern: /ishlar (.*)/i, responses: ["Nega ishlar {0} deb o'ylaysiz?", "Buni hal qilish uchun qayerdan boshlaymiz?"] },
    { pattern: /men (.*)man/i, responses: ["O'zingizni {0} ekanligingizni qachondan beri sezyapsiz?"] },
    { pattern: /muammo (.*)/i, responses: ["Xavotir olmang, buni hal qilamiz. {0} bo'yicha aniq qanday yordam kerak?"] }
];

export const analyzeIntent = async (text, sessionId = 'default') => {
    try {
        const session = getSession(sessionId);
        if (!text) return { ui_component: 'TextBubble', data: { text: "Eshityapman, nima demoqchi edingiz?" } };

        const input = text.toLowerCase().trim();
        const intent = nlp.predict(input);

        // 1. Qat'iy qoidalar va Xavfsizlik
        if (intent === 'profanity') return { ui_component: 'TextBubble', data: { text: "Asablar tarang-ku! Yaxshisi, ishlarni tinchgina hal qilaylik." } };
        if (intent === 'greeting' || input === 'salom') return { ui_component: 'TextBubble', data: { text: "Assalomu alaykum, Boshliq. Ishga tayyormisiz? Bugun nima qilamiz?" } };
        
        // 2. State Machine (Holatlar mantig'i)
        if (session.state === 1) { 
            // Dastur loyiha nomini kutyapti
            session.state = 0; // Idle holatiga qaytish
            return { ui_component: 'SuccessCard', data: { title: 'Vazifa qabul qilindi', message: `"${text}" bo'yicha ma'lumotlarni tahlil qilishni boshladim.` } };
        }

        if (intent === 'work') {
            session.state = 1; // Holat 1 ga o'tkazish
            return { ui_component: 'TextBubble', data: { text: "Loyihalar holati bo'yicha hisobot tayyorlaymi?" } };
        }

        // 3. ELIZA - Refleksiv suhbat (Illusion of Intelligence)
        for (let item of elizaPatterns) {
            const match = input.match(item.pattern);
            if (match) {
                const capturedText = match[1];
                const reflectedText = reflect(capturedText);
                const randomResponse = item.responses[Math.floor(Math.random() * item.responses.length)];
                return { ui_component: 'TextBubble', data: { text: randomResponse.replace(/\{0\}/g, reflectedText) } };
            }
        }

        // 4. Deterministik API qoidalar
        if (intent === 'weather') {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
                const data = await response.json();
                return { ui_component: 'TextBubble', data: { text: `Toshkentda hozir harorat **${data.current_weather.temperature}°C** 🌡️` } };
            } catch (e) {}
        }

        // 5. Default javob (Agar hech narsa topilmasa - ELIZA usuli)
        session.history.push(input);
        return { ui_component: 'TextBubble', data: { text: "Bu haqda biroz ko'proq ma'lumot bera olasizmi?" } };

    } catch (error) {
        return { ui_component: 'ErrorWidget', data: { title: 'Tizim xatosi', message: "Kichik uzilish bo'ldi. Yana qaytara olasizmi?" } };
    }
};