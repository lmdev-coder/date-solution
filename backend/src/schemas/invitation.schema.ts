import { z } from 'zod';

import type { InvitationAnswer } from '../types/invitation';

const travelAnswerSchema = z.object({
  version: z.literal(1),
  countries: z
    .array(z.string().trim().min(1, 'Название страны не может быть пустым'))
    .min(1, 'Выбери хотя бы одну страну'),
  hotel: z.string().trim().min(1, 'Не указан отель'),
  dates: z.string().trim().min(1, 'Не указаны даты'),
});

const storyAnswerSchema = z.object({
  version: z.literal(2),
  brestTrip: z.boolean({ required_error: 'Не указан ответ про поездку в Брест' }),
});

/**
 * Ties the runtime contract to the compile-time interface: zod fails to
 * compile if the two ever drift apart. The union is discriminated by
 * `version`, so each flow of the client validates only its own fields.
 */
export const invitationAnswerSchema: z.ZodType<InvitationAnswer> = z.discriminatedUnion('version', [
  travelAnswerSchema,
  storyAnswerSchema,
]);

/** Flattens zod issues into a single human-readable message. */
export function describeValidationError(error: z.ZodError<InvitationAnswer>): string {
  return error.issues.map((issue) => issue.message).join('; ');
}