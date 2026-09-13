<script setup lang="ts">
import CatIcon from '@/components/CatIcon.vue';
import { BACKGROUND_CAT_COLORS } from '@/constants/cats';
</script>

<template>
  <div class="cat-bg" aria-hidden="true">
    <CatIcon v-for="color in BACKGROUND_CAT_COLORS" :key="color" :color="color" variant="bg" />
  </div>
</template>