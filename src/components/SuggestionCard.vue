<template>
    <div class="w-full">
        <p class="text-gray-800 text-[16px] leading-relaxed mb-4">{{ data.suggestion }}</p>
        <div class="flex flex-wrap gap-2">
            <button v-for="opt in data.options" :key="opt"
                class="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors">
                {{ opt }}
            </button>
        </div>
    </div>
</template>
<script setup>defineProps(['data']); </script>