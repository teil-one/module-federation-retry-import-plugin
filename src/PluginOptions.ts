export interface PluginOpitons {
  /**
   * Function returning the delay before the next retry
   * @param failedAttempts Number of already failed attempts, including the initial (starts with 1).
   * @returns Delay before the next attempt in milliseconds or null to stop retrying
   */
  retry: (failedAttempts: number) => number | null;
}
