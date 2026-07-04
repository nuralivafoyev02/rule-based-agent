import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';

const nlp = new NLPProcessor();

// 1. Tizim xotirasi
const sessions = {};
function getSession(id) {
    if (!sessions[id]) {
        sessions[id] = { state: 'idle', history: [], lastTopic: null, userName: 'Boshliq' };
    }
    return sessions[id];
}

// 2. Ko'zgu effekti (Odamning so'zini 2-shaxsga o'girish)
// Masalan: "Men uyni quraman" -> "Siz uyni qurasiz"
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

// 3. Psixologik suhbat naqshlari (Regex Patterns)
// Tizim gapdagi asosiy so'zni (*) ushlab, uni {0} o'rniga qo'yadi.
const humanPatterns = [
    {
        pattern: /menga (.*) kerak/i,
        responses: [
            "Nega aynan {0} kerak sizga?",
            "Agar {0} topsak, muammoingiz hal bo'ladimi?",
            "Tushunarli, hozir {0} muhim. Lekin buning o'rniga boshqa yo'li yo'qmi?"
        ]
    },
    {
        pattern: /men (.*) his qilyapman|men (.*)man/i,
        responses: [
            "Qachondan beri o'zingizni {0} his qilyapsiz?",
            "Sizningcha, nima uchun {0} bo'lyapsiz?",
            "O'zingizni {0} his qilishingizga nima sabab bo'ldi deb o'ylaysiz?"
        ]
    },
    {
        pattern: /(.*) xohlayman/i,
        responses: [
            "Siz chindan ham {0} xohlaysizmi yoki bu shunchaki o'tkinchi xohishmi?",
            "{0} xohlashingizni tushunaman. Bunga yetishish uchun biror reja tuzdingizmi?"
        ]
    },
    {
        pattern: /(.*) xato (.*)/i,
        responses: [
            "Xatolarni to'g'rilash har doim mumkin. Aynan qayerda xato bo'ldi?",
            "Dasturlashda ham, hayotda ham xatolar bo'lib turadi. Yechimini birga izlaymizmi?"
        ]
    },
    {
        pattern: /nega (.*) bo'lyapti/i,
        responses: [
            "Buning sababini topish oson emas. O'zingiz nima deb o'ylaysiz, nega {0} bo'lyapti?",
            "Balki bunga biz e'tibor bermagan qandaydir kichik omil sababchidir?"
        ]
    },
    {
        pattern: /zerikdim|charchadim/i,
        responses: [
            "Juda ko'p ishlab yubordingiz shekilli. Keling, chalg'ish uchun boshqa mavzuda gaplashamiz.",
            "Zerikish - bu yangi g'oyalar tug'ilishidan oldingi holat. Internetdan biror qiziq narsa qidiraymi?",
            "Sizdek inson ham zerikadimi? Qandaydir yangi loyiha boshlash vaqti kelmadimi?"
        ]
    }
];

// Odamdek fikrlaydigan asosiy funksiya
export const analyzeIntent = async (text, sessionId = 'default') => {
    try {
        const session = getSession(sessionId);
        if (!text) return { ui_component: 'TextBubble', data: { text: "Eshityapman... Nimadir demoqchimidingiz?" } };

        const input = text.toLowerCase().trim();

        // 1. Psixologik Pattern Matching (Odamdek suhbat qurish)
        for (let item of humanPatterns) {
            const match = input.match(item.pattern);
            if (match) {
                // Gap ichidan olingan o'zak so'zni oyna (reflection) dan o'tkazamiz
                const capturedText = match[1] || match[2] || match[0];
                const reflectedText = reflect(capturedText);
                
                // Random javob tanlash
                const randomResponse = item.responses[Math.floor(Math.random() * item.responses.length)];
                
                // Matnni tayyorlash
                const finalResponse = randomResponse.replace(/\{0\}/g, reflectedText);
                return { ui_component: 'TextBubble', data: { text: finalResponse } };
            }
        }

        // 2. Aniq ishlarga yo'naltirilgan buyruqlar (Ob-havo, qidiruv)
        if (input.includes('havo') || input.includes('harorat')) {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
                if (response.ok) {
                    const data = await response.json();
                    return { ui_component: 'TextBubble', data: { text: `Toshkentda hozir harorat **${data.current_weather.temperature}°C**. Lekin menimcha sizni ob-havo emas, boshqa narsa o'ylantiryapti. Shundaymi?` } };
                }
            } catch (e) {}
        }

        if (input.includes('qidir') || input.includes('top')) {
            try {
                const searchResults = await searchWeb(input);
                return { ui_component: 'TextBubble', data: { text: `Taqdim etilgan ma'lumotlar:\n\n` + searchResults.join('\n\n') + `\n\nBu siz qidirgan narsami?` } };
            } catch (err) {
                return { ui_component: 'ErrorWidget', data: { title: 'Qidiruvda xatolik', message: err.message } };
            }
        }

        // 3. Kontekstga moslashish (Hech bir qolipga tushmasa)
        session.history.push(input);
        
        const fallbacks = [
            `"${input}" dedingiz. Bu fikringiz haqida batafsilroq aytib berasizmi?`,
            "Tushunaman. Keyin-chi? Nima bo'ldi?",
            "Bu juda qiziq yondashuv. Buni hisobotda yoki biror loyihada ishlatamizmi?",
            "Rostini aytsam, hozir aynan nima nazarda tutganingizni chuqur tahlil qilyapman. Boshqacha so'zlar bilan tushuntira olasizmi?"
        ];
        
        const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        
        return {
            ui_component: 'TextBubble',
            data: { text: randomFallback }
        };

    } catch (error) {
        return { ui_component: 'ErrorWidget', data: { title: 'Tizim xatosi', message: "Uzr, fikrim bo'linib ketdi. Yana qaytara olasizmi?" } };
    }
};