<template>
    <div class="bg-red-50/80 border border-red-200/60 p-5 rounded-[12px] shadow-sm w-full flex items-start gap-4">
        <div class="p-2 bg-red-100 rounded-[12px] text-red-600 shrink-0 mt-0.5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        </div>
        <div>
            <h3 class="text-red-700 font-bold text-[15px] mb-1">{{ data.title || 'Kutilmagan xatolik' }}</h3>
            <p class="text-red-600/90 text-sm leading-relaxed">{{ data.message }}</p>
            <button v-if="data.action" class="mt-3 text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                {{ data.action }} &rarr;
            </button>
        </div>
    </div>
</template>
<script setup>defineProps(['data']); </script>