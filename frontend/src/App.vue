<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

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
import { BREST_AGREED_SUMMARY, BREST_DECLINED_SUMMARY } from '@/constants/story';
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
</script>

<template>
  <main class="app">
    <CatBackground />

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
      />

      <!-- V2: мини-игра про Брест -->
      <StepStory v-else-if="step === 'story'" @finish="step = 'brest'" />

      <StepBrest v-else-if="step === 'brest'" @answer="handleBrestAnswer" />

      <StepFinal
        v-else-if="step === 'final-story'"
        :summary-lines="brestSummaryLines"
        :status="statusMessage"
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