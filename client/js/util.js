/**
 * Delays an async function.
 *
 * @param {number} ms The number of milliseconds to wait before resolving the
 * Promise.
 * @returns {Promise<void>} A Promise which resolves after a delay.
 */
export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
