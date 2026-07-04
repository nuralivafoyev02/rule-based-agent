<template>
    <div class="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm w-full">
        <div class="flex items-center gap-3 text-green-700 font-bold mb-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ data.title }}
        </div>
        <p class="text-green-800 text-sm mb-3">{{ data.message }}</p>
        <button class="bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-green-700">
            {{ data.buttonText || 'Davom etish' }}
        </button>
    </div>
</template>
<script setup>defineProps(['data']); </script>