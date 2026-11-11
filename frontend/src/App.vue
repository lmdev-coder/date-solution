<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import AutumnHearts from '@/components/AutumnHearts.vue';
import CatBackground from '@/components/CatBackground.vue';
import StepBrest from '@/components/steps/StepBrest.vue';
import StepChoice from '@/components/steps/StepChoice.vue';
import StepCountries from '@/components/steps/StepCountries.vue';
import StepFinal from '@/components/steps/StepFinal.vue';
import StepLogin from '@/components/steps/StepLogin.vue';
import StepMenu from '@/components/steps/StepMenu.vue';
import StepQuestion from '@/components/steps/StepQuestion.vue';
import StepStory from '@/components/steps/StepStory.vue';
import { DATE_OPTIONS, HOTEL_OPTIONS } from '@/constants/invitation';
import {
  ANNIVERSARY_STORY_MESSAGES,
  ANNIVERSARY_SUMMARY_LINES,
} from '@/constants/anniversary';
import { DINNER_PLACE_OPTIONS, DINNER_STORY_MESSAGES, DINNER_TIME_OPTIONS } from '@/constants/dinner';
import { BREST_AGREED_SUMMARY, BREST_DECLINED_SUMMARY, STORY_MESSAGES } from '@/constants/story';
import { useConfiguration } from '@/composables/useConfiguration';
import { useDinnerSelection } from '@/composables/useDinnerSelection';
import { useInvitationSaver } from '@/composables/useInvitationSaver';
import { useInvitationSelection } from '@/composables/useInvitationSelection';
import { usePasswordAuth } from '@/composables/usePasswordAuth';
import type { InvitationStep, Option, StoryAnswerV2 } from '@/types/invitation';
import type { GameId } from '@/types/configuration';

const NO_COUNTRY_ALERT = 'Выбери хотя бы одну страну 😉';

const {
  authHash,
  errorMessage,
  isSubmitting,
  submit: submitPassword,
  restore,
} = usePasswordAuth();

const { countries, answer, summaryLines, toggleCountry, selectHotel, selectDates } =
  useInvitationSelection();

const {
  places: dinnerPlaces,
  answer: dinnerAnswer,
  summaryLines: dinnerSummaryLines,
  togglePlace: toggleDinnerPlace,
  selectTime: selectDinnerTime,
} = useDinnerSelection();

const { statusMessage, save: saveAnswer } = useInvitationSaver();

const {
  menuItems,
  load: loadConfiguration,
  completeGame,
} = useConfiguration();

/** Single source of truth for which screen is on top. */
const step = ref<InvitationStep>('login');

/** Current game, used by the persistent close-to-home control. */
const activeGame = ref<GameId | null>(null);

function returnHome(): void {
  activeGame.value = null;
  step.value = 'menu';
}

/** Send the completion request only after the flow reaches its final screen. */
function finishActiveGame(id: GameId): void {
  completeActiveGame(id);
  activeGame.value = null;
}

/** V2 answer; `null` until the Brest question is answered. */
const brestTrip = ref<boolean | null>(null);

const brestSummaryLines = computed(() => {
  if (brestTrip.value === null) {
    return [];
  }

  return [brestTrip.value ? BREST_AGREED_SUMMARY : BREST_DECLINED_SUMMARY];
});

/** Steps that belong to the V3 dinner game. */
const DINNER_STEPS: readonly InvitationStep[] = [
  'dinner-story',
  'dinner-places',
  'dinner-time',
  'final-dinner',
];

/** Шаги новогоднего квеста с подарком. */
const ANNIVERSARY_STEPS: readonly InvitationStep[] = ['anniversary-story', 'anniversary-gift'];

/** Dinner and anniversary flows keep their original autumnal atmosphere. */
const FALLING_EFFECT_STEPS: readonly InvitationStep[] = [
  ...DINNER_STEPS,
  ...ANNIVERSARY_STEPS,
];

/** New Year quest gets a separate snowfall overlay. */
const WINTER_EFFECT_STEPS: readonly InvitationStep[] = ['anniversary-story', 'anniversary-gift'];

/** Whether the falling-hearts-and-leaves overlay is on screen. */
const isFallingEffectsActive = computed(() => FALLING_EFFECT_STEPS.includes(step.value));

/** First step each game opens when its menu button is clicked. */
const GAME_FIRST_STEP: Record<GameId, InvitationStep> = {
  gift: 'anniversary-story',
  dinner: 'dinner-story',
  brest: 'story',
  travel: 'question',
};

onMounted(() => {
  if (restore() && authHash.value) {
    void loadConfiguration(authHash.value);
    step.value = 'menu';
  }
});

async function handleLogin(password: string): Promise<void> {
  if (await submitPassword(password)) {
    await loadConfiguration(authHash.value ?? '');
    step.value = 'menu';
  }
}

function handleMenuOpen(gameId: GameId): void {
  activeGame.value = gameId;
  step.value = GAME_FIRST_STEP[gameId];
}

/** Marks a game as done on the server once its flow is finished. */
function completeActiveGame(id: GameId): void {
  const authToken = authHash.value;
  if (!authToken) {
    return;
  }

  void completeGame(authToken, id);
}

function handleCountriesNext(): void {
  if (countries.value.length === 0) {
    window.alert(NO_COUNTRY_ALERT);
    return;
  }

  step.value = 'hotel';
}

function handleHotelChoice(option: Option): void {
  selectHotel(option);
  step.value = 'dates';
}

async function handleDatesChoice(option: Option): Promise<void> {
  selectDates(option);
  step.value = 'final';

  const authToken = authHash.value;
  const invitation = answer.value;
  if (authToken && invitation) {
    await saveAnswer(authToken, invitation);
  }
  finishActiveGame('travel');
}

