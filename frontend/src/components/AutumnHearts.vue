<script setup lang="ts">
/**
 * Decorative overlay of falling hearts and autumn leaves for the V3 game.
 * Each piece gets a random horizontal position, size, duration and delay —
 * randomized once on mount, then the CSS keeps them tumbling forever.
 */
interface FallPiece {
  id: number;
  symbol: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

const HEART_SYMBOLS = ['💖', '💕', '❤️', '💗'];
const LEAF_SYMBOLS = ['🍁', '🍂', '🍃'];

const PIECE_COUNT = 24;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

const pieces: FallPiece[] = Array.from({ length: PIECE_COUNT }, (_, index) => {
  const isLeaf = index % 2 === 1;
  const symbols = isLeaf ? LEAF_SYMBOLS : HEART_SYMBOLS;

  return {
    id: index,
    symbol: symbols[index % symbols.length],
    left: randomBetween(0, 100),
    duration: randomBetween(7, 15),
    delay: randomBetween(0, 8),
    size: randomBetween(18, 34),
  };
});
</script>

<template>
  <div class="falling-effects" aria-hidden="true">
    <span
      v-for="piece in pieces"
      :key="piece.id"
      class="fall-piece"
      :style="{
        left: `${piece.left}%`,
        fontSize: `${piece.size}px`,
        animationDuration: `${piece.duration}s`,
        animationDelay: `${piece.delay}s`,
      }"
    >
      {{ piece.symbol }}
    </span>
  </div>
</template>