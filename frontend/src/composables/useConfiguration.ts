import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { DEFAULT_CONFIGURATION } from '@/constants/configuration';
import { completeGame as completeGameRequest, fetchConfiguration } from '@/services/api';
import type { AppConfiguration, GameId } from '@/types/configuration';

export interface MenuItem {
  id: GameId;
  label: string;
  /** `true` renders the pink "fresh" style, `false` the gray "done" style. */
  isFresh: boolean;
}

export interface ConfigurationState {
  config: Ref<AppConfiguration>;
  /** Games to render, omitting the ones flagged as inactive (`active: false`). */
  menuItems: ComputedRef<MenuItem[]>;
  isLoading: Ref<boolean>;
  loadError: Ref<string>;
  /** Fetches the remote configuration; falls back to defaults on failure. */
  load: (authHash: string) => Promise<void>;
  isCompleted: (id: GameId) => boolean;
  /**
   * Marks a game as completed (`done: true`) on the server and reflects the
   * returned configuration locally.
   */
  completeGame: (authHash: string, id: GameId) => Promise<void>;
}

export function useConfiguration(): ConfigurationState {
  const config = ref<AppConfiguration>(DEFAULT_CONFIGURATION);
  const isLoading = ref(false);
  const loadError = ref('');

  const menuItems = computed<MenuItem[]>(() =>
    config.value.games
      .filter((game) => game.active)
      .map((game) => {
        const isFresh = !game.done;
        return {
          id: game.id,
          label: isFresh ? game.freshLabel : game.doneLabel,
          isFresh,
        };
      }),
  );

  async function load(authHash: string): Promise<void> {
    isLoading.value = true;
    loadError.value = '';

    try {
      config.value = await fetchConfiguration(authHash);
    } catch (error) {
      console.error(error);
      loadError.value = 'Не удалось загрузить конфигурацию, использую стандартную';
      config.value = DEFAULT_CONFIGURATION;
    } finally {
      isLoading.value = false;
    }
  }

  function isCompleted(id: GameId): boolean {
    return config.value.games.some((game) => game.id === id && game.done);
  }

  async function completeGame(authHash: string, id: GameId): Promise<void> {
    try {
      config.value = await completeGameRequest(authHash, id);
    } catch (error) {
      console.error(error);
      // Best-effort local fallback so the UI still reflects completion.
      config.value = {
        games: config.value.games.map((game) =>
          game.id === id ? { ...game, done: true } : game,
        ),
      };
    }
  }

  return { config, menuItems, isLoading, loadError, load, isCompleted, completeGame };
}