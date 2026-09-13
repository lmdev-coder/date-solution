<script setup lang="ts">
interface Props {
  summaryLines: string[];
  status: string;
}

defineProps<Props>();
</script>

<template>
  <section class="card final-card">
    <div class="hearts">💖💕💖</div>
    <h1>Люблю тебя, красоточка! ❤️</h1>
    <p v-for="line in summaryLines" :key="line">{{ line }}</p>
    <div class="hearts">💖💕💖</div>
    <p v-if="status" class="save-status">{{ status }}</p>
  </section>
</template>