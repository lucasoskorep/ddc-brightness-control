export const ROLE = 'ddc-brightness';
export const SCHEMA_ID = 'org.gnome.shell.extensions.ddcbrightness';

/** VCP feature code used when none is configured (10 = brightness). */
export const DEFAULT_VCP_CODE = '10';

/**
 * Scales the mandatory I2C delays ddcutil inserts around DDC/CI transactions.
 * Lower = faster but less tolerant of flaky monitors. Tune per hardware.
 */
export const DDCUTIL_SLEEP_MULTIPLIER = '0.5';

/** Prefix for all console logging from this extension. */
export const LOG_PREFIX = '[ddc-brightness]';
