import { analyzeIntent } from './core/intent.js';
import { saveToHistory } from './core/supabase.js';

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

        // 1. Miya: Maqsadni tushunish
        const responseData = await analyzeIntent(message);

        // 2. Xotira: Tarixni saqlash (Asinxron xatosiz ishlashi uchun)
        await saveToHistory(userId, message, responseData.ui_component).catch(console.error);

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