import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const saveToHistory = async (userId, message, intentType, sender = 'user') => {
    if (!supabaseUrl || !supabaseKey) return; // DB sozlanmagan bo'lsa, tizim qulamasligi uchun
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('chat_history').insert([
        { user_id: userId, message: message, intent_type: intentType, sender: sender }
    ]);
};

export const getHistory = async (userId, limit = 5) => {
    if (!supabaseUrl || !supabaseKey) return [];
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
    if (error) {
        console.error("Error fetching history:", error);
        return [];
    }
    
    return data.reverse(); // Vaqt bo'yicha to'g'ri ketma-ketlikda (eskidan yangiga) qaytarish
};