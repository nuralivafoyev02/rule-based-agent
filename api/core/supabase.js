import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const saveToHistory = async (userId, message, intentType) => {
    if (!supabaseUrl || !supabaseKey) return; // DB sozlanmagan bo'lsa, tizim qulamasligi uchun
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('chat_history').insert([
        { user_id: userId, message: message, intent_type: intentType }
    ]);
};