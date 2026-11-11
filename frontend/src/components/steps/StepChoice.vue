<script setup lang="ts">
import type { Option } from '@/types/invitation';

interface Props {
  title: string;
  hint: string;
  options: readonly Option[];
  showHome?: boolean;
  winter?: boolean;
}

withDefaults(defineProps<Props>(), { showHome: false, winter: false });

const emit = defineEmits<{ choose: [option: Option]; home: [] }>();
</script>

<template>
  <section class="card game-card" :class="{ 'winter-card': winter }">
    <button v-if="showHome" type="button" class="home-control" aria-label="На главную" title="На главную" @click="emit('home')">
      <span aria-hidden="true">×</span>
    </button>
    <h1>{{ title }}</h1>
    <div class="choice-options">
      <button
        v-for="option in options"
        :key="option.id"
        class="choice-option"
        @click="emit('choose', option)"
      >
        {{ option.label }}
      </button>
    </div>
    <p class="hint">{{ hint }}</p>
  </section>
</template>