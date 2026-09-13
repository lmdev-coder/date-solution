/** Thrown when the runtime environment is incomplete or unusable. */
export class ConfigError extends Error {
  readonly missingVariables: readonly string[];

  constructor(missingVariables: readonly string[]) {
    super(`Missing required environment variables: ${missingVariables.join(', ')}`);
    this.name = 'ConfigError';
    this.missingVariables = missingVariables;
  }
}