import {SVG_NS} from '../util.js';

/**
 * Creates an SVG chart inside of `container` with the given data.
 *
 * @param {HTMLElement} container The container element for this chart.
 * @param {Map<string, number[]>} histories The ranking history for each
 * track.
 * @param {Date[]} dates The date of each history entry.
 */
export function createChart(container, histories, dates) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'chart');
  svg.append(createDefs());

  const seriesContainer = document.createElementNS(SVG_NS, 'g');
  seriesContainer.setAttribute('class', 'series-container');
  svg.append(seriesContainer);

  let index = 0;
  const colors = ['blue', 'red', 'green', 'purple', 'orange'];

  // get only the first 7 tracks for now
  const MAX_TRACKS_INCLUDED = 7;
  for (const history of [...histories.values()].slice(0, MAX_TRACKS_INCLUDED)) {
    const color = colors[index % colors.length];
    const series = createSeries(history, color);
    seriesContainer.append(series);
    index++;
  }

  container.append(svg);
}

const RUN_SCALE_X = 30;
const RUN_SCALE_Y = 30;

/**
 * Creates a new series (set of lines on the chart for a specific song).
 *
 * @param {number[]} history The historical positions of this track on the
 * leaderboard.
 * @param {string} color The color of this series.
 * @returns {SVGGElement} A group containing the series.
 */
function createSeries(history, color) {
  const series = document.createElementNS(SVG_NS, 'g');
  series.setAttribute('class', 'series');
  series.style.setProperty('--run-color', color);

  let start = 0;
  let end = 0;

  // find segments of history that don't contain null and create a 'run' for
  // each one
  while (end < history.length) {
    // go until we find a non-null point, which is the beginning of a run
    if (history[start] === null) {
      start++;
      end = start;
      continue;
    }

    // go until we find a null point, which is the end of a run
    if (history[end] !== null) {
      end++;
      continue;
    }

    if (end > start) {
      // all of the points between start and end are non-null, create run
      series.append(createRun(history, start, end));
      start = end;
    }
  }

  if (end > start) {
    series.append(createRun(history, start, end));
  }

  return series;
}

/**
 * Creates a new run (continuous group of points within a series).
 *
 * @param {number[]} history The historical positions of this track on the
 * leaderboard.
 * @param {number} start The index of the first entry in this run.
 * @param {number} end The index of the last entry in this run.
 * @returns {SVGGElement} The elements that compose this run.
 */
function createRun(history, start, end) {
  const runContainer = document.createElementNS(SVG_NS, 'g');

  const points = history
      .slice(start, end)
      .map((val, idx) => ({
        x: (idx + start) * RUN_SCALE_X,
        y: val * RUN_SCALE_Y,
      }));

  const pointsStr = points
      .map(({x, y}) => `${x}, ${y}`)
      .join(' ');

  // line that is displayed
  const line = document.createElementNS(SVG_NS, 'polyline');
  line.setAttribute('class', 'series-run');
  line.setAttribute('points', pointsStr);

  // secondary (wider) invisible line to make it easier to hit the line with the
  // mouse
  const touchTarget = document.createElementNS(SVG_NS, 'polyline');
  touchTarget.setAttribute('class', 'series-run-touch-target');
  touchTarget.setAttribute('points', pointsStr);

  const startCap = document.createElementNS(SVG_NS, 'circle');
  const endCap = document.createElementNS(SVG_NS, 'circle');

  startCap.setAttribute('class', 'series-run-cap');
  endCap.setAttribute('class', 'series-run-cap');

  startCap.setAttribute('r', '5');
  startCap.setAttribute('cx', points[0].x + 'px');
  startCap.setAttribute('cy', points[0].y + 'px');
  endCap.setAttribute('r', '5');
  endCap.setAttribute('cx', points[points.length - 1].x + 'px');
  endCap.setAttribute('cy', points[points.length - 1].y + 'px');

  runContainer.append(startCap, line, touchTarget, endCap);
  return runContainer;
}

/**
 * Creates SVG <defs> to use for things such as filters.
 *
 * @returns {SVGDefsElement} Defs
 */
function createDefs() {
  const defs = document.createElementNS(SVG_NS, 'defs');

  // need to create SVG brightness filter b/c CSS filters
  // don't work on SVG elements in Chrome
  const highlightFilter = document.createElementNS(SVG_NS, 'filter');
  highlightFilter.id = 'filter-highlight';
  highlightFilter.innerHTML = `
    <feComponentTransfer>
      <feFuncR type="linear" slope="0.5" />
      <feFuncG type="linear" slope="0.5" />
      <feFuncB type="linear" slope="0.5" />
    </feComponentTransfer>
  `;

  defs.append(highlightFilter);

  return defs;
}
