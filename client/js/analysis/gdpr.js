// @ts-check
/**
 * @typedef {object} GDPRRecord
 * @property {string} endTime Date and time of when the stream ended in UTC
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
                  const content = contentWithIndices
                      .map((entry) => entry.data)
                      .reduce((dataA, dataB) => dataA.concat(dataB), []);
                  resolve(content);
                });
          });
        },
        (error) => reject(error),
    );
  });
}
