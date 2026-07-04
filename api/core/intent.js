import { scrapeWebsite } from './scraper.js';
import { setupWebhook } from './telegram.js';

export const analyzeIntent = async (text) => {
    const lowerText = text.toLowerCase();

    // 1-Qoida: Skraping buyruqlari
    if (/(skrap|qidir|saytdan|yangilik|narx)/.test(lowerText)) {
        try {
            // URL ni ajratib olishga urinish, yo'qsa default sayt
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

    // 2-Qoida: Telegram Webhook buyruqlari
    if (/(telegram|bot|ulash|webhook)/.test(lowerText)) {
        try {
            const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
            const hookUrl = urlMatch ? urlMatch[1] : null;
            
            if(!hookUrl) {
                return {
                    ui_component: 'ErrorWidget',
                    data: { title: 'URL topilmadi', message: 'Telegram webhook ulash uchun menga Vercel URL manzilingizni bering.' }
                };
            }

            const isSuccess = await setupWebhook(hookUrl);
            return {
                ui_component: 'SuccessCard',
                data: { title: 'Telegram ulandi!', message: `${hookUrl} manziliga webhook muvaffaqiyatli o'rnatildi.`, buttonText: 'Botni tekshirish' }
            };
        } catch (err) {
            throw new Error(`Telegram API xatoligi: ${err.message}`);
        }
    }

    // 3-Qoida: Tushunarsiz buyruq (Fallback)
    return {
        ui_component: 'SuggestionCard',
        data: { 
            suggestion: 'Kechirasiz, bu buyruqni tushunmadim. Menga o\'rgatmoqchimisiz?',
            options: ['Skraping qoidalari', 'Telegram sozlamalari']
        }
    };
};