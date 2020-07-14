import {SVG_NS} from '../../util.js';

const RUN_SCALE_X = 30;
const RUN_SCALE_Y = 30;

/**
 * Creates an SVG chart inside of `el` with the given data.
 *
 * @param {HTMLElement} el The container element for this chart.
 * @param {Map<string, number[]>} rankingHistory The ranking history for each
 * track.
 * @param {Date[]} rankingDates The date of each history entry.
 */
export function createChart(el, rankingHistory, rankingDates) {
  const scrollContainer = document.createElement('div');
  scrollContainer.classList.add('chart-scroll-container');

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'chart');
  svg.setAttribute(
      'viewBox',
      `0 0 ${rankingDates.length * RUN_SCALE_X} ${15 * RUN_SCALE_Y}`,
  );
  svg.append(createDefs());

  scrollContainer.append(svg);

  const seriesContainer = document.createElementNS(SVG_NS, 'g');
  seriesContainer.setAttribute('class', 'series-container');
  svg.append(seriesContainer);

  /** @type {SVGGElement[]} */
  const seriesElements = [];
  const rankingHistoryEntries = [...rankingHistory];

  // to organize data into rows to speed up hit-testing
  const rows = [];

  for (let row = 0; row < rankingDates.length; row++) {
    rows.push([]);
  }

  rankingHistoryEntries.forEach(([, history], index) => {
    const hue = index * 15 % 360;
    const color = `hsl(${hue},50%,33%)`;
    const series = createSeries(color, history);

    for (let row = 0; row < rankingDates.length; row++) {
      rows[row].push(history[row] || null);
    }

    seriesContainer.append(series);
    seriesElements.push(series);
  });

  const hoverState = {series: null, x: null, y: null};

  svg.addEventListener('mousemove', ({clientX, clientY}) => {
    // convert mouse coords to SVG coords
    const mousePos = svg.createSVGPoint();
    mousePos.x = clientX;
    mousePos.y = clientY;
    const chartPos = mousePos.matrixTransform(svg.getScreenCTM().inverse());

    // index in history
    const x = Math.round(chartPos.x / RUN_SCALE_X);
    // value in history
    const y = Math.round(chartPos.y / RUN_SCALE_Y);

    // don't recalculate the hit if we're in the same place
    // as the last hit
    if (hoverState.x === x && hoverState.y === y) return;

    const hit = rows[x].findIndex((rank) => rank === y);

    if (hoverState.series && hoverState.series !== hit) {
      const seriesElement = seriesElements[hoverState.series];
      seriesElement.dispatchEvent(
          new CustomEvent('series-clear', {bubbles: true}),
      );
    }

    if (hit <0) {
      hoverState.series = null;
      hoverState.x = null;
      hoverState.y = null;
    } else {
      const seriesEntry = rankingHistoryEntries[hit];
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
  }, { passive: true, capture: true });

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

  const tooltip = createTooltip(el, svg, rankingDates);

  el.innerHTML = '';
  el.append(scrollContainer);
  el.append(tooltip);
}

/**
 * Creates a new series (set of lines on the chart for a specific song).
 *
 * @param {string} color The color of this series.
 * @param {number[]} history The historical positions of this track on the
 * leaderboard.
 * @returns {SVGGElement} A group containing the series.
 */
function createSeries(color, history) {
  const series = document.createElementNS(SVG_NS, 'g');
  series.setAttribute('class', 'series');
  series.style.setProperty('--run-color', color);
  let start = 0;
  let end = 0;
  while (end < history.length) {
    while (start < history.length && history[start] === null) {
      start++;
    }
    end = start + 1;
    while (end < history.length && history[end] !== null) {
      end++;
    }
    series.append(...createRun(history, start, end));
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
 * @returns {SVGElement[]} The elements that compose this run.
 */
function createRun(history, start, end) {
  const points = history
      .slice(start, end)
      .map((val, idx) => `${(idx + start) * RUN_SCALE_X},${val * RUN_SCALE_Y}`)
      .join(' ');

  // line that is displayed
  const line = document.createElementNS(SVG_NS, 'polyline');
  line.setAttribute('class', 'series-run');
  line.setAttribute('points', points);

  // secondary invisible line to make it easier to hit the line
  // with the mouse
  const touchTarget = document.createElementNS(SVG_NS, 'polyline');
  touchTarget.setAttribute('class', 'series-run-touch-target');
  touchTarget.setAttribute('points', points);

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

  return [startCap, line, touchTarget, endCap];
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
    <feComponentTransfer in="SourceGraphic" result="boost">
      <feFuncR type="linear" slope="3" />
      <feFuncG type="linear" slope="3" />
      <feFuncB type="linear" slope="3" />
    </feComponentTransfer>
    <feGaussianBlur in="boost" stdDeviation="2.5" result="glow"/>
    <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="boost"/>
    </feMerge>
  `;

  defs.append(highlightFilter);

  return defs;
}

/**
 * Creates a tooltip that responds to the user pointing at things on the chart.
 *
 * @param {HTMLElement} el The element that contains the whole chart.
 * @param {SVGSVGElement} svg The SVG element for the chart.
 * @param {Date[]} rankingDates The date of each history entry.
 * @returns {HTMLDivElement} An element for the tooltip.
 */
function createTooltip(el, svg, rankingDates) {
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
    const chartBounds = el.getBoundingClientRect();

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

  svg.addEventListener('series-clear', () => {
    tooltip.classList.remove('chart-tooltip-active');
  });

  return tooltip;
}
