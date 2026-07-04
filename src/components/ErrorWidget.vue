<template>
    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
        <h3 class="text-red-700 font-bold text-sm">{{ data.title || 'Xatolik yuz berdi' }}</h3>
        <p class="text-red-600 text-xs mt-1">{{ data.message }}</p>
        <button v-if="data.action" class="mt-2 text-xs font-semibold text-red-700 underline">
            {{ data.action }}
        </button>
    </div>
</template>
<script setup>defineProps(['data']); </script>