<script setup lang="ts">
import CatPair from '@/components/CatPair.vue';
import type { MenuItem } from '@/composables/useConfiguration';

interface Props {
  items: MenuItem[];
}

defineProps<Props>();

const emit = defineEmits<{ open: [id: MenuItem['id']] }>();
</script>

<template>
  <section class="card">
    <CatPair />
    <h1>Привет, красоточка! 💕</h1>
    <div class="menu-options">
      <button
        v-for="item in items"
        :key="item.id"
        class="menu-option"
        :class="item.isFresh ? 'menu-option--fresh' : 'menu-option--legacy'"
        @click="emit('open', item.id)"
      >
        {{ item.label }}
      </button>
    </div>
  </section>
</template>