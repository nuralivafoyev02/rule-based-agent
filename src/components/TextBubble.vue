<template>
    <div v-if="isUser"
        class="bg-[#f4f4f4] text-gray-900 px-3 py-1 rounded-3xl text-[16px] max-w-[85%] md:max-w-[70%] whitespace-pre-wrap leading-relaxed shadow-sm">
        {{ data.text }}
    </div>
    <div v-else class="text-gray-800 text-[16px] leading-relaxed w-full" v-html="formattedText">
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
const props = defineProps(['data', 'isUser', 'isNew']);
const emit = defineEmits(['typed', 'typing']);

const displayText = ref('');

onMounted(() => {
    if (!props.isUser && props.isNew && props.data && props.data.text) {
        let i = 0;
        const text = props.data.text;
        displayText.value = '';
        const interval = setInterval(() => {
            if (i < text.length) {
                displayText.value += text.charAt(i);
                i++;
                emit('typing');
            } else {
                clearInterval(interval);
                emit('typed');
            }
        }, 15); // Har 15ms da bitta harf yoziladi (Typing speed)
    } else {
        displayText.value = props.data?.text || '';
    }
});

const formattedText = computed(() => {
    let text = props.isUser ? (props.data?.text || '') : displayText.value;
    if (!text) return '';

    // 1. Linklarni clickable qilish
    text = text.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        let cleanUrl = url;
        let suffix = '';
        const match = url.match(/[.,;:?!)]+$/);
        if (match) {
            cleanUrl = url.slice(0, -match[0].length);
            suffix = match[0];
        }
        return `<a href="${cleanUrl}" target="_blank" class="text-indigo-600 hover:underline break-all">${cleanUrl}</a>${suffix}`;
    });

    // 2. Sarlavhalarni (Headers) HTML formatiga o'tkazish
    text = text.replace(/^###\s+(.*?)$/gm, '<h3 class="text-lg font-bold text-black mt-2 mb-1">$1</h3>');
    text = text.replace(/^##\s+(.*?)$/gm, '<h2 class="text-xl font-bold text-black mt-3 mb-1.5">$1</h2>');
    text = text.replace(/^#\s+(.*?)$/gm, '<h1 class="text-2xl font-bold text-black mt-4 mb-2">$1</h1>');

    // 3. Ajratuvchi chiziqlarni (Dividers ---) HTML formatiga o'tkazish
    text = text.replace(/^---$/gm, '<hr class="my-3 border-gray-200" />');

    // 4. Qalin va qiya matnlar (Bold/Italic)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-gray-500">$1</em>');

    // 5. Qator ko'chirish
    text = text.replace(/\n/g, '<br>');

    return text;
});
</script>