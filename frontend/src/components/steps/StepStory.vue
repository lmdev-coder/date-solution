<script setup lang="ts">
import { computed, ref } from 'vue';

import CatPair from '@/components/CatPair.vue';

interface Props {
  /** Messages revealed one at a time via the "Далее" button. */
  messages: readonly string[];
  /** Shows a home control inside the story card. */
  showHome?: boolean;
  /** Applies the shared New Year card theme. */
  winter?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showHome: false, winter: false });

const emit = defineEmits<{ finish: []; home: [] }>();

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
  <section class="card game-card" :class="{ 'winter-card': winter }">
    <button v-if="showHome" type="button" class="home-control" aria-label="На главную" title="На главную" @click="emit('home')">
      <span aria-hidden="true">×</span>
    </button>
    <CatPair />
    <p class="story-message">{{ currentMessage }}</p>
    <button class="btn btn-primary" @click="showNextMessage">Далее 💬</button>
  </section>
</template>