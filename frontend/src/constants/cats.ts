export const CAT_COLORS = {
  pink: '#FFB6C1',
  blue: '#ADD8E6',
  peach: '#FFDAB9',
  lavender: '#E6E6FA',
  yellow: '#F0E68C',
  green: '#98FB98',
} as const;

/** Cats drifting behind every step. */
export const BACKGROUND_CAT_COLORS: readonly string[] = [
  CAT_COLORS.pink,
  CAT_COLORS.peach,
  CAT_COLORS.lavender,
  CAT_COLORS.yellow,
  CAT_COLORS.green,
];

/** The couple shown inside the cards. */
export const COUPLE_CAT_COLORS: readonly string[] = [CAT_COLORS.pink, CAT_COLORS.blue];