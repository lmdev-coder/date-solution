<script setup lang="ts">
import { computed, ref } from 'vue';

import CatPair from '@/components/CatPair.vue';

interface Props {
  /** Messages revealed one at a time via the "Далее" button. */
  messages: readonly string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{ finish: [] }>();

const messageIndex = ref(0);

const currentMessage = computed(() => props.messages[messageIndex.value]);
const isLastMessage = computed(() => messageIndex.value === props.messages.length - 1);

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