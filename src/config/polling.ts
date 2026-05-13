/**
 * Polling configuration for real-time status updates
 * These values can be easily adjusted to tune polling behavior
 */

export const POLLING_CONFIG = {
  /** Interval between status checks in milliseconds */
  POLL_INTERVAL_MS: 4000,

  /** Maximum duration to poll for in milliseconds (30 minutes) */
  MAX_POLL_DURATION_MS: 30 * 60 * 1000,

  /** Calculate max retries based on duration and interval */
  get MAX_RETRIES() {
    return Math.ceil(this.MAX_POLL_DURATION_MS / this.POLL_INTERVAL_MS)
  },
}

export type PollingConfig = typeof POLLING_CONFIG
