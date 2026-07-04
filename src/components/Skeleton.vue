<template>
    <div class="flex items-center py-2 px-1">
        <div class="text-[15px] font-bold tracking-wide text-shimmer select-none">
            {{ currentWord }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentWord = ref('Thinking...');

onMounted(() => {
    // Tasodifiy so'zni tanlash
    const words = ['Thinking...', 'Cooking...'];
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord.value = words[randomIndex];
});
</script>

<style scoped>
.text-shimmer {
    /* Matn ustidan yugurib o'tuvchi yorqin gradient (Shimmer) */
    background: linear-gradient(110deg,
            #9ca3af 30%,
            /* Ochiq kulrang (Boshi) */
            #1f2937 50%,
            /* To'q qora (Yorqin nuqta) */
            #9ca3af 70%
            /* Ochiq kulrang (Oxiri) */
        );
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: shimmer 1.5s linear infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% center;
    }

    100% {
        background-position: -200% center;
    }
}
</style>