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
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-gray-500">$1</em>');
    text = text.replace(/\n/g, '<br>');

    return text;
});
</script>