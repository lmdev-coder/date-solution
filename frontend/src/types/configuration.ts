/** Frontend mirror of the backend configuration domain types. */

/** Identifiers of the four games the menu can host. */
export type GameId = 'gift' | 'dinner' | 'brest' | 'travel';

/** Per-game menu configuration. */
export interface GameConfig {
  id: GameId;
  /** Label shown while the game is still "fresh" (not yet completed). */
  freshLabel: string;
  /** Label shown once the game has been completed (gray button). */
  doneLabel: string;
  /** When `false`, the button is not shown at all. */
  active: boolean;
  /** When `true`, the game is marked completed: gray button with `doneLabel`. */
  done: boolean;
}

/** The whole menu configuration stored as a single R2 object. */
export interface AppConfiguration {
  games: GameConfig[];
}