<template>
    <div class="bg-emerald-50/80 border border-emerald-200/60 p-5 rounded-[12px] shadow-sm w-full">
        <div class="flex items-center gap-3 text-emerald-700 font-bold mb-2 text-lg">
            <div class="p-1 bg-emerald-100 rounded-full text-emerald-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            {{ data.title }}
        </div>
        <p class="text-emerald-800/90 text-[15px] mb-4 ml-10">{{ data.message }}</p>
        <div class="ml-10">
            <button
                class="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-[12px] shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-colors active:scale-95">
                {{ data.buttonText || 'Ajoyib!' }}
            </button>
        </div>
    </div>
</template>
<script setup>defineProps(['data']); </script>