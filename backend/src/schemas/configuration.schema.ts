import { z } from 'zod';

import type { AppConfiguration, GameId } from '../types/configuration';

const GAME_IDS = ['gift', 'dinner', 'brest', 'travel'] as const satisfies readonly GameId[];

const gameConfigSchema = z.object({
  id: z.enum(GAME_IDS),
  freshLabel: z.string().trim().min(1, 'freshLabel не может быть пустым'),
  doneLabel: z.string().trim().min(1, 'doneLabel не может быть пустым'),
  active: z.boolean(),
  done: z.boolean(),
});

export const configurationSchema: z.ZodType<AppConfiguration> = z.object({
  games: z.array(gameConfigSchema).min(1, 'Нужна хотя бы одна игра'),
});

/** Body of `POST /.netlify/functions/configuration` to mark a game done. */
export const configurationUpdateSchema = z.object({
  id: z.enum(GAME_IDS),
});

/** Flattens zod issues into a single human-readable message. */
export function describeConfigurationError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join('; ');
}