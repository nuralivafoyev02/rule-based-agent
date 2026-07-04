import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [], // { sender: 'user'|'ai', component: '...', data: {} }
    isLoading: false,
  }),
  actions: {
    async sendMessage(text) {
      this.messages.push({ sender: 'user', component: 'TextBubble', data: { text } });
      this.isLoading = true;

      try {
        const response = await fetch(import.meta.env.VITE_API_URL || '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        
        const result = await response.json();
        // Backend qaysi UI ni ko'rsatishni aytadi
        this.messages.push({ 
          sender: 'ai', 
          component: result.ui_component || 'ErrorWidget', 
          data: result.data || { message: 'Kutilmagan xatolik' } 
        });
      } catch (error) {
        this.messages.push({
          sender: 'ai',
          component: 'ErrorWidget',
          data: { title: 'Tarmoq xatosi', message: error.message }
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
});