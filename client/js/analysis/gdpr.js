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
        reader.getEntries(async (files) => {
          const filePromises =
            files.map((file) => {
              const result = streamingDataPattern.exec(file.filename);
              if (!result) return Promise.resolve(null);

              const index = parseInt(result[1]);

              return new Promise((resolve) => {
                file.getData(
                  new zip.TextWriter('utf-8'),
                  (text) => resolve({index, data: JSON.parse(text)}),
                );
              });
            });

          /** @type {GDPRRecord[]} */
          const fileContents =
            await Promise
              .all(filePromises)
              .then((fileEntries) =>
                fileEntries
                  .filter((entry) => entry !== null)
                  .sort(
                    (entryA, entryB) => entryA.index < entryB.index ? -1 : 1,
                  )
                  .map((entry) => entry.data)
                  .reduce((dataA, dataB) => dataA.concat(dataB), []),
              );

          resolve(fileContents);
        });
      },
      (error) => reject(error),
    );
  });
}
