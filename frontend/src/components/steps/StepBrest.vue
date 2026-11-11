<script setup lang="ts">
import { ref } from 'vue';

import CatPair from '@/components/CatPair.vue';
import {
  BREST_DECLINE_LIMIT,
  BREST_QUESTION,
  BREST_RETRY_MESSAGE,
} from '@/constants/story';

const emit = defineEmits<{ answer: [trip: boolean]; home: [] }>();

const declineAttempts = ref(0);
const isRetryPromptVisible = ref(false);

/** "Нет" is turned down until the attempt limit, then accepted. */
function declineTrip(): void {
  declineAttempts.value += 1;

  if (declineAttempts.value >= BREST_DECLINE_LIMIT) {
    emit('answer', false);
    return;
  }

  isRetryPromptVisible.value = true;
}
</script>

<template>
  <section class="card game-card">
    <button type="button" class="home-control" aria-label="На главную" title="На главную" @click="emit('home')">
      <span aria-hidden="true">×</span>
    </button>
    <CatPair variant="md" />

    <template v-if="isRetryPromptVisible">
      <p class="story-message">{{ BREST_RETRY_MESSAGE }}</p>
      <button class="btn btn-primary" @click="isRetryPromptVisible = false">Хорошо 😊</button>
    </template>

    <template v-else>
      <h1>{{ BREST_QUESTION }}</h1>
      <div class="buttons-container">
        <button class="btn btn-yes" @click="emit('answer', true)">Да 💖</button>
        <button class="btn btn-no" @click="declineTrip">Нет 💔</button>
      </div>
    </template>
  </section>
</template>