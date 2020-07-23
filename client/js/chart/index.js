import {SVG_NS} from '../util.js';

const RUN_SCALE_X = 30;
const RUN_SCALE_Y = 30;

/**
 * Creates an SVG chart inside of `container` with the given data.
 *
 * @param {HTMLElement} container The container element for this chart.
 * @param {Map<string, number[]>} histories The ranking history for each
 * track.
 * @param {Date[]} dates The date of each history entry.
 */
export function createChart(container, histories, dates) {
  const scrollContainer = document.createElement('div');
  scrollContainer.classList.add('chart-scroll-container');

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'chart');
  svg.setAttribute(
      'viewBox',
      `0 0 ${dates.length * RUN_SCALE_X} ${15 * RUN_SCALE_Y}`,
  );
  svg.append(createDefs());

  scrollContainer.append(svg);

  const seriesContainer = document.createElementNS(SVG_NS, 'g');
  seriesContainer.setAttribute('class', 'series-container');
  svg.append(seriesContainer);

  /** @type {SVGGElement[]} */
  const seriesElements = [];
  const historyEntries = [...histories];

  // to organize data into rows to speed up hit-testing
  const rows = [];

  for (let row = 0; row < dates.length; row++) {
    rows.push([]);
  }

  let index = 0;

  for (const [, history] of historyEntries) {
    // each track is given one of 24 colours, which are spaced 15 degrees apart
    // in hue
    const hue = index * 15 % 360;
    const color = `hsl(${hue},50%,50%)`;
    const series = createSeries(history, color);

    for (let row = 0; row < dates.length; row++) {
      rows[row].push(history[row] || null);
    }

    seriesContainer.append(series);
    seriesElements.push(series);
    index++;
  }

  const hoverState = {series: null, x: null, y: null};

  svg.addEventListener('mousemove', ({clientX, clientY}) => {
    const {hit, x, y} = hitTest(svg, rows, clientX, clientY);

    // don't recalculate the hit if we're in the same place
    // as the last hit
    if (hoverState.x === x && hoverState.y === y) return;

    if (hoverState.series && hoverState.series !== hit) {
      const seriesElement = seriesElements[hoverState.series];
      seriesElement.dispatchEvent(
          new CustomEvent('series-clear', {bubbles: true}),
      );
    }

    if (hit === null) {
      hoverState.series = null;
      hoverState.x = null;
      hoverState.y = null;
    } else {
      const seriesEntry = historyEntries[hit];
      const seriesElement = seriesElements[hit];
      seriesElement.dispatchEvent(
          new CustomEvent('series-hit', {
            detail: {
              x,
              y,
              key: seriesEntry[0],
            },
            bubbles: true,
          }),
      );

      hoverState.series = hit;
      hoverState.x = x;
      hoverState.y = y;
    }
  });

  const clearHover = () => {
    if (hoverState.series !== null) {
      const seriesElement = seriesElements[hoverState.series];
      seriesElement.dispatchEvent(
          new CustomEvent('series-clear', {bubbles: true}),
      );
    }

    hoverState.series = null;
    hoverState.x = null;
    hoverState.y = null;
  };

  svg.addEventListener('mouseleave', () => clearHover());
  scrollContainer.addEventListener('scroll', () => clearHover());

  const tooltip = createTooltip(container, svg, histories, dates);

  container.append(scrollContainer);
  container.append(tooltip);
}

/**
 * Tests whether the mouse is currently near a point on the chart.
 *
 * @param {SVGSVGElement} svg The SVG element for the chart.
 * @param {number[][]} rows The ranks of each series at each date.
 * @param {number} clientX The x position of the mouse.
 * @param {number} clientY The y position of the mouse.
 * @returns {{hit: number | null, x: number | null, y:number | null}} A hit
 * result.
 */
function hitTest(svg, rows, clientX, clientY) {
  // convert mouse coords to SVG coords
  const mousePos = svg.createSVGPoint();
  mousePos.x = clientX;
  mousePos.y = clientY;
  const chartPos = mousePos.matrixTransform(svg.getScreenCTM().inverse());

  // index in history
  const x = Math.round(chartPos.x / RUN_SCALE_X);
  // value in history
  const y = Math.round(chartPos.y / RUN_SCALE_Y);

  const hit = rows[x].findIndex((rank) => rank === y);

  if (hit < 0) return {hit: null, x: null, y: null};

  return {hit, x, y};
}

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

  // create marker for when the user mouses near a point
  const marker = document.createElementNS(SVG_NS, 'circle');
  marker.classList.add('series-marker');
  marker.setAttribute('r', '6');

  series.addEventListener('series-hit', (ev) => {
    const {x, y} = ev.detail;
    series.append(marker);
    series.classList.add('series-active');
    marker.setAttribute('cx', x * RUN_SCALE_X + 'px');
    marker.setAttribute('cy', y * RUN_SCALE_Y + 'px');
  });

  series.addEventListener('series-clear', () => {
    series.classList.remove('series-active');
    marker.remove();
  });

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
  const dimFilter = document.createElementNS(SVG_NS, 'filter');
  dimFilter.id = 'filter-dim';
  dimFilter.innerHTML = `
    <feComponentTransfer>
      <feFuncR type="linear" slope="0.5" />
      <feFuncG type="linear" slope="0.5" />
      <feFuncB type="linear" slope="0.5" />
    </feComponentTransfer>
  `;

  const highlightFilter = document.createElementNS(SVG_NS, 'filter');
  highlightFilter.id = 'filter-highlight';
  highlightFilter.innerHTML = `
    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
    <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
  `;

  defs.append(dimFilter, highlightFilter);

  return defs;
}

/**
 * Creates a tooltip that responds to the user pointing at things on the chart.
 *
 * @param {HTMLElement} container The element that contains the whole chart.
 * @param {SVGSVGElement} svg The SVG element for the chart.
 * @param {Map<string, number[]>} rankingHistories The ranking history for each
 * track.
 * @param {Date[]} rankingDates The dates corresponding to each entry in
 * rankingHistories.
 * @returns {HTMLDivElement} An element for the tooltip.
 */
function createTooltip(container, svg, rankingHistories, rankingDates) {
  const tooltip = document.createElement('div');
  tooltip.classList.add('chart-tooltip');

  const rank = document.createElement('span');
  rank.classList.add('chart-tooltip-rank');
  tooltip.append(rank);

  const title = document.createElement('span');
  title.classList.add('chart-tooltip-title');
  tooltip.append(title);

  const date = document.createElement('span');
  date.classList.add('chart-tooltip-date');
  tooltip.append(date);

  const format = new Intl.DateTimeFormat(
      undefined,
      {year: 'numeric', month: 'long', day: '2-digit'},
  );

  svg.addEventListener('series-hit', (ev) => {
    const {key, x, y} = ev.detail;
    const chartBounds = container.getBoundingClientRect();

    // convert SVG coords to HTML coords
    let pos = svg.createSVGPoint();
    pos.x = x * RUN_SCALE_X;
    pos.y = y * RUN_SCALE_Y;
    pos = pos.matrixTransform(svg.getScreenCTM());
    pos.x -= chartBounds.x;
    pos.y -= chartBounds.y;

    tooltip.classList.add('chart-tooltip-active');
    tooltip.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    title.innerText = key;
    rank.innerText = y;
    date.innerText = format.format(rankingDates[x]);
  });

  svg.addEventListener('series-clear', (ev) => {
    tooltip.classList.remove('chart-tooltip-active');
  });

  return tooltip;
}
