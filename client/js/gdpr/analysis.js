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

  const readFile = (file) => {
    return new Promise((resolve) => {
      file.getData(
          new zip.TextWriter('utf-8'),
          (text) => resolve(JSON.parse(text)),
      );
    });
  };

  const parseEntryDate = (entry) => {
    const MS_PER_MINUTE = 60 * 1000;

    // dates are strings in JSON, convert to JS date
    const endTime = new Date(entry.endTime);

    // move according to UTC offset
    const endTimeMs = +endTime;
    const endTimeOffsetMs =
      endTime.getTimezoneOffset() * MS_PER_MINUTE;

    entry.endTime = new Date(endTimeMs - endTimeOffsetMs);
    return entry;
  };

  const readEntries = (reader, cb) => {
    reader.getEntries((files) => {
      /** @typedef {{ index: number; file: zip.Entry; }} EntryWithIndex */

      // get only entries named StreamingHistoryX.json and pair them with
      // their index so they can be sorted
      const entriesWithIndices = files.reduce(
          (
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
          .sort((a, b) => a.index < b.index ? -1 : 1)
          .map(({file}) => file);

      // create a Promise for each StreamingHistoryX.json to read & parse
      // its content
      const contentPromises = entriesWithIndices.map(readFile);

      // content of each file should be an array of GDPR records, once all
      // of the reading is done, concatenate the arrays and return
      Promise
          .all(contentPromises)
          .then((contentWithIndices) => {
            const collatedEntries = contentWithIndices
                .reduce((acc, data) => acc.concat(data), [])
                .map(parseEntryDate);

            cb(collatedEntries);
          });
    });
  };

  return new Promise((resolve, reject) => {
    zip.createReader(
        new zip.BlobReader(data),
        (reader) => readEntries(reader, resolve),
        (error) => reject(error),
    );
  });
}

/** @typedef {Map<string, Map<string, number>>} ArtistTrackTimeMap */

/**
 * @typedef {object} ArtistTrackTimeInterval
 * @property {Date} start
 * @property {ArtistTrackTimeMap} totals
 * */

/**
 * @typedef {object} CollatedGDPRRecords
 * @property {ArtistTrackTimeMap} totals
 * @property {ArtistTrackTimeInterval[]} intervals
 */

/**
 * Calculates aggregate per-track listening times from a list of GDPR records.
 *
 * @param {GDPRRecord[]} data The list of GDPR records to aggregate.
 * @returns {CollatedGDPRRecords}
 * An object with two properties: `totals` and `intervals`. `totals` is a map
 * whose keys are artists and whose values are maps from track names to duration
 * listened. `intervals` is an array of interval objects. Each interval object
 * has a `start` representing the start of that interval, and a `totals`,
 * representing the durations listened to each song during that interval.
 */
export function collateStreamingData(data) {
  const intervals = [];

  // a map of maps: key is artist name, value is a map where key
  // is track name and value is time listened to that song in total
  /** @type {ArtistTrackTimeMap} */
  const totals = new Map();

  // each interval is a map of maps: key is artist name, value is a map where
  // key is track name and value is time listened to that song during this
  // interval
  /** @type {ArtistTrackTimeMap} */
  let interval = new Map();

  let index = 0;
  let currentRecord = data[index];

  const INTERVAL_SIZE = 24 * 60 * 60 * 1000;

  // round down to the start of the day of the first record
  let intervalStart =
    +currentRecord.endTime - (+currentRecord.endTime % INTERVAL_SIZE);

  while (index < data.length) {
    while (currentRecord &&
        +currentRecord.endTime < intervalStart + INTERVAL_SIZE) {
      const {artistName, trackName, msPlayed} = currentRecord;

      // update time in interval
      let intervalArtistTracks = interval.get(artistName);

      if (!intervalArtistTracks) {
        intervalArtistTracks = new Map();
        interval.set(artistName, intervalArtistTracks);
      }

      let intervalTrackTime = intervalArtistTracks.get(trackName);

      if (!intervalTrackTime) {
        intervalTrackTime = 0;
      }

      intervalTrackTime += msPlayed;

      intervalArtistTracks.set(trackName, intervalTrackTime);

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

      index++;
      currentRecord = data[index];
    }

    intervals.push({start: new Date(intervalStart), totals: interval});
    intervalStart += INTERVAL_SIZE;
    interval = new Map();
  }

  return {intervals: intervals, totals};
}

/**
 * Gets an object containing the historical ranking of each song on a given
 * date, as well as a list of all of the dates in the range of the data.
 *
 * @param {CollatedGDPRRecords} data Collated GDPR records
 * @param {number} rollingWindowSize The size of the interval for calculating
 * rolling sums
 * @returns {{history: Map<string, number[]>, dates: Date[]}} Historical
 * rankings of each track.
 */
export function getStreamingHistory(data, rollingWindowSize = 28 * 2) {
  // calculate song rankings based on 28-day rolling sums
  const rankingHistory = new Map();
  const rankingDates = [];
  const rollingSums = new Map();

  for (let i = 0; i < data.intervals.length; i++) {
    rankingDates.push(data.intervals[i].start);

    const entering = data.intervals[i].totals;
    const exiting = i >= rollingWindowSize ?
    data.intervals[i - rollingWindowSize].totals :
       null;

    for (const [artist, tracks] of entering) {
      for (const [track, added] of tracks) {
        const key = `${track} - ${artist}`;
        const current = rollingSums.get(key) || 0;
        rollingSums.set(key, current + added);
      }
    }

    if (exiting) {
      for (const [artist, tracks] of exiting) {
        for (const [track, removed] of tracks) {
          const key = `${track} - ${artist}`;
          const current = rollingSums.get(key) || 0;
          rollingSums.set(key, current - removed);
        }
      }
    }

    // turn into array of entries
    [...rollingSums]
    // sort by play time in the last 28 days
        .sort((entryA, entryB) => {
          if (entryA[1] > entryB[1]) return -1;
          if (entryA[1] < entryB[1]) return 1;
          return 0;
        })
        // select top 15
        .slice(0, 15)
        // add indexes to track history
        .forEach((entry, index) => {
          const [key] = entry;

          let trackHistory = rankingHistory.get(key);

          if (!trackHistory) {
            trackHistory = [];
            rankingHistory.set(key, trackHistory);
          }

          while (trackHistory.length < i) {
            // if the track was missing from the chart, add null values
            trackHistory.push(null);
          }

          trackHistory.push(index + 1);
        });
  }

  return {history: rankingHistory, dates: rankingDates};
}
