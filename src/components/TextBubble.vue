<template>
    <!-- Foydalanuvchi xabari oddiy matn ko'rinishida qoladi -->
    <div v-if="isUser"
        class="bg-[#f4f4f4] text-gray-900 px-5 py-3 rounded-3xl text-[16px] max-w-[85%] md:max-w-[70%] whitespace-pre-wrap leading-relaxed shadow-sm">
        {{ data.text }}
    </div>

    <!-- AI xabari v-html orqali Markdown dizaynida chiziladi -->
    <div v-else class="text-gray-800 text-[16px] leading-relaxed w-full whitespace-pre-wrap" v-html="formattedText">
    </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps(['data', 'isUser']);

// Matn ichidagi yulduzchalarni HTML teglarga aylantiruvchi algoritm
const formattedText = computed(() => {
    if (!props.data.text) return '';
    let text = props.data.text;

    // 1. Qalin matn (Bold): **matn** -> <strong>matn</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>');

    // 2. Qiya matn (Italic): *matn* -> <em>matn</em>
    text = text.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-gray-500">$1</em>');

    // 3. Havolalar (Links): [matn](url) -> <a>matn</a>
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline font-medium">$1</a>');

    return text;
});
</script>