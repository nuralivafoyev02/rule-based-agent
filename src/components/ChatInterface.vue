<template>
    <div class="flex h-[100dvh] w-full bg-white text-gray-800 font-sans overflow-hidden">

        <!-- Yon Panel (Sidebar - Faqat kompyuterda ko'rinadi) -->
        <aside class="hidden md:flex flex-col w-[260px] bg-[#f9f9f9] border-r border-gray-200 shrink-0">
            <div class="p-3">
                <button
                    class="flex items-center justify-between w-full px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors group">
                    <div class="flex items-center gap-2 font-medium text-sm text-gray-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                            </path>
                        </svg>
                        New chat
                    </div>
                    <svg class="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                        </path>
                    </svg>
                </button>

                <div class="mt-2 space-y-0.5">
                    <button
                        class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700 font-medium">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg> Search chats
                    </button>
                    <button
                        class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700 font-medium">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z">
                            </path>
                        </svg> Library
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-3 py-2">
                <div class="text-xs font-semibold text-gray-500 mb-2 px-2 mt-2">Recents</div>
                <div class="space-y-0.5 text-sm font-medium text-gray-700">
                    <button
                        class="w-full text-left truncate px-3 py-2.5 rounded-lg bg-gray-200 text-gray-900">Salomlashish
                        va yordam so'rash</button>
                    <button class="w-full text-left truncate px-3 py-2.5 rounded-lg hover:bg-gray-200">Markdownda link
                        qo'yish</button>
                    <button class="w-full text-left truncate px-3 py-2.5 rounded-lg hover:bg-gray-200">Printf qaysi
                        tilda</button>
                    <button class="w-full text-left truncate px-3 py-2.5 rounded-lg hover:bg-gray-200">Sehrli shamchiroq
                        filmi</button>
                    <button class="w-full text-left truncate px-3 py-2.5 rounded-lg hover:bg-gray-200">GitHub rollback
                        qilish</button>
                    <button class="w-full text-left truncate px-3 py-2.5 rounded-lg hover:bg-gray-200">Vercel terminal
                        orqali build</button>
                </div>
            </div>

            <div class="p-3">
                <button class="flex items-center gap-2 w-full px-2 py-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <div
                        class="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-[13px] font-bold shrink-0">
                        NU</div>
                    <div class="flex-1 text-left overflow-hidden">
                        <div class="text-sm font-semibold truncate text-gray-800">Nurali Vafoyev</div>
                        <div class="text-[11px] text-gray-500 font-medium">Free</div>
                    </div>
                    <span
                        class="text-xs font-semibold bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-700 shrink-0">Upgrade</span>
                </button>
            </div>
        </aside>

        <!-- Asosiy Chat Maydoni -->
        <main class="flex-1 flex flex-col relative h-full bg-white">

            <!-- Top Header -->
            <header class="h-14 flex items-center justify-between px-4 sticky top-0 bg-white z-10">
                <div
                    class="flex items-center gap-2 font-semibold text-lg text-gray-800 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                    ChatGPT <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
                <div class="flex items-center gap-3">
                    <button
                        class="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z">
                            </path>
                        </svg> Upgrade
                    </button>
                    <button class="p-2 hover:bg-gray-100 rounded-full">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </header>

            <!-- Chat Yozishmalari -->
            <div class="flex-1 overflow-y-auto scroll-smooth pb-36" ref="chatBox">

                <!-- Bo'sh holat (Bosh sahifa) -->
                <div v-if="chatStore.messages.length === 0"
                    class="h-full flex flex-col items-center justify-center px-4 -mt-10">
                    <h2 class="text-[28px] font-semibold text-gray-800 mb-8">What's on the agenda today?</h2>
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

            <!-- Input Maydoni (Pastga yopishtirilgan) -->
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

                        <textarea v-model="inputText" rows="1" placeholder="Ask anything"
                            class="flex-1 max-h-[200px] py-3 bg-transparent border-none focus:ring-0 resize-none outline-none text-[16px] text-gray-800 placeholder-gray-500"
                            @keydown.enter.prevent="submitMessage"></textarea>

                        <div class="flex items-center gap-1 pb-1.5">
                            <button type="button"
                                class="hidden sm:flex items-center gap-1 px-3 py-1.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                                Instant <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>

                            <button type="button"
                                class="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-full transition-colors">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path
                                        d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            </button>

                            <!-- Yuborish yoki Ovoz tugmasi -->
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
                        ChatGPT can make mistakes. Check important info.
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

watch(() => chatStore.messages.length, async () => {
    await nextTick();
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
});
</script>