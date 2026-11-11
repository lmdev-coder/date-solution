<script setup lang="ts">
import CatPair from '@/components/CatPair.vue';
import type { MenuItem } from '@/composables/useConfiguration';

interface Props {
  items: MenuItem[];
}

defineProps<Props>();

const emit = defineEmits<{ open: [id: MenuItem['id']] }>();

const menuCardMeta: Record<MenuItem['id'], { eyebrow: string; icon: string; note: string; tone: string }> = {
  dinner: { eyebrow: 'ВЕЧЕР ВДВОЁМ', icon: '🍷', note: 'Выберем место и время', tone: 'rose' },
  brest: { eyebrow: 'МАЛЕНЬКОЕ ПРИКЛЮЧЕНИЕ', icon: '🚂', note: 'Нас ждёт Брест', tone: 'blue' },
  travel: { eyebrow: 'МЕЧТАЕМ ВМЕСТЕ', icon: '✈️', note: 'Выберем наше путешествие', tone: 'yellow' },
  gift: { eyebrow: 'НОВОГОДНЕЕ ПРИКЛЮЧЕНИЕ', icon: '🎄', note: 'Найди сюрприз от Деда Мороза', tone: 'lilac' },
};
</script>

<template>
  <section class="menu-page">
    <header class="menu-topline">
      <span class="brand-mark" aria-hidden="true">✳</span>
      <span>НАШ МАЛЕНЬКИЙ КЛУБ</span>
      <span class="topline-heart" aria-hidden="true">♥</span>
    </header>

    <div class="menu-intro">
      <div class="intro-copy">
        <p class="eyebrow">КОЛЛЕКЦИЯ НАШИХ МОМЕНТОВ</p>
        <h1>Привет,<br /><em>красоточка!</em></h1>
        <p class="intro-note">Что сегодня добавим в нашу историю?</p>
      </div>
      <div class="intro-illustration" aria-hidden="true">
        <span class="sun-doodle">✳</span>
        <CatPair variant="md" />
        <span class="orbit orbit-one"></span>
        <span class="orbit orbit-two"></span>
        <span class="tiny-heart">♥</span>
      </div>
    </div>

    <div class="bento-heading">
      <span>ВЫБЕРИ НАСТРОЕНИЕ</span>
      <span class="bento-count">{{ items.length }} идеи <i>↘</i></span>
    </div>

    <div class="bento-grid">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        class="bento-card"
        :class="[`bento-card--${menuCardMeta[item.id].tone}`, { 'bento-card--done': !item.isFresh }]"
        :style="{ '--card-index': index }"
        @click="emit('open', item.id)"
      >
        <span class="bento-card__top">
          <span class="bento-card__eyebrow">{{ menuCardMeta[item.id].eyebrow }}</span>
          <span class="bento-card__arrow" aria-hidden="true">↗</span>
        </span>
        <span class="bento-card__icon" aria-hidden="true">{{ menuCardMeta[item.id].icon }}</span>
        <span v-if="!item.isFresh" class="done-badge"><span aria-hidden="true">✓</span> УЖЕ В НАШЕЙ ИСТОРИИ</span>
        <span class="bento-card__title">{{ item.label }}</span>
        <span class="bento-card__note">{{ item.isFresh ? menuCardMeta[item.id].note : 'Можно пережить это приключение ещё раз' }}</span>
        <span v-if="!item.isFresh" class="done-stamp" aria-hidden="true">♥</span>
      </button>
    </div>

    <footer class="menu-footer">
      <span>СОЗДАНО С ЛЮБОВЬЮ</span>
      <span class="footer-squiggle" aria-hidden="true">〰 ♥ 〰</span>
      <span>ТОЛЬКО ДЛЯ НАС ДВОИХ</span>
    </footer>
  </section>
</template>
