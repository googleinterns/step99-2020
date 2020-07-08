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
                    endTime =
                      new Date(+endTime - endTime.getTimezoneOffset() * 60000);
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

/** @typedef {Map<string, Map<string, number>>} ArtistTrackTimeMap */
/** @typedef {{
 * start: Date,
 * totals: ArtistTrackTimeMap
 * }} ArtistTrackTimeWindow */

/**
 * Calculates aggregates from a list of GDPR records.
 *
 * @param {GDPRRecord[]} data The list of GDPR records to aggregate.
 * @returns {{totals: ArtistTrackTimeMap, windows: ArtistTrackTimeWindow[]}} An
 * object with two properties: `totals` and `windows`. `totals` is a map whose
 * keys are artists and whose values are maps from track names to duration
 * listened. `windows` is an array of window objects. Each window object has a
 * `start` representing the start of that window, and a `totals`, representing
 * the durations listened to each song during that window.
 */
export function collateStreamingData(data) {
  let index = 0;
  let currentRecord = data[0];

  const windowSize = 86400000;
  // round down to the start of the day of the first record
  let windowStart =
    +currentRecord.endTime - (+currentRecord.endTime % windowSize);

  const windows = [];

  // a map of maps: key is artist name, value is a map where key
  // is track name and value is time listened to that song in total
  /** @type {ArtistTrackTimeMap} */
  const totals = new Map();

  // each window is a map of maps: key is artist name, value is a map where key
  // is track name and value is time listened to that song during this window
  /** @type {ArtistTrackTimeMap} */
  let window = new Map();

  while (index < data.length) {
    while (currentRecord && +currentRecord.endTime < windowStart + windowSize) {
      const {artistName, trackName, msPlayed} = currentRecord;

      // update time in window
      let windowArtistTracks = window.get(artistName);

      if (!windowArtistTracks) {
        windowArtistTracks = new Map();
        window.set(artistName, windowArtistTracks);
      }

      let windowTrackTime = windowArtistTracks.get(trackName);

      if (!windowTrackTime) {
        windowTrackTime = 0;
      }

      windowTrackTime += msPlayed;

      windowArtistTracks.set(trackName, windowTrackTime);

      // update total time
      let totalArtistTracks = totals.get(artistName);

      if (!totalArtistTracks) {
        totalArtistTracks = new Map();
        totals.set(artistName, totalArtistTracks);
      }

      let totalTrackTime = totalArtistTracks.get(trackName);

      if (!totalTrackTime) {
        totalTrackTime = 0;
      }

      totalTrackTime += msPlayed;

      totalArtistTracks.set(trackName, totalTrackTime);

      currentRecord = data[++index];
    }

    windows.push({start: new Date(windowStart), totals: window});
    windowStart += windowSize;
    window = new Map();
  }

  return {windows, totals};
}
