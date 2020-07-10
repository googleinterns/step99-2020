// @ts-check
/* global c3 */
/**
 * @file This file currently works on mock data, just to make sure that the
 * chart works.
 */

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
 * Get the most recent ranking of top songs.
 *
 * @returns {string[]} most recent ordering of top songs (dummy data)
 */
function getLatestSongRanking() {
  return [
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
}

/**
 * Get the historical changes that have been made to the ranking of songs.
 *
 * @returns {Change[][]} An array of arrays where each sub-array is a list of
 * changes to the top songs list that happened on a given day
 */
function getChangeHistory() {
  return [
    [{type: 'move', from: 2, to: 4}],
    [{type: 'replace', oldItem: 'song4', newItem: 'song7'}],
    [{type: 'move', from: 3, to: 4}],
    [{type: 'move', from: 5, to: 4}],
    [{type: 'move', from: 3, to: 4}],
    [],
    [],
    [{type: 'replace', oldItem: 'song30', newItem: 'song23'}],
    [{type: 'move', from: 6, to: 5}],
    [{type: 'move', from: 7, to: 6}],
    [{type: 'move', from: 9, to: 10}],
    [{type: 'move', from: 20, to: 21}],
    [],
    [{type: 'move', from: 20, to: 21}],
    [{type: 'move', from: 12, to: 13}],
    [],
    [],
    [],
  ];
}

const MS_PER_DAY = 24 * 60 * 60 * 100;

/**
 * Populates `chart` with historical track data derived from `latest` and
 * `changes`.
 *
 * @param {string[]} latest The most recent ranking of tracks.
 * @param {Change[][]} changes The list of historical changes to the track
 * ranking.
 * @param {c3.ChartAPI} chart The chart to populate.
 */
function populateChart(latest, changes, chart) {
// number of days we have backtracked
  let generation = 1;
  const xAxis = [new Date()];

  // current position of each song (list of songs in order)
  const current = latest;
  // current position of each song (map from song id to current index)
  const indices = new Map(current.map((id, idx) => [id, idx]));
  // historical position of each song (map from song id to array of historical
  // indices)
  const indicesHistory = new Map(current.map((id, idx) => [id, [idx]]));

  // for each changeset (set of changes that occurred on a day) apply the
  // opposite change so that we can reconstruct the ordering of the top songs
  // list on that day
  for (const changeSet of changes.reverse()) {
    for (const change of changeSet.reverse()) {
      switch (change.type) {
        case 'move': {
          const {from, to} = change;

          const trackFrom = current[from];
          const trackTo = current[to];
          current[from] = trackTo;
          current[to] = trackFrom;

          indices.set(trackFrom, to);
          indices.set(trackTo, from);
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

    // take the current ordering of the songs and store it in the historical
    // index list
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

    xAxis.push(new Date(+xAxis[xAxis.length - 1] - MS_PER_DAY));
    generation++;
  }

  // format of a chart series in c3 is ['name of series', point1, point2, ...]
  const chartData =
    /** @type {Array<[string, ...number[]]>} */
    (Array
        .from(indicesHistory.entries())
        .map(([id, history]) => [id, ...history]));

  chart.load({
    columns: [['date', ...xAxis], ...chartData],
  });
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

const rankingLatest = getLatestSongRanking();
const rankingHistory = getChangeHistory();
populateChart(rankingLatest, rankingHistory, chart);
