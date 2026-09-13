<script setup lang="ts">
import CatPair from '@/components/CatPair.vue';

const emit = defineEmits<{ openStory: []; openTravel: [] }>();
</script>

<template>
  <section class="card">
    <CatPair />
    <h1>Привет, красоточка! 💕</h1>
    <div class="menu-options">
      <button class="menu-option menu-option--fresh" @click="emit('openStory')">
        А тут у нас что-то новенькое 🤔
      </button>
      <button class="menu-option menu-option--legacy" @click="emit('openTravel')">
        А тут выбор, куда поедем в отпуск 🌍
      </button>
    </div>
  </section>
</template>