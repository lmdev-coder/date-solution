import type { Option } from '@/types/invitation';

/**
 * V3 copy: sweet messages revealed one at a time (same format as the V2
 * mini-game), followed by the dinner place and time pickers.
 */
export const DINNER_STORY_MESSAGES: readonly string[] = [
  'Знаешь, я безгранично тебя люблю — ты самое лучшее, что со мной случилось 💖',
  'Не верится, что мы вместе уже целый год: 15 октября у нас с тобой годовщина 🎉',
  'Спасибо тебе, что ты рядом, и спасибо, что ты — моя жена ❤️',
];

/** How many places can be picked for the dinner. */
export const DINNER_PLACES_LIMIT = 2;

const DINNER_PLACE_NAMES = [
  'Ужин дома 🏠',
  'Темпо Боровая 🍕',
  'Терра Уручье 🥂',
  'Соседи 24 в Зелёном Лугу 🍽️',
  'Паб 12 🍺',
  'Лидбир Тёмное 🍻',
  'Невинный ☕',
  'Джерри 🍔',
] as const;

export const DINNER_PLACE_OPTIONS: readonly Option[] = DINNER_PLACE_NAMES.map((name) => ({
  id: name,
  label: name,
}));

const DINNER_TIMES = ['19:30', '20:00', '20:30', '21:00', '22:00'] as const;

export const DINNER_TIME_OPTIONS: readonly Option[] = DINNER_TIMES.map((time) => ({
  id: time,
  label: `${time} ⏰`,
}));