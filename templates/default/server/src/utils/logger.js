// server/src/utils/logger.js
/**
 * Simple logger that prefixes messages with a timestamp.
 * @param {...any} output - Arguments to log.
 */
export const llog = (...output) => console.log(new Date().toISOString(), ...output);
export const linfo = (...output) => console.info(new Date().toISOString(), ...output);
export const lwarn = (...output) => console.warn(new Date().toISOString(), ...output);
export const lerror = (...output) => console.error(new Date().toISOString(), ...output);