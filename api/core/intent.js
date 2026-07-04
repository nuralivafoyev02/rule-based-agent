import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';

const nlp = new NLPProcessor();

// Niyatlarni o'qitish
nlp.train('greeting', "salom qalay nima gap yaxshimisiz ishlaringiz qanday");
nlp.train('work', "smeta hisobot loyiha ishlar vazifa monitor pul uyqur procoin");
nlp.train('weather', "ob havo qanday harorat necha gradus isitadimi sovuqmi");

const sessions = {};
function getSession(id) {
    if (!sessions[id]) {
        sessions[id] = { state: 0, history: [] }; 
    }
    return sessions[id];
}

const substitutions = {
    "men": "siz", "man": "siz", "menga": "sizga", "meni": "sizni", 
    "qildim": "qildingiz", "boraman": "borasiz", "xohlayman": "xohlaysiz", 
    "charchadim": "charchadingiz"
};

function reflect(text) {
    if (!text) return '';
    return text.split(' ').map(word => {
        const cleanWord = word.replace(/[^\w\s\'oʻgʻ]/gi, '');
        return substitutions[cleanWord] || word;
    }).join(' ');
}

// ELIZA Patternlari
const elizaPatterns = [
    { pattern: /menga (.*) kerak/i, responses: ["Tushunarli. Nega aynan {0} kerak sizga?", "Buning muqobil varianti yo'qmi?"] },
    { pattern: /ishlar (.*)/i, responses: ["Nega ishlar {0} deb o'ylaysiz?", "Buni hal qilish uchun qayerdan boshlaymiz?"] },
    { pattern: /kayfiyat (.*)/i, responses: ["Kayfiyatingiz {0} ekanligini tushunaman. Bunga nima sabab bo'ldi?", "Balki biroz chalg'ish uchun qahva icharmiz?"] },
    { pattern: /muammo (.*)/i, responses: ["Xavotir olmang, buni hal qilamiz. {0} bo'yicha aniq qanday yordam kerak?"] }
];

// Gemini LLM funksiyasi
const geminiApiKey = process.env.GEMINI_API_KEY;

async function askGemini(prompt) {
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY topilmadi (.env faylini tekshiring)");
    }
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": geminiApiKey
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API xatosi: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }
    throw new Error("Gemini javobini o'qib bo'lmadi");
}

