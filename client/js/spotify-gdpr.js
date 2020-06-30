// @ts-check
/* global c3 */
/* global d3 */

const songs = [
  {id: 'song1'},
  {id: 'song2'},
  {id: 'song3'},
  {id: 'song4'},
  {id: 'song5'},
  {id: 'song6'},
  {id: 'song7'},
];

const latest = [
  'song3',
  'song2',
  'song5',
  'song7',
  'song1',
  'song10',
  'song11',
  'song12',
  'song13',
  'song14',
  'song15',
  'song16',
  'song17',
  'song18',
  'song19',
  'song20',
  'song21',
  'song22',
  'song23',
  'song24',
  'song25',
  'song26',
  'song27',
  'song28',
  'song29',
];

/**
 * @typedef {object} MoveChange
 * @property {'move'} type
 * @property {number} from
 * @property {number} to
 */

/**
 * @typedef {object} ReplaceChange
 * @property {'replace'} type
 * @property {string} oldItem
 * @property {string} newItem
 */

/**
 * @typedef {MoveChange | ReplaceChange} Change
 */

/**
 * @type {Change[][]}
 */
const changes = [
  [{type: 'move', from: 2, to: 4}],
  [{type: 'replace', oldItem: 'song4', newItem: 'song7'}],
  [],
  [],
  [],
];


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
      // this song wasn't in the record, backfill all of the nulls
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

const chart = c3.generate({
  bindto: '#chart',
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
    },
  },
  tooltip: {
    grouped: false,
  },
  legend: {
    show: false,
  },
  zoom: {
    enabled: true,
  },
});
