import {SVG_NS} from '../util.js';

const RUN_SCALE_X = 30;
const RUN_SCALE_Y = 30;

/**
 * Creates an SVG chart inside of `el` with the given data.
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
  svg.setAttribute('viewBox', `0 0 ${dates.length * RUN_SCALE_X} ${15 * RUN_SCALE_Y}`);
  svg.append(createDefs());

  scrollContainer.append(svg);

  const seriesContainer = document.createElementNS(SVG_NS, 'g');
  seriesContainer.setAttribute('class', 'series-container');
  svg.append(seriesContainer);

  /** @type {SVGGElement[]} */
  const seriesElements = [];
  const historyEntries = [...histories];

  historyEntries.forEach(([, history], index) => {
    const hue = index * 15 % 360;
    const color = `hsl(${hue},50%,50%)`;
    const series = createSeries(history, color);
    seriesContainer.append(series);
    seriesElements.push(series);
  });

  let activeSeries = null;
  let activeX = null;
  let activeY = null;

  // do some hit-testing
  svg.addEventListener('mousemove', (ev) => {
    // convert mouse coords to SVG coords
    const mousePos = svg.createSVGPoint();
    mousePos.x = ev.clientX;
    mousePos.y = ev.clientY;
    const chartPos = mousePos.matrixTransform(svg.getScreenCTM().inverse());

    // index in history
    const x = Math.round(chartPos.x / RUN_SCALE_X);
    // value in history
    const y = Math.round(chartPos.y / RUN_SCALE_Y);

    // don't recalculate the hit if we're in the same place
    // as the last hit
    if (activeX === x && activeY === y) return;

    let hit = null;

    historyEntries.forEach(([, history], index) => {
      // include only series where there is a data point for this x value
      if (x >= history.length || history[x] === null) return;

      // get distance from mouse y to series y for each series
      const dist = history[x] - y;

      // filter items where distance is too great; there should only be one
      // remaining (impossible to be less than 0.4 away from both 1 and 2, for
      // example)
      if (Math.abs(dist) > 0.4) return;

      hit = index;
    });

    if (activeSeries && activeSeries !== hit) {
      const seriesElement = seriesElements[activeSeries];
      seriesElement.dispatchEvent(
          new CustomEvent('series-clear', {bubbles: true}),
      );
    }

    if (hit === null) {
      activeSeries = null;
      activeX = null;
      activeY = null;
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

      activeSeries = hit;
      activeX = x;
      activeY = y;
    }
  });

  svg.addEventListener('mouseleave', () => {
    if (activeSeries) {
      const seriesElement = seriesElements[activeSeries];
      seriesElement.dispatchEvent(
          new CustomEvent('series-clear', {bubbles: true}),
      );
    }

    activeX = null;
    activeY = null;
  });

  const tooltip = createTooltip(container, svg, histories, dates);

  container.append(scrollContainer);
  container.append(tooltip);
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

  while (end < history.length) {
    // go until we find a non-null point
    while (start < history.length && history[start] === null) {
      start++;
    }
    end = start + 1;

    // go until we find a null point
    while (end < history.length && history[end] !== null) {
      end++;
    }

    // all of the points between start and end are non-null, create run
    series.append(createRun(history, start, end));
    start = end;
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

  const pointsStr = history
      .slice(start, end)
      .map((val, idx) => `${(idx + start) * RUN_SCALE_X},${val * RUN_SCALE_Y}`)
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
  startCap.setAttribute('cx', start * RUN_SCALE_X + 'px');
  startCap.setAttribute('cy', history[start] * RUN_SCALE_Y + 'px');
  endCap.setAttribute('r', '5');
  endCap.setAttribute('cx', (end - 1) * RUN_SCALE_X + 'px');
  endCap.setAttribute('cy', history[end - 1] * RUN_SCALE_Y + 'px');

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
    rank.innerText = y + 1;
    date.innerText = format.format(rankingDates[x]);
  });

  svg.addEventListener('series-clear', (ev) => {
    tooltip.classList.remove('chart-tooltip-active');
  });

  return tooltip;
}
