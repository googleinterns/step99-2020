import {SVG_NS} from '../../util.js';

const RUN_SCALE_X = 30;
const RUN_SCALE_Y = 30;
const NUM_POSITIONS = 15;

export class GdprChart extends HTMLElement {
  constructor() {
    super();

    /** @type {Map<string, number[]>} */
    this.histories = new Map();

    /** @type {Date[]} */
    this.dates = [];

    /** @type {[string[], ...(Array<Array<number | null>>)]} */
    this.rows = [[]];

    this.hoverState = {seriesIndex: null, x: null, y: null};

    this.scrollContainer = document.createElement('div');
    this.scrollContainer.addEventListener('scroll', this.onScroll.bind(this));

    this.tooltip = this.createTooltip();

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/css/spotify-gdpr-chart.css';

    this.attachShadow({mode: 'open'});
    this.shadowRoot.append(stylesheet);
    this.shadowRoot.append(this.scrollContainer);
    this.shadowRoot.append(this.tooltip);
  }

  /**
   * Loads this GDPR chart with the given data.
   *
   * @param {Map<string, number[]>} histories The ranking history for each
   * track.
   * @param {Date[]} dates The date of each history entry.
   * @public
   */
  load(histories, dates) {
    this.histories = histories;
    this.dates = dates;

    // history + date info organized into rows for faster hit-testing
    // first row is a header row containing keys
    this.rows = [[...histories.keys()]];

    for (let row = 0; row < dates.length; row++) {
      this.rows.push([]);
    }

    for (const history of histories.values()) {
      for (let row = 0; row < dates.length; row++) {
        this.rows[row + 1].push(history[row] || null);
      }
    }

    this.svg = this.createChart();
    this.svg.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.svg.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    this.scrollContainer.innerHTML = '';
    this.scrollContainer.append(this.svg);
  }

  onMouseMove({clientX, clientY}) {
    // convert mouse coords to SVG coords
    const mousePos = this.svg.createSVGPoint();
    mousePos.x = clientX;
    mousePos.y = clientY;
    const chartPos = mousePos.matrixTransform(
        this.svg.getScreenCTM().inverse(),
    );

    // index in history
    const x = Math.round(chartPos.x / RUN_SCALE_X);
    // value in history
    const y = Math.round(chartPos.y / RUN_SCALE_Y + 0.5);

    // don't recalculate the hit if we're in the same place
    // as the last hit
    if (this.hoverState.x === x && this.hoverState.y === y) return;

    // subtract 1 b/c first row is key
    const hitIndex = this.rows[x].findIndex((rank) => rank === y) - 1;

    if (this.hoverState.seriesIndex && this.hoverState.seriesIndex !== hitIndex) {
      this.clearHover();
    }

    if (hitIndex >= 0) {
      const key = this.rows[x][0];

      const seriesEntry = historyEntries[hitIndex];
      const seriesElement = seriesElements[hitIndex];
      seriesElement.dispatchEvent(
          new CustomEvent('series-hit', {
            detail: {
              x,
              y,
              key,
            },
            bubbles: true,
          }),
      );

      this.hoverState.seriesIndex = hitIndex;
      this.hoverState.x = x;
      this.hoverState.y = y;
    }
  }

  onMouseLeave() {
    this.clearHover();
  }

  onScroll() {
    this.clearHover();
  }

  setHover(x, y, seriesIndex) {
    const key = this.rows[0][seriesIndex];
    const seriesEl = this.svg.querySelectorAll('.series')[seriesIndex];

    seriesEl.dispatchEvent(
        new CustomEvent('series-hit', {
          detail: {
            x,
            y,
            key,
          },
          bubbles: true,
        }),
    );

    this.hoverState.seriesIndex = seriesIndex;
    this.hoverState.x = x;
    this.hoverState.y = y;
  }

  clearHover() {
    const {seriesIndex} = this.hoverState;

    if (seriesIndex !== null) {
      const seriesEl = this.svg.querySelectorAll('.series')[seriesIndex];
      seriesEl.dispatchEvent(
          new CustomEvent('series-clear', {bubbles: true}),
      );
    }

    this.hoverState.seriesIndex = null;
    this.hoverState.x = null;
    this.hoverState.y = null;
  }

