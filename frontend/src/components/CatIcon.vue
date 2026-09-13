<script setup lang="ts">
type CatVariant = 'bg' | 'sm' | 'md';

interface Props {
  color: string;
  variant?: CatVariant;
}

withDefaults(defineProps<Props>(), { variant: 'sm' });
</script>

<template>
  <svg viewBox="0 0 100 100" class="cat-icon" :class="`cat-icon--${variant}`" aria-hidden="true">
    <polygon points="20,30 25,10 35,25" :fill="color" />
    <polygon points="80,30 75,10 65,25" :fill="color" />
    <circle cx="50" cy="50" r="40" :fill="color" />
    <circle cx="35" cy="40" r="8" fill="#333" />
    <circle cx="65" cy="40" r="8" fill="#333" />
    <path d="M30 50 Q50 60 70 50" stroke="#333" stroke-width="3" fill="none" />
  </svg>
</template>