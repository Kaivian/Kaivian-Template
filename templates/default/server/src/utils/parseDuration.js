// server/src/utils/parseDuration.js
/**
 * Convert a duration string (e.g., "15m", "7d") into milliseconds.
 * @param {string} str - Duration string.
 * @returns {number} Milliseconds equivalent of the input.
 */
export function parseDuration(str) {
  const match = /^(\d+)([smhd])?$/.exec(str);
  if (!match) return 0;

  const value = Number(match[1]);
  const unit = match[2] || "ms";

  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return value;
  }
}
