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
import { DINNER_PLACE_OPTIONS, DINNER_STORY_MESSAGES, DINNER_TIME_OPTIONS } from '@/constants/dinner';
import { BREST_AGREED_SUMMARY, BREST_DECLINED_SUMMARY, STORY_MESSAGES } from '@/constants/story';
import { useDinnerSelection } from '@/composables/useDinnerSelection';
import { useInvitationSaver } from '@/composables/useInvitationSaver';
import { useInvitationSelection } from '@/composables/useInvitationSelection';
import { usePasswordAuth } from '@/composables/usePasswordAuth';
import type { InvitationStep, Option, StoryAnswerV2 } from '@/types/invitation';

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

/** Single source of truth for which screen is on top. */
const step = ref<InvitationStep>('login');

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

/** Whether the falling-hearts-and-leaves overlay should be visible. */
const isDinnerActive = computed(() => DINNER_STEPS.includes(step.value));

onMounted(() => {
  if (restore()) {
    step.value = 'menu';
  }
});

async function handleLogin(password: string): Promise<void> {
  if (await submitPassword(password)) {
    step.value = 'menu';
  }
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
}

async function handleBrestAnswer(trip: boolean): Promise<void> {
  brestTrip.value = trip;
  step.value = 'final-story';

  const authToken = authHash.value;
  if (!authToken) {
    return;
  }

  const storyAnswer: StoryAnswerV2 = { version: 2, brestTrip: trip };
  await saveAnswer(authToken, storyAnswer);
}

async function handleDinnerTimeChoice(option: Option): Promise<void> {
  selectDinnerTime(option.id);
  step.value = 'final-dinner';

  const authToken = authHash.value;
  const dinner = dinnerAnswer.value;
  if (authToken && dinner) {
    await saveAnswer(authToken, dinner);
  }
}
</script>

<template>
  <main class="app">
    <CatBackground />
    <AutumnHearts v-if="isDinnerActive" />

    <Transition name="step" mode="out-in">
      <StepLogin
        v-if="step === 'login'"
        :error="errorMessage"
        :is-submitting="isSubmitting"
        @submit="handleLogin"
      />

      <StepMenu
        v-else-if="step === 'menu'"
        @open-story="step = 'story'"
        @open-travel="step = 'question'"
        @open-dinner="step = 'dinner-story'"
      />

      <!-- V2: мини-игра про Брест -->
      <StepStory
        v-else-if="step === 'story'"
        :messages="STORY_MESSAGES"
        @finish="step = 'brest'"
      />

      <StepBrest v-else-if="step === 'brest'" @answer="handleBrestAnswer" />

      <StepFinal
        v-else-if="step === 'final-story'"
        :summary-lines="brestSummaryLines"
        :status="statusMessage"
      />

      <!-- V3: ужин-приглашение -->
      <StepStory
        v-else-if="step === 'dinner-story'"
        :messages="DINNER_STORY_MESSAGES"
        @finish="step = 'dinner-places'"
      />

      <StepCountries
        v-else-if="step === 'dinner-places'"
        :selected="dinnerPlaces"
        :options="DINNER_PLACE_OPTIONS"
        title="Куда пойдём на ужин? 🍽️"
        hint="Можно выбрать только два места 😉 (шутка, серьёзно — два!)"
        next-label="Выбрали! 😋"
        :next-disabled="dinnerPlaces.length !== 2"
        @toggle="toggleDinnerPlace"
        @next="step = 'dinner-time'"
      />

      <StepChoice
        v-else-if="step === 'dinner-time'"
        title="Во сколько встречаемся? ⏰"
        hint="Только один вариант 😉"
        :options="DINNER_TIME_OPTIONS"
        @choose="handleDinnerTimeChoice"
      />

      <StepFinal
        v-else-if="step === 'final-dinner'"
        :summary-lines="dinnerSummaryLines"
        :status="statusMessage"
        show-gift
      />

      <!-- V1: выбор страны, отеля и дат -->
      <StepQuestion v-else-if="step === 'question'" @answer="step = 'countries'" />

      <StepCountries
        v-else-if="step === 'countries'"
        :selected="countries"
        @toggle="toggleCountry"
        @next="handleCountriesNext"
      />

      <StepChoice
        v-else-if="step === 'hotel'"
        title="Выбери отель 🏨"
        hint="Только лучший вариант 😉"
        :options="HOTEL_OPTIONS"
        @choose="handleHotelChoice"
      />

      <StepChoice
        v-else-if="step === 'dates'"
        title="Даты 📅"
        hint="Идеальный план!"
        :options="DATE_OPTIONS"
        @choose="handleDatesChoice"
      />

      <StepFinal v-else :summary-lines="summaryLines" :status="statusMessage" />
    </Transition>
  </main>
</template>