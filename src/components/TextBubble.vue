<template>
    <div :class="['px-5 py-3.5 whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm',
        isUser ? 'bg-indigo-600 text-white rounded-[12px] rounded-br-[4px] shadow-indigo-200'
            : 'bg-white text-gray-800 rounded-[12px] rounded-bl-[4px] border border-gray-100']">
        {{ data.text }}
    </div>
</template>
<script setup>
defineProps(['data', 'isUser']);
</script>