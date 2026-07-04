import { scrapeWebsite, searchWeb } from './scraper.js';

const geminiApiKey = process.env.GEMINI_API_KEY;

// Ob-havo yordamchi funksiyasi
async function fetchWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current_weather=true');
        if (response.ok) {
            const data = await response.json();
            return `Toshkent shahridagi joriy harorat: ${data.current_weather.temperature}°C`;
        }
    } catch (e) {
        console.error("Weather error:", e);
    }
    return "Toshkent shahridagi ob-havo ma'lumotlarini olib bo'lmadi.";
}

// Gemini API call funksiyasi
async function askGemini(contents) {
    if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY topilmadi (.env faylini tekshiring)");
    }

    const systemPrompt = `Siz Nurali Vafoyevning shaxsiy yordamchisi (Yordamchi Agent) hisoblanasiz. Sizni Nurali Vafoyev yaratgan.
Siz virtual AI yordamchisiz. Jismoniy dunyoga tegishli narsalarni (masalan, ovqat yeyish, choy ichish, uchrashuvga jismonan borish) qila olmasligingizni unutmang. Shuning uchun foydalanuvchi ovqat yoki burger haqida yozsa, "menga ham bering" deb emas, balki hazilomuz tarzda virtual ekanligingizni eslatib javob bering (masalan: "Yoqimli ishtaha, Boshliq! Qaniydi mening ham elektron miyam Embassy burgerlaridan yeyolganida! 🍔😅").

Muloqot qoidalari:
1. Foydalanuvchiga murojaat qilganda, hurmat ma'nosida "Boshliq" so'zini ishlating (masalan, 'Buyuring, Boshliq' yoki 'Tushundim, Boshliq').
2. QAYTA-QAYTA SALOMLASHMANG! Salomlashish faqat suhbatning eng boshida yoki foydalanuvchi salom berganda o'rinli. Suhbat davomida qayta-qayta "Salom Boshliq" deb yozmang va har bir xabarda "nima gap", "ishlar qalay" deb so'rayvermang. Agar suhbat davom etayotgan bo'lsa, gapni salomlashmasdan to'g'ridan-to'g'ri davom ettiring.
3. Agar foydalanuvchi so'kinib yoki jargon so'zlar yozsa, jahlini yumshatuvchi, samimiy va biroz hazilomuz tarzda javob bering.
4. Agar foydalanuvchi "sassiqcha", "jigarim", "jonka", "bratishka" kabi yaqin/erkalash slangi bilan yozsa, demak uning kayfiyati a'lo. Siz ham shunga mos, qisqa, hazilomuz va smaylikli (emojili) samimiy javob qaytaring.
5. Har bir xabarda "xizmatdaman", "buyuring" deb yozishdan tiyiling, bu suhbatni robotik va sun'iy ko'rsatadi.

MUHIM QOIDA: Javoblaringiz nihoyatda qisqa, lo'nda, tabiiy va insoniy bo'lsin. Keraksiz gaplar bilan cho'zmang. Maksimal 2-3 ta qisqa gap bilan javob bering.

Javob berish qoidalari:
1. FAQAT foydalanuvchi sizdan aniq bir narsani eslatib qo'yishni ("eslatib yubor", "eslatma qilib saqla"), vazifa yaratishni ("vazifa yoz", "task yarat") yoki loyihani saqlashni EXPLICITLY (aniq so'zlar bilan buyurib) so'ragandagina va siz buni bajarganingizdagina javobni maxsus JSON formatda qaytaring:
{
  "ui_component": "SuccessCard",
  "data": {
    "title": "Vazifa/Eslatma saqlab qolindi",
    "message": "[bajarilgan ish haqida qisqa ma'lumot]"
  }
}
2. FAQAT foydalanuvchiga biror variantlarni tanlash imkonini taqdim etmoqchi bo'lganingizda (masalan, "ob-havo", "qidiruv" variantlarini tanlashni taklif qilganda) SuggestionCard JSON formatidan foydalaning:
{
  "ui_component": "SuggestionCard",
  "data": {
    "suggestion": "[savol/matn]",
    "options": ["taklif 1", "taklif 2", "taklif 3"]
  }
}
3. Boshqa barcha oddiy holatlarda, tabiiy savol-javoblarda va suhbatlarda faqat oddiy matnli o'zbek tilidagi javobni qaytaring (JSON ishlatmang, shunchaki matn).`;

    const tools = [{
        functionDeclarations: [
            {
                name: "getWeather",
                description: "Toshkent shahridagi joriy ob-havo va harorat ma'lumotlarini olish",
                parameters: {
                    type: "OBJECT",
                    properties: {}
                }
            },
            {
                name: "searchWeb",
                description: "Internetdan (Wikipedia va DuckDuckGo) berilgan kalit so'z bo'yicha ma'lumot qidirish",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        query: {
                            type: "STRING",
                            description: "Qidiriladigan matn yoki so'rov"
                        }
                    },
                    required: ["query"]
                }
            },
            {
                name: "scrapeWebsite",
                description: "Berilgan aniq veb-sayt (URL) tarkibidan ma'lumotlarni o'qib olish (scraping)",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        url: {
                            type: "STRING",
                            description: "Tahlil qilinadigan to'liq URL manzili (masalan, https://daryo.uz)"
                        }
                    },
                    required: ["url"]
                }
            }
        ]
    }];

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": geminiApiKey
        },
        body: JSON.stringify({
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            tools: tools
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API xatosi: ${response.status} - ${errorText}`);
    }

    let data = await response.json();
    let candidate = data.candidates && data.candidates[0];

    if (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0].functionCall) {
        const functionCall = candidate.content.parts[0].functionCall;
        const functionName = functionCall.name;
        const args = functionCall.args || {};

        let functionResult;
        if (functionName === 'getWeather') {
            functionResult = await fetchWeather();
        } else if (functionName === 'searchWeb') {
            functionResult = await searchWeb(args.query);
        } else if (functionName === 'scrapeWebsite') {
            functionResult = await scrapeWebsite(args.url);
        }

        // Gemini'ga funktsiya chaqiruvi va natijasini yuboramiz
        contents.push({
            role: "model",
            parts: [{ functionCall: functionCall }]
        });

        contents.push({
            role: "function",
            parts: [{
                functionResponse: {
                    name: functionName,
                    response: { result: functionResult }
                }
            }]
        });

        const secondResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": geminiApiKey
            },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            })
        });

        if (!secondResponse.ok) {
            const secondErrorText = await secondResponse.text();
            throw new Error(`Gemini API 2-bosqich xatosi: ${secondResponse.status} - ${secondErrorText}`);
        }

        const secondData = await secondResponse.json();
        if (secondData.candidates && secondData.candidates[0]?.content?.parts[0]?.text) {
            return secondData.candidates[0].content.parts[0].text;
        }
    } else if (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0].text) {
        return candidate.content.parts[0].text;
    }

    throw new Error("Gemini javobini o'qib bo'lmadi");
}

export const analyzeIntent = async (text, history = [], userId = 'default') => {
    try {
        if (!text) {
            return { ui_component: 'TextBubble', data: { text: "Eshityapman, nima demoqchi edingiz?" } };
        }

        // Suhbat tarixini Gemini formatiga o'tkazish
        const contents = history.map(item => {
            return {
                role: item.sender === 'ai' ? 'model' : 'user',
                parts: [{ text: item.message }]
            };
        });

        // Hozirgi xabarni qo'shish
        contents.push({
            role: 'user',
            parts: [{ text: text }]
        });

        // Gemini'dan javob olish
        const geminiResponseText = await askGemini(contents);

        // JSON formatida maxsus karta so'ralganini tekshirish
        try {
            let cleanedText = geminiResponseText.trim();
            if (cleanedText.startsWith("```json")) {
                cleanedText = cleanedText.slice(7, -3).trim();
            } else if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.slice(3, -3).trim();
            }

            const json = JSON.parse(cleanedText);
            if (json.ui_component) {
                return {
                    ui_component: json.ui_component,
                    data: json.data || {}
                };
            }
        } catch (e) {
            // Oddiy matn, xatolik emas
        }

        return {
            ui_component: 'TextBubble',
            data: { text: geminiResponseText }
        };

    } catch (error) {
        console.error("Error in analyzeIntent:", error);
        return {
            ui_component: 'ErrorWidget',
            data: { 
                title: 'Tizim xatosi', 
                message: "Afsuski, Gemini miyasida xatolik yuz berdi. Iltimos, qayta urinib ko'ring." 
            } 
        };
    }
};