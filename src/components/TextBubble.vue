<template>
    <div
        :class="['p-3 rounded-2xl whitespace-pre-wrap',
            isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100']">
        {{ data.text }}
    </div>
</template>
<script setup>
defineProps(['data', 'isUser']);
</script>