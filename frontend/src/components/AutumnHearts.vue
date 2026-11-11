<script setup lang="ts">
/**
 * Декоративный осенний дождь из сердечек и листьев; зимний вариант — снег.
 * Параметры частиц задаются один раз при создании компонента.
 */
interface Props {
  winter?: boolean;
}

const props = withDefaults(defineProps<Props>(), { winter: false });

interface FallPiece {
  id: number;
  symbol: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

const SNOW_SYMBOLS = ['❄', '❅', '❆', '⛄'];
const HEART_SYMBOLS = ['💖', '💕', '❤️', '💗'];
const LEAF_SYMBOLS = ['🍁', '🍂', '🍃'];
const PIECE_COUNT = props.winter ? 48 : 24;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

const pieces: FallPiece[] = Array.from({ length: PIECE_COUNT }, (_, index) => {
  const isSnowman = index % 9 === 0;
  const isAutumn = !props.winter;
  const symbols = props.winter ? SNOW_SYMBOLS : index % 2 === 0 ? HEART_SYMBOLS : LEAF_SYMBOLS;
  const symbolIndex = props.winter ? index % 3 : Math.floor(index / 2) % 4;
  const symbol = props.winter && isSnowman ? '⛄' : symbols[symbolIndex];

  return {
    id: index,
    symbol,
    left: randomBetween(0, 100),
    duration: randomBetween(props.winter && isSnowman ? 13 : 7, props.winter && isSnowman ? 22 : 14),
    delay: randomBetween(0, 12),
    size: randomBetween(props.winter && isSnowman ? 31 : 18, props.winter && isSnowman ? 42 : isAutumn ? 34 : 32),
  };
});
</script>

<template>
  <div class="falling-effects" :class="{ 'falling-effects--winter': winter }" aria-hidden="true">
    <span
      v-for="piece in pieces"
      :key="piece.id"
      class="fall-piece"
      :style="{
        left: `${piece.left}%`,
        fontSize: `${piece.size}px`,
        animationDuration: `${piece.duration}s`,
        animationDelay: `${piece.delay}s`,
        opacity: winter ? 0.58 + (piece.size / 100) : undefined,
      }"
    >
      {{ piece.symbol }}
    </span>
  </div>
</template>