export const analyzeIntent = async (text, history = [], userId = 'default') => {
    try {
        const session = getSession(userId);
        if (!text) return { ui_component: 'TextBubble', data: { text: "Eshityapman, nima demoqchi edingiz?" } };

        const input = text.toLowerCase().trim();

        // ==========================================
        // 1. QAT'IY QOPQON: So'kinish va jargonlarni ushlash
        // ==========================================
        const profanityRegex = /(dnx|jal|naxxoy|poshel|qoton|qotoq|bla|skay|gandon|omi|dalbayob|chort|blyat|blyad|suka)/i;
        if (profanityRegex.test(input) || input.includes('skay') || input.includes('qotoni') || input.includes('omi')) {
            const angryResponses = [
                "O'oo, asablar tarangku! Keling, so'kinmasdan hal qilamiz. 😅",
                "Bunday so'zlar bilan muammo hal bo'lmaydi. Yaxshisi, nima bo'lganini odamdek ayting.",
                "Tushunaman, jahl ustida yozdingiz. Lekin men shunchaki botman, asabingizni asrang!",
                "So'kinish shart emas! Muammoni aytsangiz, yordam berishga harakat qilaman."
            ];
            return { ui_component: 'TextBubble', data: { text: angryResponses[Math.floor(Math.random() * angryResponses.length)] } };
        }

        // 2. QISQA JAVOBLAR (Yo'q / Ha kabi gaplarga zerikarli default javob qaytarmaslik)
        if (/^(yoq|yo|yo'q|yok|yoq|yoo)$/i.test(input)) {
            return { ui_component: 'TextBubble', data: { text: "Tushunarli, yo'q bo'lsa yo'q. Boshqa nima xizmat?" } };
        }
        if (/^(ha|xa|hm|ok|xop|mayli)$/i.test(input)) {
            return { ui_component: 'TextBubble', data: { text: "Yaxshi, kelishdik. Davom etamizmi?" } };
        }

        // 3. NLP orqali qolgan niyatlarni aniqlash
        const intent = nlp.predict(input);

        // 3.1. Salomlashish (Faqat qisqa gaplar, salom so'zi ishtirok etganda va u so'roq gap bo'lmaganda)
        const isQuestion = (input.includes('qaysi') || input.includes('kim') || input.includes('qayer') || input.includes('nega') || input.includes('qachon') || (input.includes('nima') && !input.includes('gap')) || (input.includes('qanday') && !input.includes('ishlar') && !input.includes('salom')));
        
        if (!isQuestion && ((intent === 'greeting' && input.length < 30) || input === 'salom' || input.startsWith('salom') || input.startsWith('assalomu alaykum'))) {
            return { ui_component: 'TextBubble', data: { text: "Assalomu alaykum! Ishga tayyormisiz? Bugun nima qilamiz?" } };
        }
        
        // 3.2. Ish (Work)
        if (session.state === 1) { 
            session.state = 0;
            return { ui_component: 'SuccessCard', data: { title: 'Vazifa qabul qilindi', message: `"${text}" bo'yicha ma'lumotlarni tahlil qilishni boshladim.` } };
        }
        if (intent === 'work' && (input.includes('smeta') || input.includes('hisobot') || input.includes('loyiha') || input.includes('ish') || input.includes('vazifa') || input.includes('uyqur') || input.includes('procoin'))) {
            session.state = 1; 
            return { ui_component: 'TextBubble', data: { text: "Loyihalar holati bo'yicha hisobot tayyorlaymi? Bright Future House, Uyqur ERP yoki Procoin qaysi biri ustida ishlaymiz?" } };
        }

        // 3.3. Ob-havo (Weather)
        if (intent === 'weather' && (input.includes('havo') || input.includes('harorat') || input.includes('gradus') || input.includes('issiq') || input.includes('sovuq'))) {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
                if (response.ok) {
                    const data = await response.json();
                    return {
                        ui_component: 'TextBubble',
                        data: { text: `Toshkentda hozir harorat **${data.current_weather.temperature}°C**. Ob-havo o'zgaruvchan bo'lishi mumkin, lekin ishlaringizda doim barqarorlik tilayman!` }
                    };
                }
            } catch (e) {}
            return { ui_component: 'TextBubble', data: { text: "Toshkentda ob-havo o'zgaruvchan, lekin sizning ishlaringizda hammasi barqaror bo'lishini tilayman!" } };
        }

        // 3.4. Muallif haqida
        if (input.includes('yaratgan') || input.includes('yozgan') || input.includes('muallif') || input.includes('nurali')) {
            return {
                ui_component: 'TextBubble',
                data: { text: "Meni **Nurali Vafoyev** yaratganlar. Men u kishining shaxsiy yordamchisi hisoblanaman va kundalik vazifalarda ko'maklashaman." }
            };
        }

        // 3.5. Imkoniyatlar (Capabilities)
        if (input.includes('imkoniyat') || input.includes('nima qila olasan') || input.includes('yordam ber') || input.includes('vazifang')) {
            return {
                ui_component: 'TextBubble',
                data: { 
                    text: `Men quyidagi vazifalarni bajara olaman:\n\n1. 🌐 **Internetdan qidiruv:** Veb-saytlardan ma'lumot qidirish.\n2. ⛅️ **Ob-havo:** Toshkent uchun ob-havo ma'lumotlari.\n3. 🧠 **AI Yordamchi:** Har qanday savollarga Gemini orqali mukammal javob berish.\n4. 💻 **Kod tahlili:** Kodlardagi xatolarni topish va tushuntirish.`
                }
            };
        }

        // 3.6. Internetdan qidiruv (Search / Scrape)
        if (input.includes('qidir') || input.includes('top') || input.includes('search') || input.includes('sayt') || input.includes('url')) {
            try {
                let targetUrl = null;
                const exactUrlMatch = input.match(/(https?:\/\/[^\s]+)/);
                const domainMatch = input.match(/([a-z0-9\-.]+\.(uz|com|org|net|ru|info))/i);

                if (exactUrlMatch) targetUrl = exactUrlMatch[1];
                else if (domainMatch) targetUrl = `https://${domainMatch[1]}`;

                if (targetUrl) {
                    const results = await scrapeWebsite(targetUrl);
                    return {
                        ui_component: 'TextBubble',
                        data: { text: `Tahlil qilinmoqda (${targetUrl}):\n\n- ` + results.join('\n- ') }
                    };
                } else {
                    const searchResults = await searchWeb(input);
                    return {
                        ui_component: 'TextBubble',
                        data: { text: `🌐 Siz uchun qidiruv natijalari:\n\n` + searchResults.join('\n\n') }
                    };
                }
            } catch (err) {
                // Agar qidiruvda xatolik bo'lsa, Gemini'ga o'tadi
            }
        }

        // 4. ELIZA - Refleksiv suhbat (Faqat juda qisqa suhbatlar uchun)
        if (input.split(' ').length <= 5) {
            for (let item of elizaPatterns) {
                const match = input.match(item.pattern);
                if (match) {
                    const capturedText = match[1];
                    const reflectedText = reflect(capturedText);
                    const randomResponse = item.responses[Math.floor(Math.random() * item.responses.length)];
                    return { ui_component: 'TextBubble', data: { text: randomResponse.replace(/\{0\}/g, reflectedText) } };
                }
            }
        }

        // 5. GEMINI FALLBACK (Qiyin holatlarda aqli yetmaganda)
        try {
            const geminiResponse = await askGemini(text);
            return {
                ui_component: 'TextBubble',
                data: { text: geminiResponse }
            };
        } catch (geminiError) {
            console.error("Gemini Error:", geminiError);
        }

        // 6. Default Fallback (Oxirgi chora)
        session.history.push(input);
        if (input.split(' ').length <= 2) {
             return { ui_component: 'TextBubble', data: { text: "Xo'sh? Fikringizni sal kengroq yozing, tushunmadim." } };
        }

        const fallbacks = [
            "Bu haqda biroz ko'proq ma'lumot bera olasizmi?",
            "Tushunarli... Keyin-chi? Nima bo'ldi?",
            "Sizningcha, nima uchun bunday holat yuzaga keldi?"
        ];
        return { ui_component: 'TextBubble', data: { text: fallbacks[Math.floor(Math.random() * fallbacks.length)] } };

    } catch (error) {
        return { ui_component: 'ErrorWidget', data: { title: 'Tizim xatosi', message: "Kichik uzilish bo'ldi. Yana qaytara olasizmi?" } };
    }
};