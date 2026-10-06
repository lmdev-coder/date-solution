<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

interface Props {
  summaryLines: string[];
  status: string;
  /** When true, shows the clickable gift easter egg. */
  showGift?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showGift: false });

const SHAKE_DURATION_MS = 550;

const clicks = ref(0);
const isShaking = ref(false);
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
      return 'Открой дверцу, где стоит сейф, любовь моя ❤️';
    case 'second':
      return 'Он всё растёт... Ещё немного! 😳';
    case 'first':
      return 'Ого, он затрясся и подрос! 😮';
    default:
      return 'Нажми на подарочек 😏';
  }
});

function handleGiftClick(): void {
  clicks.value += 1;
  triggerShake();
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
  <section class="card final-card">
    <div class="hearts">💖💕💖</div>
    <h1>Люблю тебя, красоточка! ❤️</h1>
    <p v-for="line in summaryLines" :key="line">{{ line }}</p>

    <button
      v-if="props.showGift"
      type="button"
      class="gift"
      :class="[`gift--${stage}`, { 'gift--shake': isShaking }]"
      :aria-label="giftSymbol"
      @click="handleGiftClick"
    >
      <span class="gift-symbol">{{ giftSymbol }}</span>
    </button>
    <p v-if="props.showGift" class="gift-label">{{ giftLabel }}</p>

    <div class="hearts">💖💕💖</div>
    <p v-if="status" class="save-status">{{ status }}</p>
  </section>
</template>