export class GdprTable {
  /**
   * @param {Map<string, number[]>} histories The ranking history for each
   * track.
   * @param {Date[]} dates The date of each history entry.
   * @param {HTMLTableElement} table The <table> element to use for this table.
   * @param {HTMLDivElement} chart The element that contains the chart.
   */
  constructor(histories, dates, table, chart) {
    this.table = table;
    this.chart = chart;
    this.histories = histories;
    this.dates = dates;
    this.setup();
  }

  /**
   * @private
   */
  setup() {
    this.chart.addEventListener('series-hit', this.onSeriesHit.bind(this));
  }

  /**
   * @param {CustomEvent} ev The 'series-hit' event object.
   * @private
   */
  onSeriesHit(ev) {
    const {x, y} = ev.detail;
  }
}
