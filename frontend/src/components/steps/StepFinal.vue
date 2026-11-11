<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

interface Props {
  summaryLines: string[];
  status: string;
  /** When true, shows the clickable gift easter egg. */
  showGift?: boolean;
  showHome?: boolean;
  completeOnGiftReveal?: boolean;
  winter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showGift: false,
  showHome: false,
  completeOnGiftReveal: false,
  winter: false,
});
const emit = defineEmits<{ home: []; complete: [] }>();

const SHAKE_DURATION_MS = 550;

const clicks = ref(0);
const isShaking = ref(false);
const isCompleted = ref(false);
let shakeTimer: number | undefined;

/**
 * Gift stages: grows at 5 and 10 clicks, then spins into a hidden-game hint at 15.
 */
const stage = computed(() => {
  if (clicks.value >= 15) {
    return 'hint';
  }
  if (clicks.value >= 10) {
    return 'second';
  }
  if (clicks.value >= 5) {
    return 'first';
  }
  return 'idle';
});

const giftSymbol = computed(() => (stage.value === 'hint' ? '🚪' : '🎁'));

const giftLabel = computed(() => {
  switch (stage.value) {
    case 'hint':
      return 'Снеговик нашёл след! Загляни туда, где у нас хранятся сбережения, любимая ⛄';
    case 'second':
      return 'Кажется, подарок оживает… нажми ещё несколько раз! ✨';
    case 'first':
      return 'Ой, подарок зашевелился! Кажется, внутри подсказка 🎁';
    default:
      return 'Нажми на подарок, чтобы найти новогодний сюрприз 🎄';
  }
});

function handleGiftClick(): void {
  clicks.value += 1;
  triggerShake();

  if (props.completeOnGiftReveal && clicks.value >= 15 && !isCompleted.value) {
    isCompleted.value = true;
    emit('complete');
  }
}

/** Restarts the shake animation so every click jiggles the gift. */
function triggerShake(): void {
  if (shakeTimer) {
    window.clearTimeout(shakeTimer);
  }

  isShaking.value = false;
  requestAnimationFrame(() => {
    isShaking.value = true;
    shakeTimer = window.setTimeout(() => {
      isShaking.value = false;
    }, SHAKE_DURATION_MS);
  });
}

onBeforeUnmount(() => {
  if (shakeTimer) {
    window.clearTimeout(shakeTimer);
  }
});
</script>

<template>
  <section class="card final-card game-card" :class="{ 'final-card--winter': winter }">
    <button v-if="showHome" type="button" class="home-control" aria-label="На главную" title="На главную" @click="emit('home')">
      <span aria-hidden="true">×</span>
    </button>
    <div class="hearts">{{ winter ? '❄️ 🎄 ❄️' : '💖💕💖' }}</div>
    <h1>{{ winter ? 'С Новым годом, любимая! 🎄' : 'Люблю тебя, красоточка! ❤️' }}</h1>
    <p v-for="line in summaryLines" :key="line">{{ line }}</p>

    <button
      v-if="props.showGift"
      type="button"
      class="gift"
      :class="[`gift--${stage}`, { 'gift--shake': isShaking }]"
      :aria-label="giftSymbol"
      @click="handleGiftClick"
    >
      <span class="gift-symbol">{{ showGift ? (stage === 'hint' ? '⛄' : stage === 'second' ? '🎄' : '🎁') : giftSymbol }}</span>
    </button>
    <p v-if="props.showGift" class="gift-label">{{ giftLabel }}</p>

    <div class="hearts">{{ winter ? '✨ ❄️ ✨' : '💖💕💖' }}</div>
    <p v-if="status" class="save-status">{{ status }}</p>
  </section>
</template>