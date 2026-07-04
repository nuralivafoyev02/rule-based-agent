<template>
    <div class="flex h-[100dvh] w-full bg-white text-gray-800 font-sans overflow-hidden">

        <!-- Yon Panel (Faqat siz uchun moslashtirilgan) -->
        <aside class="hidden md:flex flex-col w-[260px] bg-[#f9f9f9] border-r border-gray-200 shrink-0">
            <div class="p-3">
                <button @click="chatStore.createNewSession()"
                    class="flex items-center justify-between w-full px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors group">
                    <div class="flex items-center gap-2 font-medium text-sm text-gray-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                            </path>
                        </svg>
                        Yangi suhbat
                    </div>
                </button>
            </div>

            <!-- Suhbatlar ro'yxati -->
            <div class="flex-1 overflow-y-auto px-3 py-2">
                <div class="text-xs font-semibold text-gray-500 mb-2 px-2 mt-1">Suhbatlar tarixi</div>

                <div v-if="chatStore.sessions.length === 0" class="text-xs text-gray-400 px-3 mt-4 text-center">
                    Hali suhbatlar yo'q
                </div>

                <div v-else class="space-y-0.5 text-sm font-medium text-gray-700">
                    <!-- Har bir chat seansini chizish -->
                    <div v-for="session in chatStore.sessions" :key="session.id"
                        class="group relative flex items-center w-full px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                        :class="session.id === chatStore.activeSessionId ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-200'"
                        @click="chatStore.loadSession(session.id)">

                        <span class="truncate pr-6 text-left w-full">{{ session.title }}</span>

                        <!-- O'chirish (Trash) tugmasi -->
                        <button @click.stop="chatStore.deleteSession(session.id)"
                            class="absolute right-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-white shadow-sm"
                            title="Suhbatni o'chirish">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Shaxsiy Profil -->
            <div class="p-3">
                <button
                    class="flex items-center gap-3 w-full px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors cursor-default">
                    <div
                        class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[13px] font-bold shrink-0 shadow-sm">
                        NV</div>
                    <div class="flex-1 text-left overflow-hidden">
                        <div class="text-sm font-bold truncate text-gray-800">Nurali Vafoyev</div>
                        <div class="text-[12px] text-gray-500 font-medium">Asosiy profil</div>
                    </div>
                </button>
            </div>
        </aside>

        <!-- Asosiy Chat Maydoni -->
        <main class="flex-1 flex flex-col relative h-full bg-white">

            <!-- Top Header (Toza) -->
            <header class="h-14 flex items-center justify-between px-4 sticky top-0 bg-white z-10">
                <div
                    class="flex items-center gap-2 font-semibold text-lg text-gray-800 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                    Shaxsiy Yordamchi
                </div>
                <!-- Premium tugmalari mutlaqo olib tashlandi -->
            </header>

            <!-- Chat Yozishmalari -->
            <div class="flex-1 overflow-y-auto scroll-smooth pb-36" ref="chatBox">

                <!-- Bo'sh holat -->
                <div v-if="!chatStore.messages || chatStore.messages.length === 0"
                    class="h-full flex flex-col items-center justify-center px-4 -mt-10">
                    <h2 class="text-[28px] font-semibold text-gray-800 mb-8">Bugun qanday rejalar bor?</h2>
                </div>

                <!-- Xabarlar ro'yxati -->
                <div v-else class="max-w-3xl mx-auto px-4 pt-4 pb-10 space-y-6">
                    <div v-for="(msg, index) in chatStore.messages" :key="index"
                        :class="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
                        <component :is="getComponent(msg.component)" :data="msg.data" :isUser="msg.sender === 'user'" />
                    </div>
                    <div v-if="chatStore.isLoading" class="flex justify-start">
                        <Skeleton />
                    </div>
                </div>
            </div>

            <!-- Input Maydoni -->
            <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4 px-4 md:px-0 z-20">
                <div class="max-w-[768px] mx-auto">
                    <form @submit.prevent="submitMessage"
                        class="relative flex items-end gap-2 bg-[#f4f4f4] rounded-[24px] p-2 pl-3 pr-2 border border-transparent focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-md transition-all">

                        <button type="button"
                            class="p-2 text-gray-500 hover:text-gray-800 pb-2.5 transition-colors rounded-full hover:bg-gray-200">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M12 4v16m8-8H4"></path>
                            </svg>
                        </button>

                        <textarea v-model="inputText" rows="1" placeholder="Istalgan narsani so'rang..."
                            class="flex-1 max-h-[200px] py-3 bg-transparent border-none focus:ring-0 resize-none outline-none text-[16px] text-gray-800 placeholder-gray-500"
                            @keydown.enter.prevent="submitMessage"></textarea>

                        <div class="flex items-center gap-1 pb-1.5">
                            <!-- Yuborish tugmasi -->
                            <button v-if="inputText.trim()" type="submit"
                                class="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm ml-1">
                                <svg class="w-5 h-5 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                            </button>
                            <button v-else type="button"
                                class="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm ml-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </form>
                    <div class="text-center text-xs text-gray-500 mt-2 pb-2">
                        Yordamchi ma'lumotlarni web saytlardan yig'adi.
                    </div>
                </div>
            </div>
        </main>
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

// Avtomatik scroll
watch(() => chatStore.messages.length, async () => {
    await nextTick();
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
});
</script>