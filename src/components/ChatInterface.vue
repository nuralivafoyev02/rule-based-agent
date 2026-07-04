<template>
    <div class="max-w-2xl mx-auto h-screen flex flex-col bg-gray-50 border-x border-gray-200">
        <header class="bg-indigo-600 text-white p-4 shadow-md text-center font-bold">
            Rule-Based Agentic AI
        </header>

        <div class="flex-1 p-4 overflow-y-auto space-y-4" ref="chatBox">
            <div v-for="(msg, index) in chatStore.messages" :key="index"
                :class="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">

                <div class="max-w-[80%]">
                    <!-- Dynamic Component Rendering -->
                    <component :is="getComponent(msg.component)" :data="msg.data" :isUser="msg.sender === 'user'" />
                </div>
            </div>

            <!-- Skeleton/Typing Animation -->
            <div v-if="chatStore.isLoading" class="flex justify-start">
                <Skeleton />
            </div>
        </div>

        <form @submit.prevent="submitMessage" class="p-4 bg-white border-t border-gray-200 flex gap-2">
            <input v-model="inputText" type="text" placeholder="Buyruq bering..."
                class="flex-1 p-3 rounded-lg border focus:outline-none focus:border-indigo-600 focus:ring-1"
                :disabled="chatStore.isLoading" />
            <button type="submit"
                class="bg-indigo-600 text-white px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                :disabled="!inputText.trim() || chatStore.isLoading">
                Yuborish
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { useChatStore } from '../store/chatStore';

// Dinamik komponentlarni import qilish
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

// Scroll to bottom
watch(() => chatStore.messages.length, async () => {
    await nextTick();
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
});
</script>