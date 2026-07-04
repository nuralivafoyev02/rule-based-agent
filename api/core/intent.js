import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';
import { setupWebhook } from './telegram.js';

const nlp = new NLPProcessor();

// O'QITISH BAZASI (DATASET)
nlp.train('scraping', "saytdan yangiliklarni qidirib top narxlar qanday");
nlp.train('scraping', "internetdan malumot skraping qil va menga topib ber");
nlp.train('scraping', "qidir nima gaplar bor ekan axborot top");

nlp.train('telegram', "telegram botni ulash webhook o'rnatish");
nlp.train('telegram', "bot sozlamalarini to'g'rila va telegram ula");

nlp.train('greeting', "salom qalay nima gap yaxshimisiz ishlaringiz qanday");

// YANGI: Oddiy suhbatlar va zerikish (Chitchat)
nlp.train('chitchat', "manga shunday narsa kerakki nima qilish kerak bilmadim zerikdim");
nlp.train('chitchat', "shunchaki gaplashmoqchi edim odamday gaplashaylik nimadur gapir");
nlp.train('chitchat', "hafa bo'ldim charchadim ishlashga xohish yo'q kerak emas");


export const analyzeIntent = async (text) => {
    const predictedIntent = nlp.predict(text);

    // 1. Agar foydalanuvchi shunchaki zerikib gaplashmoqchi bo'lsa
    if (predictedIntent === 'chitchat') {
        return {
            ui_component: 'TextBubble',
            data: { text: "Rostini aytsam, men yirik sun'iy intellekt modeli emasman. Men qat'iy algoritmlar asosida yozilganman, shuning uchun odamdek dildan suhbat qura olmayman.\n\nLekin zerikkan bo'lsangiz, siz uchun internetdan biror qiziqarli yangilik yoki maqola qidirib topishim mumkin. Qidiramizmi?" }
        };
    }

    if (predictedIntent === 'scraping') {
        try {
            let targetUrl = null;
            const exactUrlMatch = text.match(/(https?:\/\/[^\s]+)/);
            const domainMatch = text.match(/([a-z0-9\-.]+\.(uz|com|org|net|ru|info))/i);

            if (exactUrlMatch) targetUrl = exactUrlMatch[1];
            else if (domainMatch) targetUrl = `https://${domainMatch[1]}`;

            if (targetUrl) {
                const results = await scrapeWebsite(targetUrl);
                return {
                    ui_component: 'TextBubble',
                    data: { text: `Tahlil qilinmoqda (${targetUrl}):\n\n- ` + results.join('\n- ') }
                };
            } else {
                const searchResults = await searchWeb(text);
                return {
                    ui_component: 'TextBubble',
                    data: { text: `🌐 Internet qidiruv natijalari:\n\n` + searchResults.join('\n\n') }
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
                    data: { title: 'URL topilmadi', message: 'Telegram ulanishi uchun URL bering (Masalan: https://domain.uz).' }
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
            data: { text: "Assalomu alaykum! Men sizning shaxsiy yordamchingizman. Menga internetdan biror narsa topishni yoki veb-saytlarni tahlil qilishni buyurishingiz mumkin." }
        };
    }

    // Hech qaysi toifaga tushmasa
    return {
        ui_component: 'SuggestionCard',
        data: { 
            suggestion: 'Kechirasiz, men bu gapingizni tushunmadim. Menga aniqroq buyruq bering.',
            options: ['O\'zbekiston yangiliklarini top', 'kun.uz maqolalari', 'Telegram botni ulash']
        }
    };
};