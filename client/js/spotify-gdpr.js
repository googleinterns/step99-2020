/**
 * @file This file currently works on mock data, just to make sure that the
 * chart works.
 */
// @ts-check
// eslint-disable-next-line max-len
/** @typedef {import('./analysis/gdpr.js').CollatedGDPRRecords} CollatedGDPRRecords */

import {sleep} from './util.js';
import {getStreamingData, collateStreamingData} from './analysis/gdpr.js';

const {c3, zip} = window;

zip.workerScriptsPath = '/js/zip/';

/**
 * Populates `chart` with historical track data derived from `collatedRecords`.
 *
 * @param {CollatedGDPRRecords} collatedRecords Information about the amount of
 * time each track has been listened to on each day.
 * @param {c3.ChartAPI} chart The chart to populate.
 */
async function populateChart(collatedRecords, chart) {
  const ROLLING_WINDOW_SIZE = 28;

  // calculate song rankings based on 28-day rolling sums
  const rankingHistory = new Map();
  const rankingDates = [];
  const rollingSums = new Map();

  for (let i = 0; i < collatedRecords.intervals.length; i++) {
    rankingDates.push(collatedRecords.intervals[i].start);

    const entering = collatedRecords.intervals[i].totals;
    const exiting = i >= ROLLING_WINDOW_SIZE ?
      collatedRecords.intervals[i - ROLLING_WINDOW_SIZE].totals :
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

    // number of songs that can be on the chart at a time
    const CHART_SIZE = 15;

    // turn into array of entries
    [...rollingSums]
        // sort by play time in the last 28 days
        .sort((entryA, entryB) => {
          if (entryA[1] > entryB[1]) return -1;
          if (entryA[1] < entryB[1]) return 1;
          return 0;
        })
        // select top 15
        .slice(0, CHART_SIZE)
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

          trackHistory.push(index);
        });
  }

  // format of a chart series in c3 is ['name of series', point1, point2, ...]
  const chartData = Array
      .from(rankingHistory.entries())
      .map(([id, history]) => [id, ...history]);

  // load data in segments to avoid hanging the browser
  for (let i = 0; i < chartData.length; i++) {
    const chartDataSegment = chartData.slice(i, i + 15);
    await new Promise((resolve) => chart.load({
      columns: [
        ['date', ...rankingDates],
        ...chartDataSegment,
      ],
      done: resolve,
    }));

    // yield control to browser so it doesn't hang
    // browser will perform any pending updates (clicks, animations, etc)
    // then return to this loop ASAP
    await sleep(0);
  }
}


const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const chart = c3.generate({
  bindto: '#chart',
  size: {
    height: 700,
  },
  data: {
    x: 'date',
    columns: [],
    onmouseover: (d) => chart.focus(d.id),
    onmouseout: () => chart.focus(),
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: {
        format: '%d/%m/%Y',
        outer: false,
        culling: {
          max: 4,
        },
      },
    },
    y: {
      show: false,
      inverted: true,
    },
  },
  tooltip: {
    grouped: false,
    contents: (d) =>
      `<span class='c3-tooltip'>
        <span class='c3-tooltip-rank'>#${d[0].value + 1}</span>
        <span class='c3-tooltip-thumbnail'>TODO</span>
        <span class='c3-tooltip-track-name'>${d[0].id}</span>
        <span class='c3-tooltip-artist-name'>unknown artist</span>
        <span class='c3-tooltip-date'>${dateFormat.format(d[0].x)}</span>
      </span>`,
  },
  legend: {
    show: false,
  },
  zoom: {
    enabled: true,
  },
});


const btnUpload =
  /** @type {HTMLButtonElement} */
  (document.getElementById('btn-data-upload'));

btnUpload.addEventListener('click', async () => {
  const inputUpload =
      /** @type {HTMLInputElement} */
      (document.getElementById('input-data-upload'));

  inputUpload.click();

  await new Promise(
      (resolve) => inputUpload.addEventListener(
          'change',
          resolve,
          {once: true},
      ),
  );

  if (!inputUpload.files) return;

  const fileUpload = inputUpload.files.item(0);
  if (!fileUpload) return;

  const records = await getStreamingData(fileUpload);

  const collatedRecords = collateStreamingData(records);

  populateChart(collatedRecords, chart);
});