  createChart() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'chart');
    svg.setAttribute(
        'viewBox',
        `0 0 ${this.dates.length * RUN_SCALE_X} ${NUM_POSITIONS * RUN_SCALE_Y}`,
    );
    svg.append(this.createDefs());
    svg.append(this.createGrid(NUM_POSITIONS));

    const seriesContainer = document.createElementNS(SVG_NS, 'g');

    /** @type {SVGGElement[]} */
    const seriesElements = [];

    let index = 0;

    for (const history of this.histories.values()) {
      const hue = index * 15 % 360;
      const color = `hsl(${hue},50%,33%)`;
      const series = this.createSeries(history, color);

      seriesContainer.append(series);
      seriesElements.push(series);
      index++;
    }

    seriesContainer.setAttribute('class', 'series-container');
    svg.append(seriesContainer);

    return svg;
  }

  /**
   * Creates a new series (set of lines on the chart for a specific song).
   *
   * @param {number[]} history The historical positions of this track on the
   * leaderboard.
   * @param {string} color The color of this series.
   * @returns {SVGGElement} A group containing the series.
   * @private
   */
  createSeries(history, color) {
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
        series.append(this.createRun(history, start, end));
        start = end;
      }
    }

    if (end > start) {
      series.append(this.createRun(history, start, end));
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
      marker.setAttribute('cy', (y - 0.5) * RUN_SCALE_Y + 'px');
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
   * @private
   */
  createRun(history, start, end) {
    const runContainer = document.createElementNS(SVG_NS, 'g');

    const pointsStr = history
        .slice(start, end)
        .map((val, idx) =>
          (idx + start) * RUN_SCALE_X + ',' +
          (val - 0.5) * RUN_SCALE_Y)
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
    startCap.setAttribute('cy', (history[start] - 0.5) * RUN_SCALE_Y + 'px');
    endCap.setAttribute('r', '5');
    endCap.setAttribute('cx', (end - 1) * RUN_SCALE_X + 'px');
    endCap.setAttribute('cy', (history[end - 1] - 0.5) * RUN_SCALE_Y + 'px');

    runContainer.append(startCap, line, touchTarget, endCap);
    return runContainer;
  }

  /**
   * Creates SVG <defs> to use for things such as filters.
   *
   * @returns {SVGDefsElement} Defs
   * @private
   */
  createDefs() {
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
   * Creates gridlines that appear in the back of the chart.
   *
   * @param {number} positions The number of song positions showed by this chart
   * (i.e., 15 for top 15)
   * @returns {SVGGElement} An SVG group containing the grid.
   * @private
   */
  createGrid(positions) {
    const grid = document.createElementNS(SVG_NS, 'g');
    grid.classList.add('grid');

    for (let i = 0; i < this.dates.length; i++) {
      const verticalLine = document.createElementNS(SVG_NS, 'line');
      verticalLine.classList.add('date-line');

      verticalLine.setAttribute('x1', RUN_SCALE_X * i + 'px');
      verticalLine.setAttribute('x2', RUN_SCALE_X * i + 'px');
      verticalLine.setAttribute('y1', '0px');
      verticalLine.setAttribute('y2', RUN_SCALE_Y * positions + 'px');

      grid.append(verticalLine);
    }

    return grid;
  }

  /**
   * Creates a tooltip that responds to the user pointing at things on the
   * chart.
   *
   * @returns {HTMLDivElement} An element for the tooltip.
   * @private
   */
  createTooltip() {
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

    this.addEventListener('series-hit', (ev) => {
      const {key, x, y} = ev.detail;
      const chartBounds = this.getBoundingClientRect();

      // convert SVG coords to HTML coords
      let pos = this.svg.createSVGPoint();
      pos.x = x * RUN_SCALE_X;
      pos.y = y * RUN_SCALE_Y;
      pos = pos.matrixTransform(this.svg.getScreenCTM());
      pos.x -= chartBounds.x;
      pos.y -= chartBounds.y;

      tooltip.classList.add('chart-tooltip-active');
      tooltip.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

      title.innerText = key;
      rank.innerText = y;
      date.innerText = format.format(this.dates[x]);
    });

    this.addEventListener('series-clear', () => {
      tooltip.classList.remove('chart-tooltip-active');
    });

    return tooltip;
  }
}

customElements.define('gdpr-chart', GdprChart);
