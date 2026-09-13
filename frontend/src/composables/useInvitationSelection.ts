import { computed, ref, type ComputedRef, type Ref } from 'vue';

import type { Option, TravelAnswerV1 } from '@/types/invitation';

export interface InvitationSelection {
  countries: Ref<string[]>;
  hotel: Ref<Option | null>;
  dates: Ref<Option | null>;
  /** `null` while any of the three choices is still missing. */
  answer: ComputedRef<TravelAnswerV1 | null>;
  summaryLines: ComputedRef<string[]>;
  toggleCountry: (country: string) => void;
  selectHotel: (option: Option) => void;
  selectDates: (option: Option) => void;
}

export function useInvitationSelection(): InvitationSelection {
  const countries = ref<string[]>([]);
  const hotel = ref<Option | null>(null);
  const dates = ref<Option | null>(null);

  const answer = computed<TravelAnswerV1 | null>(() => {
    if (countries.value.length === 0 || !hotel.value || !dates.value) {
      return null;
    }

    return {
      version: 1,
      countries: [...countries.value],
      hotel: hotel.value.id,
      dates: dates.value.id,
    };
  });

  const summaryLines = computed(() => {
    if (!answer.value) {
      return [];
    }

    return [
      `Ты выбрала лететь в одну из этих стран: ${answer.value.countries.join(' или ')}`,
      `Отель: ${answer.value.hotel}`,
      `Даты: ${answer.value.dates}`,
    ];
  });

  function toggleCountry(country: string): void {
    countries.value = countries.value.includes(country)
      ? countries.value.filter((selected) => selected !== country)
      : [...countries.value, country];
  }

  function selectHotel(option: Option): void {
    hotel.value = option;
  }

  function selectDates(option: Option): void {
    dates.value = option;
  }

  return { countries, hotel, dates, answer, summaryLines, toggleCountry, selectHotel, selectDates };
}