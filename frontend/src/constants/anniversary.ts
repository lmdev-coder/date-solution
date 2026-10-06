/**
 * Content of the anniversary gift game. Availability is now controlled by the
 * remote `configuration.json` (active flags), not by a hardcoded date.
 */

/** Messages revealed one at a time before the gift easter egg. */
export const ANNIVERSARY_STORY_MESSAGES: readonly string[] = [
  'Люблю тебя, моя жена! Я так рад, что ты зашла на сайт именно в этот день 💕',
  'С годовщиной нас — мы вместе уже целый год! 🎉',
];

/** Line shown on the gift screen, right above the clickable present. */
export const ANNIVERSARY_SUMMARY_LINES: string[] = [
  'Я очень надеюсь, что тебе понравится подарок',
];