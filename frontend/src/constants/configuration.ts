import type { AppConfiguration } from '@/types/configuration';

/**
 * Client-side fallback used while the remote configuration loads (or when the
 * configuration request fails). Mirrors the backend default.
 */
export const DEFAULT_CONFIGURATION: AppConfiguration = {
  games: [
    {
      id: 'gift',
      freshLabel: 'А тут у нас что-то новенькое 🤔',
      doneLabel: 'Локация подарка на годовщину 🔍',
      active: true,
      done: false,
    },
    {
      id: 'dinner',
      freshLabel: 'А тут у нас что-то новенькое 🤔',
      doneLabel: 'Годовщина ужин 🥂',
      active: true,
      done: false,
    },
    {
      id: 'brest',
      freshLabel: 'А тут у нас что-то новенькое 🤔',
      doneLabel: 'Поездка в Брест ❤️',
      active: true,
      done: false,
    },
    {
      id: 'travel',
      freshLabel: 'А тут у нас что-то новенькое 🤔',
      doneLabel: 'А тут выбор, куда поедем в отпуск 🌍',
      active: true,
      done: false,
    },
  ],
};