<script setup lang="ts">
import CatIcon from '@/components/CatIcon.vue';
import { COUPLE_CAT_COLORS } from '@/constants/cats';

interface Props {
  /** `md` is used on the big question card. */
  variant?: 'sm' | 'md';
}

withDefaults(defineProps<Props>(), { variant: 'sm' });
</script>

<template>
  <div class="cat-pair">
    <CatIcon v-for="color in COUPLE_CAT_COLORS" :key="color" :color="color" :variant="variant" />
  </div>
</template>