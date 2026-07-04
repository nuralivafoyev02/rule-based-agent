import { NLPProcessor } from './nlp.js';
import { scrapeWebsite, searchWeb } from './scraper.js';
import { setupWebhook } from './telegram.js';

const nlp = new NLPProcessor();

// Orqa fonda ishlovchi sun'iy intellekt dvigatelini o'qitish
nlp.train('scraping', "saytdan yangiliklarni qidirib top narxlar qanday skraping qidir top");
nlp.train('telegram', "telegram botni ulash webhook o'rnatish sozlash");
nlp.train('weather', "ob havo qanday harorat necha gradus isitadimi sovuqmi");
nlp.train('greeting', "salom qalay yaxshimisiz nima gap nma gaplar xormang slm");
nlp.train('capabilities', "nimalar qila olasan yordam berish imkoniyatlaring nima nima qila oladi vazifang nima");
nlp.train('author', "kim yaratgan seni kim yozgan muallifing kim yaratuvching kim kim tayyorlagan nurali vafoyev nurali");
nlp.train('bot_info', "isming nima sen kimsan o'zing haqingda yordamchi agent");
nlp.train('reminder', "ertaga soat 9da ishga borishim kerak dushanba kuni uchrashuv bor eslatib qo'y eslatma yozib ol uchrashuv borligini eslat");

// Kontekstli xotira har bir foydalanuvchi uchun alohida
const userSessions = new Map();

function getUserSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            lastTopic: null,
            userName: 'Boshliq',
            sessionState: 'active'
        });
    }
    return userSessions.get(userId);
}

/**
 * Matnni tahlil qilib, insoniy javob qaytaruvchi va API'larni boshqaruvchi funksiya
 */
