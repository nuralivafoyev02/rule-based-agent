import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';
import { setupWebhook } from './telegram.js';

const nlp = new NLPProcessor();

// Orqa fonda ishlovchi sun'iy intellekt dvigatelini o'qitish
nlp.train('scraping', "saytdan yangiliklarni qidirib top narxlar qanday skraping qidir top");
nlp.train('telegram', "telegram botni ulash webhook o'rnatish sozlash");
nlp.train('weather', "ob havo qanday harorat necha gradus isitadimi sovuqmi");

// Kontekstli xotira (Sessiya davomida bot sizni eslab qoladi)
const BotContext = {
    lastTopic: null,
    sessionState: 'active',
    userName: 'Mirshod' // Tizim sizni doim o'z ismingiz bilan chaqiradi
};

/**
 * Matnni tahlil qilib, insoniy javob qaytaruvchi va API'larni boshqaruvchi funksiya
 */
export const analyzeIntent = async (text) => {
    try {
        if (!text || typeof text !== 'string') {
            return {
                ui_component: 'TextBubble',
                data: { text: `Eshityapman, ${BotContext.userName}. Nima demoqchi edingiz?` }
            };
        }

        const input = text.toLowerCase().trim();
        const predictedIntent = nlp.predict(input);

        // --- 1. Salomlashish va kirish ---
        if (input.includes('salom') || input.includes('qalay') || input.includes('yaxshimisiz')) {
            return {
                ui_component: 'TextBubble',
                data: { text: `Assalomu alaykum, ${BotContext.userName}! Ishlar qalay? Bugun qanday muammolarni hal qilamiz?` }
            };
        }

        // --- 2. Ish va biznes mantig'i ---
        if (input.includes('smeta') || input.includes('hisobot') || input.includes('loyiha') || input.includes('ish')) {
            BotContext.lastTopic = 'work';
            return {
                ui_component: 'TextBubble',
                data: { text: "Tushundim, ish bo'yicha ma'lumot kerak. Qaysi loyiha bo'yicha hisobot tayyorlay? Yoki smeta hujjatlari va aktivlar rentabelligini tahlil qilamizmi?" }
            };
        }

        // --- 3. Texnik/Kod mantig'i ---
        if (input.includes('kod') || input.includes('xatolik') || input.includes('deploy') || input.includes('bug')) {
            BotContext.lastTopic = 'technical';
            return {
                ui_component: 'TextBubble',
                data: { text: "Texnik qismda muammo bormi? Python yoki Vue kodini yuborsangiz, birgalikda tahlil qilib, yechim topamiz." }
            };
        }

        // --- 4. Hissiyot/Suhbat (Odamdek fikrlash) ---
        if (input.includes('zerikdim') || input.includes('gaplashaylik') || input.includes('o\'ylaysan')) {
            if (BotContext.lastTopic === 'work') {
                return {
                    ui_component: 'TextBubble',
                    data: { text: "Ishlar bilan o'zingizni juda charchatib yubordingiz. Balki tanaffus qilib, kelajakdagi loyihalar haqida suhbatlashamiz yoki biroz dam olamiz?" }
                };
            }
            return {
                ui_component: 'TextBubble',
                data: { text: `Zerikish ham ishning bir qismi, ${BotContext.userName}. Keling, dunyodagi yangi texnologiyalar yoki kelajakdagi Procoin kabi rejalaringiz haqida gaplashamiz. Nimalar rejalashtiryapsiz?` }
            };
        }

        // --- 5. Ob-havo (Odamdek gapirish + Haqiqiy API ma'lumoti) ---
        if (input.includes('havo') || input.includes('ob-havo') || input.includes('issiq') || predictedIntent === 'weather') {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
                if (response.ok) {
                    const data = await response.json();
                    return {
                        ui_component: 'TextBubble',
                        data: { text: `Toshkentda hozir harorat **${data.current_weather.temperature}°C**. Ob-havo o'zgaruvchan bo'lishi mumkin, lekin ishlaringizda doim barqarorlik tilayman, ${BotContext.userName}!` }
                    };
                }
            } catch (e) {
                // API ulanmasa, xato bermaydi, insoniy javobga o'tib ketadi
            }
            return {
                ui_component: 'TextBubble',
                data: { text: `Toshkentda ob-havo o'zgaruvchan, lekin sizning ishlaringizda hammasi barqaror bo'lishini tilayman, ${BotContext.userName}! Aniqroq harorat kerakmi?` }
            };
        }

        // --- 6. Skraping va Qidiruv (Internetga chiqish) ---
        if (predictedIntent === 'scraping' || input.includes('qidir') || input.includes('top')) {
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
                        data: { text: `🌐 ${BotContext.userName}, siz uchun qidiruv natijalari:\n\n` + searchResults.join('\n\n') }
                    };
                }
            } catch (err) {
                return {
                    ui_component: 'ErrorWidget',
                    data: { title: 'Qidiruvda xatolik', message: err.message }
                };
            }
        }

        // --- 7. Telegram Webhook ---
        if (predictedIntent === 'telegram' || (input.includes('telegram') && input.includes('ulash'))) {
            try {
                const urlMatch = input.match(/(https?:\/\/[^\s]+)/);
                if (!urlMatch) throw new Error('Telegram ulanishi uchun URL bering (Masalan: https://domain.uz).');
                
                await setupWebhook(urlMatch[1]);
                return {
                    ui_component: 'SuccessCard',
                    data: { title: 'Telegram ulandi!', message: `${urlMatch[1]} ga webhook o'rnatildi.` }
                };
            } catch (err) {
                return {
                    ui_component: 'ErrorWidget',
                    data: { title: 'Telegram xatoligi', message: err.message }
                };
            }
        }

        // --- 8. FALLBACK (Mukammal "Insoniy" javob) ---
        return {
            ui_component: 'SuggestionCard',
            data: { 
                suggestion: `${BotContext.userName}, bu fikringizni biroz murakkabroq qabul qildim. Aniqroq buyruq berasizmi yoki quyidagilardan birini tanlaysizmi?`,
                options: [
                    'Smeta hisobotini ko\'rish', 
                    'Texnik maslahat', 
                    'Tanaffus qilish'
                ]
            }
        };

    } catch (error) {
        console.error("Intent Error:", error);
        return {
            ui_component: 'ErrorWidget',
            data: { 
                title: 'Tizimda kichik uzilish', 
                message: "Bu fikringiz ustida o'ylayotgandim, lekin tizimda kichik xatolik bo'ldi. Yana bir bor urinib ko'ramizmi?" 
            }
        };
    }
};