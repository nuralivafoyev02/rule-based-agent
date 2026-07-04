<template>
    <div v-if="isUser"
        class="bg-[#f4f4f4] text-gray-900 px-5 py-3 rounded-3xl text-[16px] max-w-[85%] md:max-w-[70%] whitespace-pre-wrap leading-relaxed shadow-sm">
        {{ data.text }}
    </div>
    <div v-else class="text-gray-800 text-[16px] leading-relaxed w-full whitespace-pre-wrap">
        {{ data.text }}
    </div>
</template>

<script setup>
defineProps(['data', 'isUser']);
</script>