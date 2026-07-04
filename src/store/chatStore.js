import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
  state: () => {
    // Brauzer xotirasidan oldingi suhbatlarni tortib olish
    const savedSessions = JSON.parse(localStorage.getItem('chat_sessions')) || [];
    return {
      sessions: savedSessions,
      activeSessionId: savedSessions.length > 0 ? savedSessions[0].id : null,
      isLoading: false,
    };
  },
  
  getters: {
    // Faol suhbatdagi xabarlarni qaytarish
    messages: (state) => {
      const session = state.sessions.find(s => s.id === state.activeSessionId);
      return session ? session.messages : [];
    }
  },
  
  actions: {
    saveToStorage() {
      localStorage.setItem('chat_sessions', JSON.stringify(this.sessions));
    },
    
    createNewSession() {
      // 1. Agar hozirgi faol chat mutlaqo bo'sh bo'lsa, yangi chat ochmaydi!
      const currentSession = this.sessions.find(s => s.id === this.activeSessionId);
      if (currentSession && currentSession.messages.length === 0) {
        return; 
      }
      const newId = Date.now().toString();
      this.sessions.unshift({ id: newId, title: 'Yangi suhbat', messages: [] });
      this.activeSessionId = newId;
      this.saveToStorage();
    },
    
    loadSession(id) {
      this.activeSessionId = id;
    },
    
    deleteSession(id) {
      this.sessions = this.sessions.filter(s => s.id !== id);
      // Agar o'chirilgan chat faol chat bo'lsa, birinchisiga o'tkazib yuborish
      if (this.activeSessionId === id) {
        this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
      }
      this.saveToStorage();
    },
    
    async sendMessage(text) {
      // Agar birorta ham suhbat ochilmagan bo'lsa, avtomatik yaratish
      if (!this.activeSessionId) {
        this.createNewSession();
      }
      
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      
      // Suhbatga nom berish (birinchi xabardan olinadi)
      if (session.messages.length === 0) {
        session.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
      }

      // Foydalanuvchi xabarini UI ga chizish
      session.messages.push({ sender: 'user', component: 'TextBubble', data: { text } });
      this.isLoading = true;
      this.saveToStorage();

      try {
        const response = await fetch(import.meta.env.VITE_API_URL || '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        
        const result = await response.json();
        
        // AI javobini UI ga chizish
        session.messages.push({ 
          sender: 'ai', 
          component: result.ui_component || 'ErrorWidget', 
          data: result.data || { message: 'Kutilmagan xatolik' },
          isNew: true
        });
      } catch (error) {
        session.messages.push({
          sender: 'ai',
          component: 'ErrorWidget',
          data: { title: 'Tarmoq xatosi', message: error.message },
          isNew: true
        });
      } finally {
        this.isLoading = false;
        this.saveToStorage();
      }
    }
    
  }
});