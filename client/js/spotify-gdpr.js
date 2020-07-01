// @ts-check
import {getStreamingData, collateStreamingData} from './analysis/gdpr.js';

const {c3, zip} = window;

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
  console.log(records);

  const collatedRecords = collateStreamingData(records);
  console.log(collatedRecords);
});


let generation = 1;
const x = [new Date()];
const current = latest;
const indices = new Map(current.map((id, idx) => [id, idx]));
const indicesHistory = new Map(current.map((id, idx) => [id, [idx]]));

for (const changeSet of changes.reverse()) {
  for (const change of changeSet.reverse()) {
    switch (change.type) {
    case 'move': {
      const {from, to} = change;

      const a = current[from];
      const b = current[to];
      current[from] = b;
      current[to] = a;

      indices.set(a, to);
      indices.set(b, from);
      break;
    }
    case 'replace': {
      const {oldItem, newItem} = change;

      const idx = indices.get(newItem);
      current[idx] = oldItem;

      indices.set(newItem, null);
      indices.set(oldItem, idx);
      break;
    }
    }
  }

  for (const [id, index] of indices.entries()) {
    let indexHistory;
    if (indicesHistory.has(id)) {
      indexHistory = indicesHistory.get(id);
      indexHistory.push(index);
    } else {
      // this song wasn't in the record, backfill all of the indices
      indexHistory = [];

      for (let i = 0; i < generation; i++) {
        indexHistory.push(null);
      }

      indexHistory.push(index);
      indicesHistory.set(id, indexHistory);
    }
  }

  x.push(new Date(+x[x.length - 1] - 86400000));
  generation++;
}

const data =
  /** @type {Array<[string, ...number[]]>} */
  (Array
    .from(indicesHistory.entries())
    .map(([id, history]) => [id, ...history]));

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
    x: 'x',
    columns: [['x', ...x], ...data],
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
