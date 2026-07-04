<template>
    <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
        <p class="text-blue-800 text-sm mb-3">{{ data.suggestion }}</p>
        <div class="flex flex-wrap gap-2">
            <button v-for="opt in data.options" :key="opt"
                class="bg-white border border-blue-300 text-blue-700 px-3 py-1 text-xs rounded-full hover:bg-blue-100">
                {{ opt }}
            </button>
        </div>
    </div>
</template>
<script setup>defineProps(['data']); </script>