import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';

const nlp = new NLPProcessor();

nlp.train('greeting', "salom qalay yaxshimisiz nima gap ishlaringiz qanday");
nlp.train('work', "smeta hisobot loyiha ishlar qanday ketyapti pul moliya");
nlp.train('weather', "ob havo qanday harorat necha gradus isitadimi sovuqmi");
nlp.train('joke', "hazil ayt kuldirib yubor zerikdim prikol ayt");
nlp.train('search', "qidir internetdan top skraping qil nima degani");

const sessions = {};
function getSession(id) {
    if (!sessions[id]) sessions[id] = { state: 'idle', history: [], mood: 'neutral' };
    return sessions[id];
}

export const analyzeIntent = async (text, sessionId = 'default') => {
    try {
        const session = getSession(sessionId);
        const input = text.toLowerCase().trim();
        
        if (!input) return { ui_component: 'TextBubble', data: { text: "Eshityapman, nima demoqchi edingiz?" } };

        // Kontekstni yangilash va kayfiyatni tahlil qilish
        session.history.push(input);
        if (session.history.length > 4) session.history.shift();
        const sentiment = nlp.analyzeSentiment(input);
        
        // Mantiqiy tahlil (Xato yozilsa ham nlp.predict uni tushunadi)
        const intent = nlp.predict(input);

        // 1. Kayfiyatga moslashish (Empathy)
        if (sentiment === 'negative' && intent === 'unknown') {
            return { ui_component: 'TextBubble', data: { text: "Matningizdan biroz kayfiyatingiz yo'qligini yoki charchaganingizni sezyapman. Muammo nimada? Yordam bera olamanmi?" } };
        }
        
        if (sentiment === 'positive' && intent === 'unknown') {
            return { ui_component: 'TextBubble', data: { text: "Zo'r! Kayfiyatingiz yaxshiligidan xursandman. Ishlarni davom ettiramizmi?" } };
        }

        // 2. Hazil va insoniylik
        if (intent === 'joke' || input.includes('hazil')) {
            const jokes = [
                "Dasturchining eng katta yolg'oni: 'Bu kodni ertaga refaktor qilaman'. 😂",
                "Nega sun'iy intellekt xafa bo'lmaydi? Chunki uning yuragi o'rnida protsessor bor! Lekin siz xafa bo'lmang.",
                "Wi-Fi yo'qolib qolsa, oila a'zolarim bilan gaplashib ko'rdim. Yaxshi odamlar ekan! 😁"
            ];
            return { ui_component: 'TextBubble', data: { text: jokes[Math.floor(Math.random() * jokes.length)] } };
        }

        // 3. Ish va Kontekst
        if (intent === 'work') {
            session.state = 'working';
            return { ui_component: 'TextBubble', data: { text: "Ish bo'yicha suhbatni boshladik. Aynan qaysi loyiha ustida hisob-kitob qilamiz?" } };
        }

        // 4. Ob-havo
        if (intent === 'weather') {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
                if (response.ok) {
                    const data = await response.json();
                    return { ui_component: 'TextBubble', data: { text: `Toshkentda hozir harorat **${data.current_weather.temperature}°C**. Shamol: ${data.current_weather.windspeed} km/s.` } };
                }
            } catch (e) {}
        }

        // 5. Qidiruv va Tahlil
        if (intent === 'search' || input.includes('qidir')) {
            try {
                const searchResults = await searchWeb(input);
                return { ui_component: 'TextBubble', data: { text: `Siz uchun quyidagilarni topdim:\n\n` + searchResults.join('\n\n') } };
            } catch (err) {
                return { ui_component: 'ErrorWidget', data: { title: 'Qidiruvda xatolik', message: err.message } };
            }
        }

        // 6. Salomlashish
        if (intent === 'greeting') {
            return { ui_component: 'TextBubble', data: { text: "Assalomu alaykum! Sizni eshitaman, qanday yordam bera olaman?" } };
        }

        // 7. Kontekstli Fallback (Oldingi gapga ulanish)
        if (session.state === 'working') {
            return { ui_component: 'TextBubble', data: { text: "Tushunarli. Siz aytgan bu ma'lumotni ish jarayonida qayd qilib qo'ydim. Yana qanday ko'rsatmalar bor?" } };
        }

        // Agar umuman tushunmasa
        return {
            ui_component: 'SuggestionCard',
            data: { 
                suggestion: `Buni qanday tushunishni o'ylab qoldim. Quyidagilardan birini amalga oshiramizmi?`,
                options: ['Qidiruv tizimiga berish', 'Kayfiyatni ko\'tarish', 'Smetani davom ettirish']
            }
        };

    } catch (error) {
        return { ui_component: 'ErrorWidget', data: { title: 'Tizimda uzilish', message: "Kichik mantiqiy xatolik bo'ldi." } };
    }
};