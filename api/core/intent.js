import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';
import { setupWebhook } from './telegram.js';

const nlp = new NLPProcessor();

// O'QITISH BAZASI (DATASET)
nlp.train('scraping', "saytdan yangiliklarni qidirib top narxlar qanday");
nlp.train('scraping', "internetdan malumot skraping qil qidir topib ber");

nlp.train('telegram', "telegram botni ulash webhook o'rnatish");
nlp.train('telegram', "bot sozlamalarini to'g'rila va telegram ula");

nlp.train('weather', "ob havo qanday harorat necha gradus isitadimi sovuqmi");
nlp.train('weather', "bugun havo qanaqa bo'ladi issiqmi yomg'ir yog'adimi");
nlp.train('weather', "toshkentda havo qanday ko'chada harorat qanaqa");

nlp.train('greeting', "salom qalay nima gap yaxshimisiz ishlaringiz qanday");

nlp.train('chitchat', "manga shunday narsa kerakki nima qilish kerak bilmadim zerikdim");
nlp.train('chitchat', "shunchaki gaplashmoqchi edim odamday gaplashaylik nimadur gapir");

export const analyzeIntent = async (text) => {
    const predictedIntent = nlp.predict(text);

    // 1. Yangilangan va ishonchli Ob-havo bloki
    if (predictedIntent === 'weather') {
        try {
            // Open-Meteo API: Mutlaqo bepul, bloklanmaydi. Toshkent koordinatalari: 41.2646, 69.2163
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
            if (!response.ok) throw new Error("Ob-havo ma'lumotlarini yuklashda xatolik yuz berdi.");
            
            const data = await response.json();
            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;
            
            return {
                ui_component: 'TextBubble',
                data: { text: `Toshkent shahrida hozirgi harorat: **${temp}°C** 🌡️\nShamol tezligi: **${wind} km/soat** 💨\n\n*(Ma'lumotlar sun'iy yo'ldoshning ochiq radaridan olinmoqda)*` }
            };
        } catch (err) {
             return {
                ui_component: 'ErrorWidget',
                data: { title: 'Ob-havo xatoligi', message: err.message }
            };
        }
    }

    if (predictedIntent === 'chitchat') {
        return {
            ui_component: 'TextBubble',
            data: { text: "Rostini aytsam, men algoritmlar asosida ishlaydigan tizimman va insoniy tuyg'ularni his qilmayman.\n\nLekin zerikkan bo'lsangiz, internetdan biror qiziqarli yangilik topib berishim yoki ob-havoni aytib berishim mumkin. Qaysi birini bajaramiz?" }
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
                    data: { text: `🌐 Qidiruv natijalari:\n\n` + searchResults.join('\n\n') }
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
            if(!hookUrl) throw new Error('Telegram ulanishi uchun URL bering (Masalan: https://domain.uz).');

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
            data: { text: "Assalomu alaykum! Men sizning shaxsiy yordamchingizman. Menga saytlarni tahlil qilishni yoki ob-havoni bilishni buyurishingiz mumkin." }
        };
    }

    return {
        ui_component: 'SuggestionCard',
        data: { 
            suggestion: 'Kechirasiz, men bu gapingizni tushunmadim. Menga aniqroq buyruq bering.',
            options: ['kun.uz maqolalari', 'Ob-havo qanday?', 'Telegram botni ulash']
        }
    };
};