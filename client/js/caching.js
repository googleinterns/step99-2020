/**
 * Helper function that either gets the data from the cache
 * or fetches from the respective APIs
 *
 * @param {string} url the url string to send
 * @returns {Promise<object>} the response object
 */
// this function is used in analysis.js
// eslint-disable-next-line no-unused-vars
async function getData(url) {
  const cacheVersion = 1;
  const cacheName = `analysisCache-${cacheVersion}`;
  let cachedData = await getCachedData(cacheName, url);

  if (cachedData) {
    return cachedData;
  }

  const cacheStorage = await caches.open(cacheName);
  await cacheStorage.add(url);
  cachedData = await getCachedData(cacheName, url);
  await deleteOldCaches(cacheName);

  return cachedData;
}

/**
 * Gets the data from the cache
 *
 * @param {Cache} cacheName the name of the cache to search
 * @param {string} url the url string, which is the key
 * @returns {Promise<object>} response object from the cache
 */
async function getCachedData(cacheName, url) {
  const cacheStorage = await caches.open(cacheName);
  const cachedResponse = await cacheStorage.match(url);

  if (!cachedResponse || !cachedResponse.ok) {
    return null;
  }

  return await cachedResponse.json();
}

/**
 * Deletes old caches so that the cache doesn't
 * take up too much space
 *
 * @param {Cache} currentCache the cache to traverse through
 */
async function deleteOldCaches(currentCache) {
  const keys = await caches.keys();

  for (const key of keys) {
    const correctCache = key.startsWith('analysisCache-');
    if (currentCache === key || !correctCache) {
      continue;
    }

    caches.delete(key);
  }
}
