import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { DINNER_PLACES_LIMIT } from '@/constants/dinner';
import type { DinnerAnswerV3 } from '@/types/invitation';

export interface DinnerSelection {
  places: Ref<string[]>;
  time: Ref<string | null>;
  /** `null` until exactly two places and a time are picked. */
  answer: ComputedRef<DinnerAnswerV3 | null>;
  summaryLines: ComputedRef<string[]>;
  togglePlace: (place: string) => void;
  selectTime: (time: string) => void;
}

export function useDinnerSelection(): DinnerSelection {
  const places = ref<string[]>([]);
  const time = ref<string | null>(null);

  const answer = computed<DinnerAnswerV3 | null>(() => {
    if (places.value.length !== DINNER_PLACES_LIMIT || !time.value) {
      return null;
    }

    return {
      version: 3,
      places: [...places.value],
      time: time.value,
    };
  });

  const summaryLines = computed(() => {
    if (!answer.value) {
      return [];
    }

    return [
      'Спасибо тебе ещё раз, что мы вместе и что ты — моя жена ❤️',
      `Наш ужин: ${answer.value.places.join(' и ')}`,
      `Во сколько: ${answer.value.time}`,
      'Очень жду нашей встречи 💕',
    ];
  });

  /** Toggles a place but never lets more than `DINNER_PLACES_LIMIT` be picked. */
  function togglePlace(place: string): void {
    if (places.value.includes(place)) {
      places.value = places.value.filter((selected) => selected !== place);
      return;
    }

    if (places.value.length >= DINNER_PLACES_LIMIT) {
      return;
    }

    places.value = [...places.value, place];
  }

  function selectTime(selectedTime: string): void {
    time.value = selectedTime;
  }

  return { places, time, answer, summaryLines, togglePlace, selectTime };
}