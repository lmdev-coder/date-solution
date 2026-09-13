<script setup lang="ts">
import { ref } from 'vue';

import CatPair from '@/components/CatPair.vue';

interface Props {
  error?: string;
  isSubmitting?: boolean;
}

withDefaults(defineProps<Props>(), { error: '', isSubmitting: false });

const emit = defineEmits<{ submit: [password: string] }>();

const password = ref('');

function submitPassword(): void {
  emit('submit', password.value);
}
</script>

<template>
  <section class="card">
    <CatPair />
    <h1>🔒 Введите пароль</h1>
    <input
      v-model="password"
      type="password"
      class="password-input"
      placeholder="Пароль..."
      autofocus
      @keyup.enter="submitPassword"
    />
    <button class="btn btn-primary btn-block" :disabled="isSubmitting" @click="submitPassword">
      Войти
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>