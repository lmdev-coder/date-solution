<script setup lang="ts">
import { ref } from 'vue';

import CatPair from '@/components/CatPair.vue';

type AnswerButtonId = 'yes' | 'no';

const emit = defineEmits<{ answer: [] }>();

/** Both buttons lead to the same place; "Нет" just refuses to be clicked. */
const buttonOrder = ref<AnswerButtonId[]>(['yes', 'no']);

function dodgeCursor(): void {
  buttonOrder.value = [...buttonOrder.value].reverse();
}
</script>

<template>
  <section class="card">
    <CatPair variant="md" />
    <h1>Любовь моя, поедешь со мной в отпуск? ✈️</h1>
    <div class="buttons-container">
      <template v-for="buttonId in buttonOrder" :key="buttonId">
        <button v-if="buttonId === 'yes'" class="btn btn-yes" @click="emit('answer')">Да 💖</button>
        <button
          v-else
          class="btn btn-no"
          @mouseenter="dodgeCursor"
          @touchstart.prevent="dodgeCursor"
          @click="emit('answer')"
        >
          Нет 💔
        </button>
      </template>
    </div>
  </section>
</template>