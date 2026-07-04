import { analyzeIntent } from './core/intent.js';
import { saveToHistory, getHistory } from './core/supabase.js';

export default async function handler(req, res) {
    // Zero-crash kafolati
    try {
        if (req.method !== 'POST') {
            return res.status(200).json({
                ui_component: 'ErrorWidget',
                data: { message: 'Faqat POST so\'rovlar qabul qilinadi.' }
            });
        }

        const { message, userId = 'default_user' } = req.body;

        if (!message) {
            return res.status(200).json({
                ui_component: 'SuggestionCard',
                data: { suggestion: 'Menga biror buyruq bering. Masalan: "Yangiliklarni top" yoki "Telegram botni ula".' }
            });
        }

        // 1. History ni olish
        const history = await getHistory(userId);

        // 2. Miya: Maqsadni tushunish
        const responseData = await analyzeIntent(message, history, userId);

        // 3. Xotira: Tarixni saqlash (Asinxron xatosiz ishlashi uchun)
        // Foydalanuvchi xabarini saqlash
        await saveToHistory(userId, message, responseData.ui_component, 'user').catch(console.error);
        
        // AI javobini saqlash
        const aiMessage = responseData.data?.text || responseData.data?.message || 'Maxsus komponent javobi';
        await saveToHistory(userId, aiMessage, responseData.ui_component, 'ai').catch(console.error);

        // 3. Front-endga dinamik komponent va datani yuborish
        return res.status(200).json(responseData);

    } catch (error) {
        // Tizim qulash o'rniga ErrorWidget qaytaradi
        return res.status(200).json({
            ui_component: 'ErrorWidget',
            data: { 
                title: 'Tizimda kutilmagan xatolik', 
                message: error.message,
                action: 'Qaytadan urinib ko\'ring'
            }
        });
    }
}