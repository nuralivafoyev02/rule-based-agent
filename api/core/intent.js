import { NLPProcessor } from './nlp.js';
import { scrapeWebsite } from './scraper.js';
import { setupWebhook } from './telegram.js';

// 1. NLP dvigatelini ishga tushiramiz
const nlp = new NLPProcessor();

// 2. Tizimni Ehtimolliklar nazariyasiga o'qitamiz (Dataset kiritish)
nlp.train('scraping', "saytdan yangiliklarni qidirib top narxlar qanday");
nlp.train('scraping', "saytdan malumot skraping qil va menga topib ber");
nlp.train('telegram', "telegram botni ulash kerak webhook o'rnat");
nlp.train('telegram', "bot sozlamalarini to'g'rila va telegram ula");
nlp.train('greeting', "salom qalay nima gap yaxshimisiz ishlaringiz qanday");

export const analyzeIntent = async (text) => {
    // 3. Matn maqsadini bashorat qilish
    const predictedIntent = nlp.predict(text);

    // 4. Ehtimollik natijasiga qarab harakatlanish
    if (predictedIntent === 'scraping') {
        try {
            const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
            const targetUrl = urlMatch ? urlMatch[1] : 'https://kun.uz'; 
            const results = await scrapeWebsite(targetUrl);
            
            return {
                ui_component: 'TextBubble',
                data: { text: `Qidiruv natijalari (${targetUrl}):\n\n` + results.join('\n- ') }
            };
        } catch (err) {
            throw new Error(`Skrapingda xatolik: ${err.message}`);
        }
    }

    if (predictedIntent === 'telegram') {
        try {
            const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
            const hookUrl = urlMatch ? urlMatch[1] : null;
            
            if(!hookUrl) {
                return {
                    ui_component: 'ErrorWidget',
                    data: { title: 'URL topilmadi', message: 'Telegram ulanishi uchun URL bering.' }
                };
            }

            await setupWebhook(hookUrl);
            return {
                ui_component: 'SuccessCard',
                data: { title: 'Telegram ulandi!', message: `${hookUrl} ga webhook o'rnatildi.` }
            };
        } catch (err) {
            throw new Error(`Telegram API xatoligi: ${err.message}`);
        }
    }

    if (predictedIntent === 'greeting') {
        return {
            ui_component: 'TextBubble',
            data: { text: "Assalomu alaykum! Men sof algoritmlar va matritsalar asosida ishlovchi aqlli yordamchingizman. Veb-saytlardan ma'lumot izlash yoki tizimlarni ulashda yordam beraman." }
        };
    }

    // Hech qaysi parametr to'g'ri kelmasa (Fallback)
    return {
        ui_component: 'SuggestionCard',
        data: { 
            suggestion: `Kechirasiz, ma'lumotlar bazamda bu ehtimollik juda past baholandi. Boshqacha tushuntirib ko'rasizmi?`,
            options: ['Skraping qoidalari', 'Telegram sozlamalari']
        }
    };
};