async function handleBrestAnswer(trip: boolean): Promise<void> {
  brestTrip.value = trip;
  step.value = 'final-story';

  const authToken = authHash.value;
  if (authToken) {
    const storyAnswer: StoryAnswerV2 = { version: 2, brestTrip: trip };
    await saveAnswer(authToken, storyAnswer);
  }
  finishActiveGame('brest');
}

async function handleDinnerTimeChoice(option: Option): Promise<void> {
  selectDinnerTime(option.id);
  step.value = 'final-dinner';

  const authToken = authHash.value;
  const dinner = dinnerAnswer.value;
  if (authToken && dinner) {
    await saveAnswer(authToken, dinner);
  }
  finishActiveGame('dinner');
}

function handleAnniversaryFinished(): void {
  step.value = 'anniversary-gift';
}
</script>

<template>
  <main class="app">
    <CatBackground v-if="!WINTER_EFFECT_STEPS.includes(step)" />
    <AutumnHearts v-if="isFallingEffectsActive && !WINTER_EFFECT_STEPS.includes(step)" />
    <Transition name="winter-scene" mode="out-in">
      <div v-if="WINTER_EFFECT_STEPS.includes(step)" key="winter" class="winter-scene" aria-hidden="true">
        <span class="winter-scene__tree winter-scene__tree--left">🎄</span>
        <span class="winter-scene__tree winter-scene__tree--right">🎄</span>
        <span class="winter-scene__star winter-scene__star--one">✦</span>
        <span class="winter-scene__star winter-scene__star--two">✧</span>
      </div>
    </Transition>
    <AutumnHearts v-if="WINTER_EFFECT_STEPS.includes(step)" winter />
    <Transition name="step" mode="out-in">
      <StepLogin
        v-if="step === 'login'"
        :error="errorMessage"
        :is-submitting="isSubmitting"
        @submit="handleLogin"
      />

      <StepMenu
        v-else-if="step === 'menu'"
        :items="menuItems"
        @open="handleMenuOpen"
      />

      <!-- V2: мини-игра про Брест -->
      <StepStory
        v-else-if="step === 'story'"
        :messages="STORY_MESSAGES"
        show-home
        @home="returnHome"
        @finish="step = 'brest'"
      />

      <StepBrest v-else-if="step === 'brest'" @home="returnHome" @answer="handleBrestAnswer" />

      <StepFinal
        v-else-if="step === 'final-story'"
        :summary-lines="brestSummaryLines"
        :status="statusMessage"
        show-home
        @home="returnHome"
      />

      <!-- V3: ужин-приглашение -->
      <StepStory
        v-else-if="step === 'dinner-story'"
        :messages="DINNER_STORY_MESSAGES"
        :winter="WINTER_EFFECT_STEPS.includes(step)"
        show-home
        @home="returnHome"
        @finish="step = 'dinner-places'"
      />

      <StepCountries
        v-else-if="step === 'dinner-places'"
        :selected="dinnerPlaces"
        :options="DINNER_PLACE_OPTIONS"
        :winter="WINTER_EFFECT_STEPS.includes(step)"
        title="Куда пойдём на ужин? 🍽️"
        hint="Можно выбрать только два места 😉 (шутка, серьёзно — два!)"
        next-label="Выбрали! 😋"
        :next-disabled="dinnerPlaces.length !== 2"
        show-home
        @home="returnHome"
        @toggle="toggleDinnerPlace"
        @next="step = 'dinner-time'"
      />

      <StepChoice
        v-else-if="step === 'dinner-time'"
        title="Во сколько встречаемся? ⏰"
        hint="Только один вариант 😉"
        :options="DINNER_TIME_OPTIONS"
        :winter="WINTER_EFFECT_STEPS.includes(step)"
        show-home
        @home="returnHome"
        @choose="handleDinnerTimeChoice"
      />

      <StepFinal
        v-else-if="step === 'final-dinner'"
        :summary-lines="dinnerSummaryLines"
        :status="statusMessage"
        :winter="WINTER_EFFECT_STEPS.includes(step)"
        show-home
        @home="returnHome"
      />

      <!-- Новогодний квест (доступность управляется configuration.json) -->
      <StepStory
        v-else-if="step === 'anniversary-story'"
        :messages="ANNIVERSARY_STORY_MESSAGES"
        winter
        show-home
        @home="returnHome"
        @finish="handleAnniversaryFinished"
      />

      <StepFinal
        v-else-if="step === 'anniversary-gift'"
        :summary-lines="ANNIVERSARY_SUMMARY_LINES"
        :status="statusMessage"
        show-gift
        show-home
        winter
        complete-on-gift-reveal
        @complete="finishActiveGame('gift')"
        @home="returnHome"
      />

      <!-- V1: выбор страны, отеля и дат -->
      <StepQuestion v-else-if="step === 'question'" @home="returnHome" @answer="step = 'countries'" />

      <StepCountries
        v-else-if="step === 'countries'"
        :selected="countries"
        show-home
        @home="returnHome"
        @toggle="toggleCountry"
        @next="handleCountriesNext"
      />

      <StepChoice
        v-else-if="step === 'hotel'"
        title="Выбери отель 🏨"
        hint="Только лучший вариант 😉"
        :options="HOTEL_OPTIONS"
        show-home
        @home="returnHome"
        @choose="handleHotelChoice"
      />

      <StepChoice
        v-else-if="step === 'dates'"
        title="Даты 📅"
        hint="Идеальный план!"
        :options="DATE_OPTIONS"
        show-home
        @home="returnHome"
        @choose="handleDatesChoice"
      />

      <StepFinal
        v-else
        :summary-lines="summaryLines"
        :status="statusMessage"
        show-home
        @home="returnHome"
      />
    </Transition>
  </main>
</template>