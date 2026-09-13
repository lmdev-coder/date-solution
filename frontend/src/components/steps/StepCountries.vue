<script setup lang="ts">
import { COUNTRIES } from '@/constants/invitation';

interface Props {
  selected: string[];
}

defineProps<Props>();

const emit = defineEmits<{ toggle: [country: string]; next: [] }>();
</script>

<template>
  <section class="card">
    <h1>Выбери куда хочешь поехать 🌍</h1>
    <div class="countries-options">
      <button
        v-for="country in COUNTRIES"
        :key="country.id"
        class="country-option"
        :class="{ selected: selected.includes(country.id) }"
        @click="emit('toggle', country.id)"
      >
        {{ country.label }}
      </button>
    </div>
    <button class="btn btn-primary btn-next" @click="emit('next')">Вот это хочу 😍</button>
  </section>
</template>