import {SVG_NS} from '../util.js';

const RUN_SCALE_X = 30;
const RUN_SCALE_Y = 30;
const NUM_POSITIONS = 15;

export class GdprChart extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    /**
     * Horizontal zoom. There is no vertical scrolling.
     */
    this.zoom = 1;

    /** @type {Map<string, number[]>} */
    this.histories = new Map();

    /** @type {Date[]} */
    this.dates = [];

    /** @type {[string[], ...(Array<Array<number | null>>)]} */
    this.rows = [[]];

    this.hoverState = {seriesIndex: null, x: null, y: null};

    this.mainContainer = document.createElement('div');
    this.mainContainer.id = 'main-container';

    this.scrollContainer = document.createElement('div');
    this.scrollContainer.id = 'scroll-container';
    this.scrollContainer
        .addEventListener('wheel', this.onMouseWheel.bind(this));

    this.tooltip = this.createTooltip();

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/css/spotify-gdpr-chart.css';

    this.mainContainer.append(this.scrollContainer);
    this.mainContainer.append(this.tooltip);

    this.shadowRoot.append(stylesheet, this.mainContainer);
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
        // +1 b/c first row is header row
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
    const x = Math.round(chartPos.x / RUN_SCALE_X / this.zoom);
    // value in history
    const y = Math.round(chartPos.y / RUN_SCALE_Y);

    // don't recalculate the hit if we're in the same place
    // as the last hit
    if (this.hoverState.x === x && this.hoverState.y === y) return;

    // add 1 b/c first row is key
    const hitIndex = this.rows[x + 1].findIndex((rank) => rank === y);

    if (
      this.hoverState.seriesIndex !== null &&
      this.hoverState.seriesIndex !== hitIndex
    ) {
      this.clearHover();
    }

    if (hitIndex >= 0) {
      this.setHover(x, y, hitIndex);
    }
  }

  onMouseLeave() {
    this.clearHover();
  }

  onMouseWheel(ev) {
    if (ev.ctrlKey) {
      const {min, max, pow} = Math;
      const scale = pow(10, ev.deltaY / 100);

      const finalZoom = min(max(this.zoom * scale, 0.1), 3);
      const finalScale = finalZoom / this.zoom;

      // point under user's cursor should not move on scroll
      const offset =
        (ev.clientX - this.scrollContainer.clientLeft) * (finalScale - 1);

      this.zoom = finalZoom;
      this.updateChart();

      // scroll so that the center of the chart stays in view
      this.scrollContainer
          .scrollTo(this.scrollContainer.scrollLeft * finalScale + offset, 0);

      ev.preventDefault();
    } else {
      this.clearHover();
    }
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
          composed: true,
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
          new CustomEvent('series-clear', {bubbles: true, composed: true}),
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
        '0 ' +
        // shift down so that lines are vertically centered
        RUN_SCALE_Y * 0.5 + ' ' +
        this.dates.length * RUN_SCALE_X * this.zoom + ' ' +
        NUM_POSITIONS * RUN_SCALE_Y,
    );
    svg.append(this.createDefs());
    svg.append(this.createGrid());

    const seriesContainer = document.createElementNS(SVG_NS, 'g');

    let index = 0;

    for (const history of this.histories.values()) {
      // each track is given one of 24 colours, which are spaced 15 degrees
      // apart in hue
      const hue = index * 15 % 360;
      const color = `hsl(${hue},50%,33%)`;
      const series = this.createSeries(history, color);

      seriesContainer.append(series);
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
    series.append(marker);

    series.addEventListener('series-hit', (ev) => {
      const {x, y} = ev.detail;
      series.classList.add('series-active');
      marker.setAttribute('data-marker-x', x.toString());
      marker.setAttribute('data-marker-y', y.toString());
      marker.setAttribute('cx', x * RUN_SCALE_X * this.zoom + 'px');
      marker.setAttribute('cy', y * RUN_SCALE_Y + 'px');
    });

    series.addEventListener('series-clear', () => {
      series.classList.remove('series-active');
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
    runContainer.setAttribute('class', 'series-run');
    runContainer.setAttribute('data-run-start', start.toString());
    runContainer.setAttribute('data-run-end', end.toString());

    const points = history
        .slice(start, end)
        .map((val, idx) => ({
          x: (idx + start) * RUN_SCALE_X,
          y: val * RUN_SCALE_Y,
        }));

    const pointsStr = points
        .map(({x, y}) => `${x * this.zoom}, ${y}`)
        .join(' ');

    // line that is displayed
    const line = document.createElementNS(SVG_NS, 'polyline');
    line.setAttribute('class', 'series-run-line');
    line.setAttribute('points', pointsStr);

    const startCap = document.createElementNS(SVG_NS, 'circle');
    const endCap = document.createElementNS(SVG_NS, 'circle');

    startCap.setAttribute('class', 'series-run-cap');
    endCap.setAttribute('class', 'series-run-cap');

    startCap.setAttribute('r', '5');
    startCap.setAttribute('cx', points[0].x * this.zoom + 'px');
    startCap.setAttribute('cy', points[0].y + 'px');
    endCap.setAttribute('r', '5');
    endCap.setAttribute('cx', points[points.length - 1].x * this.zoom + 'px');
    endCap.setAttribute('cy', points[points.length - 1].y + 'px');

    runContainer.append(startCap, line, endCap);
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
   * @returns {SVGGElement} An SVG group containing the grid.
   * @private
   */
  createGrid() {
    const grid = document.createElementNS(SVG_NS, 'g');
    grid.classList.add('grid');

    for (let i = 0; i < this.dates.length; i++) {
      const verticalLine = document.createElementNS(SVG_NS, 'line');
      verticalLine.classList.add('date-line');

      verticalLine.setAttribute('x1', RUN_SCALE_X * this.zoom * i + 'px');
      verticalLine.setAttribute('x2', RUN_SCALE_X * this.zoom * i + 'px');
      verticalLine.setAttribute(
          'y1',
          RUN_SCALE_Y * 0.5 + 'px',
      );
      verticalLine.setAttribute(
          'y2',
          RUN_SCALE_Y * (NUM_POSITIONS + 0.5) + 'px',
      );

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

    this.shadowRoot.addEventListener('series-hit', (ev) => {
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

    this.shadowRoot.addEventListener('series-clear', () => {
      tooltip.classList.remove('chart-tooltip-active');
    });

    return tooltip;
  }

  /**
   * Updates the chart. Should be called after visual attributes (such as the
   * zoom) are changed.
   *
   * @private
   */
  updateChart() {
    this.svg.setAttribute(
        'viewBox',
        '0 ' +
        // shift down so that lines are vertically centered
        RUN_SCALE_Y * 0.5 + ' ' +
        this.dates.length * RUN_SCALE_X * this.zoom + ' ' +
        NUM_POSITIONS * RUN_SCALE_Y,
    );

    const seriesElements =
      Array.from(this.svg.getElementsByClassName('series'));

    let index = 0;

    for (const history of this.histories.values()) {
      const seriesElement = seriesElements[index];
      this.updateSeries(seriesElement, history);
      index++;
    }

    this.updateGrid();
  }

  /**
   * Updates a series in the chart.
   *
   * @param {Element} seriesContainer The element corresponding to this series.
   * @param {number[]} history The historical positions of this track on the
   * leaderboard.
   * @private
   */
  updateSeries(seriesContainer, history) {
    for (const runContainer of
      seriesContainer.getElementsByClassName('series-run')) {
      const start = parseInt(runContainer.getAttribute('data-run-start'));
      const end = parseInt(runContainer.getAttribute('data-run-end'));

      this.updateRun(runContainer, history, start, end);
    }

    if (seriesContainer.classList.contains('series-active')) {
      const marker = seriesContainer.getElementsByClassName('series-marker')[0];
      const x = parseInt(marker.getAttribute('data-marker-x'));
      const y = parseInt(marker.getAttribute('data-marker-y'));
      marker.setAttribute('cx', x * RUN_SCALE_X * this.zoom + 'px');
      marker.setAttribute('cy', y * RUN_SCALE_Y + 'px');
    }
  }

  /**
   * Updates a run in the chart.
   *
   * @param {Element} runContainer The element corresponding to this run.
   * @param {number[]} history The historical positions of this track on the
   * leaderboard.
   * @param {number} start The index of the first entry in this run.
   * @param {number} end The index of the last entry in this run.
   * @private
   */
  updateRun(runContainer, history, start, end) {
    const points = history
        .slice(start, end)
        .map((val, idx) => ({
          x: (idx + start) * RUN_SCALE_X * this.zoom,
          y: val * RUN_SCALE_Y,
        }));

    const pointsStr = points
        .map(({x, y}) => `${x}, ${y}`)
        .join(' ');

    const [startCap, line, endCap] = runContainer.children;

    line.setAttribute('points', pointsStr);

    startCap.setAttribute('cx', points[0].x + 'px');
    endCap.setAttribute('cx', points[points.length - 1].x + 'px');
  }

  /**
   * Updates the gridlines created by createGrid.
   *
   * @private
   */
  updateGrid() {
    const grid = this.svg.querySelector('.grid');
    const verticalLines = Array.from(grid.children);

    for (let i = 0; i < this.dates.length; i++) {
      const verticalLine = verticalLines[i];

      verticalLine.setAttribute('x1', RUN_SCALE_X * this.zoom * i + 'px');
      verticalLine.setAttribute('x2', RUN_SCALE_X * this.zoom * i + 'px');
    }
  }
}

customElements.define('gdpr-chart', GdprChart);
