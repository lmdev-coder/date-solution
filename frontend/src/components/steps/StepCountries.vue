<script setup lang="ts">
import { COUNTRIES } from '@/constants/invitation';
import type { Option } from '@/types/invitation';

interface Props {
  selected: string[];
  options?: readonly Option[];
  title?: string;
  nextLabel?: string;
  hint?: string;
  nextDisabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  options: () => COUNTRIES,
  title: 'Выбери куда хочешь поехать 🌍',
  nextLabel: 'Вот это хочу 😍',
  hint: '',
  nextDisabled: false,
});

const emit = defineEmits<{ toggle: [id: string]; next: [] }>();
</script>

<template>
  <section class="card">
    <h1>{{ title }}</h1>
    <div class="countries-options">
      <button
        v-for="option in options"
        :key="option.id"
        class="country-option"
        :class="{ selected: selected.includes(option.id) }"
        @click="emit('toggle', option.id)"
      >
        {{ option.label }}
      </button>
    </div>
    <p v-if="hint" class="hint">{{ hint }}</p>
    <button class="btn btn-primary btn-next" :disabled="nextDisabled" @click="emit('next')">
      {{ nextLabel }}
    </button>
  </section>
</template>