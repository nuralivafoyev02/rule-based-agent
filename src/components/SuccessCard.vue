<template>
    <div class="w-full">
        <div class="flex items-center gap-2 text-emerald-600 font-semibold mb-2 text-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ data.title }}
        </div>
        <p class="text-gray-800 text-[16px] mb-4">{{ data.message }}</p>
        <button
            class="border border-gray-300 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
            {{ data.buttonText || 'Davom etish' }}
        </button>
    </div>
</template>
<script setup>defineProps(['data']); </script>