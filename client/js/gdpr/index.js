/**
 * @file This file currently works on mock data, just to make sure that the
 * chart works.
 */
// @ts-check
// eslint-disable-next-line max-len
/** @typedef {import('./analysis/gdpr.js').CollatedGDPRRecords} CollatedGDPRRecords */

import {
  collateStreamingData, getStreamingData, getStreamingHistory,
} from './analysis/gdpr.js';
import './chart/index.js';
import {GdprTable} from './table/index.js';

const {zip} = window;

zip.workerScriptsPath = '/js/zip/';
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

  const rankings = getStreamingHistory(collatedRecords);

  const chart = document.getElementById('gdpr-chart');
  chart.load(rankings.history, rankings.dates);

  const table = new GdprTable(
      document.getElementById('chart-container'),
      rankings.history,
      rankings.dates,
  );

  table.mount(document.getElementById('table-container'));
});
