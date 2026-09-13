<script setup lang="ts">
import { computed, ref } from 'vue';

import CatPair from '@/components/CatPair.vue';
import { STORY_MESSAGES } from '@/constants/story';

const emit = defineEmits<{ finish: [] }>();

const messageIndex = ref(0);

const currentMessage = computed(() => STORY_MESSAGES[messageIndex.value]);
const isLastMessage = computed(() => messageIndex.value === STORY_MESSAGES.length - 1);

function showNextMessage(): void {
  if (isLastMessage.value) {
    emit('finish');
    return;
  }

  messageIndex.value += 1;
}
</script>

<template>
  <section class="card">
    <CatPair />
    <p class="story-message">{{ currentMessage }}</p>
    <button class="btn btn-primary" @click="showNextMessage">Далее 💬</button>
  </section>
</template>