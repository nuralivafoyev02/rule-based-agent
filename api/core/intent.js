import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';
import { setupWebhook } from './telegram.js';

const nlp = new NLPProcessor();

nlp.train('scraping', "saytdan yangiliklarni qidirib top narxlar qanday");
nlp.train('scraping', "internetdan malumot skraping qil va menga topib ber");
nlp.train('scraping', "qidir nima gaplar bor ekan axborot top");
nlp.train('telegram', "telegram botni ulash kerak webhook o'rnat");
nlp.train('telegram', "bot sozlamalarini to'g'rila va telegram ula");
nlp.train('greeting', "salom qalay nima gap yaxshimisiz ishlaringiz qanday");

export const analyzeIntent = async (text) => {
    const predictedIntent = nlp.predict(text);

    if (predictedIntent === 'scraping') {
        try {
            let targetUrl = null;

            // 1. Matn ichida aniq havola bormi? (https bilan)
            const exactUrlMatch = text.match(/(https?:\/\/[^\s]+)/);
            
            // 2. Havola https siz (masalan, kun.uz, olx.uz) yozilganmi?
            const domainMatch = text.match(/([a-z0-9\-]+\.(uz|com|org|net|ru|info))/i);

            if (exactUrlMatch) {
                targetUrl = exactUrlMatch[1];
            } else if (domainMatch) {
                targetUrl = `https://${domainMatch[1]}`;
            }

            // MANTIQ: Agar URL topilsa saytni o'qiydi, topilmasa internetdan qidiradi
            if (targetUrl) {
                const results = await scrapeWebsite(targetUrl);
                return {
                    ui_component: 'TextBubble',
                    data: { text: `Tahlil qilinmoqda (${targetUrl}):\n\n- ` + results.join('\n- ') }
                };
            } else {
                // Hech qanday sayt ko'rsatilmagan, demak umuman internetdan qidiramiz
                const searchResults = await searchWeb(text);
                return {
                    ui_component: 'TextBubble',
                    data: { text: `🌐 Internet bo'ylab qidiruv natijalari:\n\n` + searchResults.join('\n\n') }
                };
            }
        } catch (err) {
            return {
                ui_component: 'ErrorWidget',
                data: { title: 'Qidiruvda xatolik', message: err.message }
            };
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
            return {
                ui_component: 'ErrorWidget',
                data: { title: 'Telegram xatoligi', message: err.message }
            };
        }
    }

    if (predictedIntent === 'greeting') {
        return {
            ui_component: 'TextBubble',
            data: { text: "Assalomu alaykum! Men aqlli yordamchingizman. Menga internetdan biror narsa topishni yoki saytlarni o'qishni buyurishingiz mumkin. Sinab ko'ring!" }
        };
    }

    return {
        ui_component: 'SuggestionCard',
        data: { 
            suggestion: 'Kechirasiz, ma\'lumotlar bazamda bu ehtimollik juda past baholandi. Boshqacha tushuntirib ko\'rasizmi?',
            options: ['O\'zbekiston yangiliklarini top', 'kun.uz dagi maqolalar', 'Telegram botni ulash']
        }
    };
};