export const analyzeIntent = async (text, history = [], userId = 'default_user') => {
    try {
        const session = getUserSession(userId);

        if (!text || typeof text !== 'string') {
            return {
                ui_component: 'TextBubble',
                data: { text: `Eshityapman, ${session.userName}. Nima demoqchi edingiz?` }
            };
        }

        const input = text.toLowerCase().trim();

        // --- 0. Kontekstual bog'liqlikni tekshirish (History) ---
        // Avval pending reminder (kutilayotgan eslatma) tasdiqlanishini tekshiramiz
        if (session.pendingReminder && (Date.now() - session.pendingReminder.timestamp < 120000)) {
            if (input === 'ha' || input.includes('mayli') || input.includes('albatta') || input.includes('saqlang')) {
                session.pendingReminder = null;
                return {
                    ui_component: 'TextBubble',
                    data: { text: "Saqlab qoldim va o'z vaqtida eslataman." }
                };
            }
            if (input.includes('yo\'q') || input.includes('kerakmas') || input.includes('bekor') || input.includes('atkaz') || input === 'no') {
                session.pendingReminder = null;
                return {
                    ui_component: 'TextBubble',
                    data: { text: "Xo'p, eslatmayman." }
                };
            }
        }

        const predictedIntent = nlp.predict(input);
        // Agar gap "ertaga", "unda", "ha" kabi so'zlardan boshlansa, oldingi mavzuga qaraymiz.
        if (input.includes('ertaga') || input.includes('qanaqa') || input.includes('keyinchi')) {
            if (session.lastTopic === 'weather' || (history.length > 0 && history[history.length - 1].message.includes('harorat'))) {
                return {
                    ui_component: 'TextBubble',
                    data: { text: `Ertaga harorat biroz o'zgarishi kutilmoqda. Lekin har qanday sharoitda ham ishda muvaffaqiyat tilayman, ${session.userName}!` }
                };
            }
            if (session.lastTopic === 'work') {
                return {
                    ui_component: 'TextBubble',
                    data: { text: `Ertangi ish rejasiga kelsak, avval bugungi hisobotlarni tugatib olishimiz kerak.` }
                };
            }
        }
        
        if (input === 'ha' || input === 'tushundim' || input === "xo'p") {
            return {
                ui_component: 'TextBubble',
                data: { text: `Juda yaxshi! Yana biror nima kerak bo'lsa, tortinmay yozavering.` }
            };
        }

        // --- 1. Salomlashish va kirish ---
        if (input.includes('salom') || input.includes('qalay') || input.includes('yaxshimisiz') || input.includes('nima gap') || input.includes('nma gap') || predictedIntent === 'greeting') {
            return {
                ui_component: 'TextBubble',
                data: { text: `Assalomu alaykum, ${session.userName}! Ishlar qalay? Bugun qanday muammolarni hal qilamiz?` }
            };
        }

        // --- 1.1. Muallif/Yaratuvchi haqida ---
        if (predictedIntent === 'author' || input.includes('yaratgan') || input.includes('yozgan') || input.includes('muallif') || input.includes('nurali')) {
            return {
                ui_component: 'TextBubble',
                data: { text: `Meni **Nurali Vafoyev** yaratganlar. Men u kishining shaxsiy yordamchisi hisoblanaman va turli kundalik vazifalarni bajarishda yordam beraman.` }
            };
        }

        // --- 1.2. Bot haqida ma'lumot ---
        if (predictedIntent === 'bot_info' || input.includes('kimsan') || input.includes('isming')) {
            return {
                ui_component: 'TextBubble',
                data: { text: `Men sizning **Yordamchi Agentingizman**. Mening vazifam sizga ma'lumotlar qidirishda, ob-havoni tekshirishda, dasturlash masalalarida va boshqa ishlaringizda yordamlashishdir.` }
            };
        }

        // --- 1.3. Imkoniyatlar (Capabilities) ---
        if (predictedIntent === 'capabilities' || input.includes('imkoniyat') || input.includes('nima qila olasan') || input.includes('yordam ber') || input.includes('vazifang')) {
            return {
                ui_component: 'TextBubble',
                data: { 
                    text: `Men quyidagi vazifalarni bajara olaman:\n\n1. 🌐 **Veb Skraping va Qidiruv:** Har qanday saytdan ma'lumotlarni yig'ib berish yoki internetdan qidirish.\n2. ⛅️ **Ob-havo ma'lumotlari:** Toshkent va boshqa hududlar uchun joriy ob-havo haroratini ko'rsatish.\n3. 🤖 **Telegram Bot:** Telegram botlaringiz uchun webhook sozlash va ulash.\n4. 💻 **Texnik yordam:** Python, Vue yoki boshqa kodlaringizni tahlil qilish va xatolarni tuzatish.\n5. 💬 **Erkin suhbat:** Siz bilan suhbatlashish, ishlardan biroz chalg'ib dam olishingizga ko'maklashish.`
                }
            };
        }

        // --- 1.4. Eslatmalar (Reminders) ---
        if (predictedIntent === 'reminder' || input.includes('eslat') || input.includes('borishim kerak') || input.includes('uchrashuvim bor') || input.includes('bajarishim kerak')) {
            session.pendingReminder = {
                text: text,
                timestamp: Date.now()
            };
            return {
                ui_component: 'TextBubble',
                data: { text: "O'sha kuni eslatib yuboraymi?" }
            };
        }

        // --- 2. Ish va biznes mantig'i ---
        if (input.includes('smeta') || input.includes('hisobot') || input.includes('loyiha') || input.includes('ish')) {
            session.lastTopic = 'work';
            return {
                ui_component: 'TextBubble',
                data: { text: "Tushundim, ish bo'yicha ma'lumot kerak. Qaysi loyiha bo'yicha hisobot tayyorlay? Yoki smeta hujjatlari va aktivlar rentabelligini tahlil qilamizmi?" }
            };
        }

        // --- 3. Texnik/Kod mantig'i ---
        if (input.includes('kod') || input.includes('xatolik') || input.includes('deploy') || input.includes('bug')) {
            session.lastTopic = 'technical';
            return {
                ui_component: 'TextBubble',
                data: { text: "Texnik qismda muammo bormi? Python yoki Vue kodini yuborsangiz, birgalikda tahlil qilib, yechim topamiz." }
            };
        }

        // --- 4. Hissiyot/Suhbat (Odamdek fikrlash) ---
        if (input.includes('zerikdim') || input.includes('gaplashaylik') || input.includes('o\'ylaysan')) {
            if (session.lastTopic === 'work') {
                return {
                    ui_component: 'TextBubble',
                    data: { text: "Ishlar bilan o'zingizni juda charchatib yubordingiz. Balki tanaffus qilib, kelajakdagi loyihalar haqida suhbatlashamiz yoki biroz dam olamiz?" }
                };
            }
            return {
                ui_component: 'TextBubble',
                data: { text: `Zerikish ham ishning bir qismi, ${session.userName}. Keling, dunyodagi yangi texnologiyalar yoki kelajakdagi loyihalar haqida gaplashamiz. Nimalar rejalashtiryapsiz?` }
            };
        }

        // --- 5. Ob-havo (Odamdek gapirish + Haqiqiy API ma'lumoti) ---
        if (input.includes('havo') || input.includes('ob-havo') || input.includes('issiq') || predictedIntent === 'weather') {
            session.lastTopic = 'weather';
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
                if (response.ok) {
                    const data = await response.json();
                    return {
                        ui_component: 'TextBubble',
                        data: { text: `Toshkentda hozir harorat **${data.current_weather.temperature}°C**. Ob-havo o'zgaruvchan bo'lishi mumkin, lekin ishlaringizda doim barqarorlik tilayman, ${session.userName}!` }
                    };
                }
            } catch (e) {
                // API ulanmasa, xato bermaydi, insoniy javobga o'tib ketadi
            }
            return {
                ui_component: 'TextBubble',
                data: { text: `Toshkentda ob-havo o'zgaruvchan, lekin sizning ishlaringizda hammasi barqaror bo'lishini tilayman, ${session.userName}! Aniqroq harorat kerakmi?` }
            };
        }

        // --- 6. Skraping va Qidiruv (Internetga chiqish) ---
        if (predictedIntent === 'scraping' || input.includes('qidir') || input.includes('top')) {
            session.lastTopic = 'search';
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
                        data: { text: `🌐 ${session.userName}, siz uchun qidiruv natijalari:\n\n` + searchResults.join('\n\n') }
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
            session.lastTopic = 'telegram';
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
                suggestion: `Kechirasiz, ${session.userName}, bu so'rovingizni to'liq tushuna olmadim. Men hali ham o'rganish jarayonidaman. Quyidagi amallardan birini bajarib ko'ramizmi? Yoki nimalar qila olishim haqida so'rang!`,
                options: [
                    'Nimalar qila olasan?',
                    'Smeta hisobotini ko\'rish', 
                    'Texnik maslahat'
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