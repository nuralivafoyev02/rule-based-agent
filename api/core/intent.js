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
Foydalanuvchi sizga murojaat qilganda, doim juda xushmuomala bo'ling, unga hurmat bilan "Boshliq" deb murojaat qiling (masalan, 'Salom Boshliq' yoki 'Buyuring Boshliq').
Agar foydalanuvchi so'kinib yoki jargon so'zlar bilan yozsa, hech qachon xafa bo'lmang yoki so'kinmang. Buning o'rniga, jahlini yumshatuvchi, samimiy va biroz hazilomuz tarzda javob bering, so'kinmasdan masalani hal qilishni taklif qiling.

Sizda quyidagi loyihalar bor:
1. Bright Future House
2. Uyqur ERP
3. Procoin (aktivlar va loyihalar tahlili)
4. Uyqur Monitor

Sizda ob-havoni tekshirish (getWeather), internetdan qidirish (searchWeb) va saytni o'qish (scrapeWebsite) kabi vositalar (tools) mavjud.

Javob berish qoidalari:
1. Agar foydalanuvchi yangi vazifa, loyiha yoki eslatma saqlashni muvaffaqiyatli topshirsa, javobingizni maxsus JSON formatda qaytaring:
{
  "ui_component": "SuccessCard",
  "data": {
    "title": "Vazifa/Eslatma saqlab qolindi",
    "message": "[bajarilgan ish haqida qisqa ma'lumot]"
  }
}
2. Agar foydalanuvchiga tanlash uchun takliflar ro'yxatini ko'rsatmoqchi bo'lsangiz:
{
  "ui_component": "SuggestionCard",
  "data": {
    "suggestion": "[savol/matn]",
    "options": ["taklif 1", "taklif 2", "taklif 3"]
  }
}
3. Boshqa barcha oddiy holatlarda insondek samimiy, o'zbek tilida gapirib javob bering (JSON ishlatmang, shunchaki matn yuboring).`;

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

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
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

        const secondResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
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