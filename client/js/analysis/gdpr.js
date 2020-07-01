// @ts-check
/**
 * @typedef {object} RawGDPRRecord
 * @property {string} endTime Date and time of when the stream ended in UTC
 * format.
 * @property {string} artistName Name of "creator" for each stream (e.g. the
 * artist name if a music track).
 * @property {string} trackName Name of items listened to or watched (e.g. title
 * of music track or name of video).
 * @property {number} msPlayed How many mili-seconds the
 * track was listened.
 */

/**
 * @typedef {object} GDPRRecord
 * @property {Date} endTime Date and time of when the stream ended in UTC
 * format.
 * @property {string} artistName Name of "creator" for each stream (e.g. the
 * artist name if a music track).
 * @property {string} trackName Name of items listened to or watched (e.g. title
 * of music track or name of video).
 * @property {number} msPlayed How many mili-seconds the
 * track was listened.
 */

// global variables are not available in ES modules
const {zip} = window;

/**
 * Gets the value associated with `key` from `map`. If `key` is not in `map`,
 * then `fn` will be called and the value it returns will be placed in the map
 * and returned from this function.
 *
 * @template K
 * @template V
 * @param {Map<K, V>} map The map to retrieve a value from.
 * @param {K} key The key associated with the value to retrieve.
 * @param {(key: K) => V} fn Generates a default value if the key was not in the
 * map.
 * @returns {V} The value associated with `key` in `map`, or the return value of
 * `fn` if there was no such value.
 */
function getOrDefault(map, key, fn) {
  let value = map.get(key);
  if (value === undefined) {
    value = fn(key);
    map.set(key, value);
  }
  return value;
}

/**
 * Updates the value associated with `key` in `map`. If `key` is not in `map`,
 * then `fn` will be called with `undefined` as the value.
 *
 * @template K
 * @template V
 * @param {Map<K, V>} map The map to update.
 * @param {K} key The key associated with the value to update.
 * @param {(value: V | undefined, key: K) => V} fn Returns the new value to be
 * associated with `key` in `map`.
 * @returns {Map<K, V>} `map`
 */
function update(map, key, fn) {
  const value = map.get(key);
  map.set(key, fn(value, key));
  return map;
}

/**
 * Takes a blob containing zipped GDPR data and outputs a list of GDPR streaming
 * records.
 *
 * @param {Blob} data The zipped GDPR data.
 * @returns {Promise<GDPRRecord[]>} A list of GDPR streaming records.
 */
export async function getStreamingData(data) {
  const streamingDataPattern = /StreamingHistory(\d+)\.json$/i;

  return new Promise((resolve, reject) => {
    zip.createReader(
      new zip.BlobReader(data),
      (reader) => {
        reader.getEntries((files) => {
          /** @typedef {{ index: number; file: zip.Entry; }} EntryWithIndex */

          // get only entries named StreamingHistoryX.json and pair them with
          // their index so they can be sorted
          const entriesWithIndices =
            files
              .reduce((
                /** @type {EntryWithIndex[]} */ arr,
                /** @type {zip.Entry} */ file,
              ) => {
                const match = streamingDataPattern.exec(file.filename);

                if (match) {
                  const index = parseInt(match[1]);
                  arr.push({index, file});
                }

                return arr;
              }, [])
              .sort((a, b) => a.index < b.index ? -1 : 1);

          // create a Promise for each StreamingHistoryX.json to read & parse
          // its content
          const contentPromises =
            entriesWithIndices.map(({index, file}) => {
              return new Promise((resolve) => {
                file.getData(
                  new zip.TextWriter('utf-8'),
                  (text) => resolve({index, data: JSON.parse(text)}),
                );
              });
            });

          // content of each file should be an array of GDPR records, once all
          // of the reading is done, concatenate the arrays and return
          Promise
            .all(contentPromises)
            .then((contentWithIndices) => {
              resolve(
                contentWithIndices
                  .map((entry) => entry.data)
                  .reduce((dataA, dataB) => dataA.concat(dataB), [])
                  .map((entry) => {
                    // dates are strings in JSON, convert to JS date
                    let endTime = new Date(entry.endTime);
                    // move according to UTC offset
                    endTime = new Date(+endTime - endTime.getTimezoneOffset() * 60000);
                    entry.endTime = endTime;
                    return entry;
                  }),
              );
            });
        });
      },
      (error) => reject(error),
    );
  });
}

/**
 *
 * @param {GDPRRecord[]} data
 */
export function collateStreamingData(data) {
  let index = 0;
  let currentRecord = data[0];

  const windowSize = 86400000;
  const windowStart = currentRecord.endTime;
  const windows = [];

  // each window is a map of maps: key is artist name, value is a map where key
  // is track name and value is time listened to that song during this window
  let currentWindow = new Map();

  while (index < data.length) {
    while (currentRecord && +currentRecord.endTime < +windowStart + windowSize) {
      const {artistName, trackName} = currentRecord;

      let value = map.get(key);
  if (value === undefined) {
    value = fn(key);
    map.set(key, value);
  }
  return value;
      update(artistMap, trackName, (time = 0) => time + currentRecord.msPlayed);

      let trackMap;
      if (artistMap.has(trackName)) {
        trackMap = artistMap.get(trackName);
      } else {
        trackMap = new Map();
        artistMap.set(trackName, trackMap);
      }

      if (trackMap.has()) {
        currentRecord = data[++index];
      }
    }

    windowStart.setTime(windowStart.getTime() + windowSize);
    windows.push(currentWindow);
    currentWindow = new Map();
    console.log(`index: ${index}`);
  }

  return windows;
}
