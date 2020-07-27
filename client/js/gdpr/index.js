/**
 * @file This file currently works on mock data, just to make sure that the
 * chart works.
 */
// @ts-check
// eslint-disable-next-line max-len
/** @typedef {import('./analysis.js').CollatedGDPRRecords} CollatedGDPRRecords */

import {
  collateStreamingData, getStreamingData, getStreamingHistory,
} from './analysis.js';
import {showPicker} from '../file-upload/gdrive-picker.js';
import './chart.js';
import './table.js';

const {zip} = window;

zip.workerScriptsPath = '/js/zip/';

/** @type {import('./chart.js').GdprChart} */
const chart = document.getElementById('gdpr-chart');

/** @type {import('./table.js').GdprTable} */
const table = document.getElementById('gdpr-table');

const btnUploadFile =
  /** @type {HTMLButtonElement} */
  (document.getElementById('btn-data-upload'));

btnUploadFile.addEventListener('click', async () => {
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

  chart.load(rankings.history, rankings.dates);
  table.load(rankings.history, rankings.dates);
});

const btnPickFile =
  /** @type {HTMLButtonElement} */
  (document.getElementById('btn-data-pick'));

btnPickFile.addEventListener('click', async () => {
  const fileUpload = await showPicker();

  const records = await getStreamingData(fileUpload);

  const collatedRecords = collateStreamingData(records);

  const rankings = getStreamingHistory(collatedRecords);

  chart.load(rankings.history, rankings.dates);
  table.load(rankings.history, rankings.dates);
});
