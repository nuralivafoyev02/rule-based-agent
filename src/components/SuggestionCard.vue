<template>
    <div class="bg-indigo-50/70 border border-indigo-100/50 p-5 rounded-[12px] shadow-sm w-full">
        <div class="flex items-start gap-3 mb-4">
            <div class="mt-0.5 p-1.5 bg-indigo-100 rounded-[12px] text-indigo-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <p class="text-indigo-900 text-[15px] leading-snug font-medium">{{ data.suggestion }}</p>
        </div>

        <div class="flex flex-wrap gap-2 mt-2">
            <button v-for="opt in data.options" :key="opt"
                class="bg-white border border-indigo-200 text-indigo-700 px-4 py-2 text-sm font-semibold rounded-[12px] shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md transition-all active:scale-95">
                {{ opt }}
            </button>
        </div>
    </div>
</template>
<script setup>defineProps(['data']); </script>