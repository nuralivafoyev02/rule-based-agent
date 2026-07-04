CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    intent_type TEXT,
    sender TEXT DEFAULT 'user', -- 'user' yoki 'ai'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indekslar
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
