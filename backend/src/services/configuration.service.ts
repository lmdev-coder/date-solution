import type { AppConfiguration, GameId } from '../types/configuration';
import type { R2StorageService } from './r2-storage.service';

const JSON_CONTENT_TYPE = 'application/json';

/**
 * The single configuration object lives under the app's namespace so it never
 * collides with sibling applications sharing the same bucket.
 */
const CONFIGURATION_OBJECT_KEY = 'date-solution/configuration.json';

/** Fallback used when the R2 object does not exist yet (all games active). */
const DEFAULT_CONFIGURATION: AppConfiguration = {
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

/** Loads the menu configuration from R2, creating the default when missing. */
export class ConfigurationService {
  constructor(private readonly storage: R2StorageService) {}

  /** Returns stored configuration, or the default (persisted) if absent. */
  async getOrCreate(): Promise<AppConfiguration> {
    if (!(await this.storage.objectExists(CONFIGURATION_OBJECT_KEY))) {
      await this.save(DEFAULT_CONFIGURATION);
      return DEFAULT_CONFIGURATION;
    }

    const raw = await this.storage.getObject(CONFIGURATION_OBJECT_KEY);
    return JSON.parse(raw) as AppConfiguration;
  }

  /**
   * Marks a game as completed (`done: true`) and persists the updated
   * configuration back to R2. Returns the new configuration.
   */
  async markDone(gameId: GameId): Promise<AppConfiguration> {
    const current = await this.getOrCreate();

    const updated: AppConfiguration = {
      games: current.games.map((game) =>
        game.id === gameId ? { ...game, done: true } : game,
      ),
    };

    await this.save(updated);
    return updated;
  }

  async save(configuration: AppConfiguration): Promise<void> {
    await this.storage.putObject(
      CONFIGURATION_OBJECT_KEY,
      JSON.stringify(configuration, null, 2),
      JSON_CONTENT_TYPE,
    );
  }
}