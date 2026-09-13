<script setup lang="ts">
import type { Option } from '@/types/invitation';

interface Props {
  title: string;
  hint: string;
  options: readonly Option[];
}

defineProps<Props>();

const emit = defineEmits<{ choose: [option: Option] }>();
</script>

<template>
  <section class="card">
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