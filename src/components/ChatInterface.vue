<template>
    <div class="h-[100dvh] bg-gray-200 md:p-6 flex items-center justify-center font-sans">
        <div
            class="w-full max-w-3xl h-full flex flex-col bg-[#f8fafc] md:rounded-[12px] md:shadow-2xl overflow-hidden border border-gray-200 relative">

            <!-- Zamonaviy Header -->
            <header
                class="bg-white/80 backdrop-blur-md px-5 py-4 border-b border-gray-200 flex items-center justify-between z-10 shadow-sm sticky top-0">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 bg-indigo-600 rounded-[12px] flex items-center justify-center shadow-indigo-200 shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-gray-800 leading-tight">Agentic AI</h1>
                        <p class="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 mt-0.5">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
            </header>

            <!-- Chat qismi -->
            <div class="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 scroll-smooth pb-24" ref="chatBox">
                <div v-for="(msg, index) in chatStore.messages" :key="index"
                    :class="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">

                    <div
                        :class="['max-w-[90%] md:max-w-[75%]', msg.sender === 'user' ? 'origin-bottom-right' : 'origin-bottom-left']">
                        <component :is="getComponent(msg.component)" :data="msg.data" :isUser="msg.sender === 'user'" />
                    </div>
                </div>

                <!-- Skeleton o'ylash animatsiyasi -->
                <div v-if="chatStore.isLoading" class="flex justify-start">
                    <Skeleton />
                </div>
            </div>

            <!-- Yozish maydoni (Input Area) -->
            <form @submit.prevent="submitMessage"
                class="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div class="flex gap-2 relative items-end">
                    <textarea v-model="inputText" rows="1" placeholder="Menga buyruq bering..."
                        class="flex-1 px-4 py-3.5 bg-gray-50 text-gray-800 rounded-[12px] border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all resize-none overflow-hidden"
                        :disabled="chatStore.isLoading" @keydown.enter.prevent="submitMessage"></textarea>
                    <button type="submit"
                        class="bg-indigo-600 text-white h-[52px] px-5 rounded-[12px] font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95"
                        :disabled="!inputText.trim() || chatStore.isLoading">
                        <svg class="w-5 h-5 -rotate-90 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>
            </form>

        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { useChatStore } from '../store/chatStore';

import TextBubble from './TextBubble.vue';
import SuccessCard from './SuccessCard.vue';
import SuggestionCard from './SuggestionCard.vue';
import ErrorWidget from './ErrorWidget.vue';
import Skeleton from './Skeleton.vue';

const chatStore = useChatStore();
const inputText = ref('');
const chatBox = ref(null);

const componentsMap = { TextBubble, SuccessCard, SuggestionCard, ErrorWidget };
const getComponent = (name) => componentsMap[name] || TextBubble;

const submitMessage = async () => {
    if (!inputText.value.trim()) return;
    const msg = inputText.value;
    inputText.value = '';
    await chatStore.sendMessage(msg);
};

watch(() => chatStore.messages.length, async () => {
    await nextTick();
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
});
</script>