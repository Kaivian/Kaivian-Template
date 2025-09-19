// server/src/utils/logger.js
/**
 * Simple logger that prefixes messages with a timestamp.
 * @param {...any} output - Arguments to log.
 */
export const log = (...output) => console.log(new Date().toISOString(), ...output);
export const info = (...output) => console.info(new Date().toISOString(), ...output);
export const warn = (...output) => console.warn(new Date().toISOString(), ...output);
export const err = (...output) => console.error(new Date().toISOString(), ...output);