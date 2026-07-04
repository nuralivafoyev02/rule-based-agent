<template>
    <div v-if="isUser"
        class="bg-[#f4f4f4] text-gray-900 px-5 py-3 rounded-3xl text-[16px] max-w-[85%] md:max-w-[70%] whitespace-pre-wrap leading-relaxed shadow-sm">
        {{ data.text }}
    </div>
    <div v-else class="text-gray-800 text-[16px] leading-relaxed w-full" v-html="formattedText">
    </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps(['data', 'isUser']);

const formattedText = computed(() => {
    if (!props.data || !props.data.text) return '';
    let text = props.data.text;
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-gray-500">$1</em>');
    text = text.replace(/\n/g, '<br>');

    return text;
});
</script>