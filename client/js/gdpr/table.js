export class GdprTable extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.chart = document.getElementById(this.getAttribute('chart'));
    this.chart.addEventListener('series-hit', this.onSeriesHit.bind(this));
    this.histories = new Map();
    this.dates = [];

    this.table = document.createElement('div');
    this.table.classList.add('gdpr-table');

    this.table.innerHTML =
      '<div class="gdpr-table-header gdpr-table-header-rank">Rank</div>' +
      '<div class="gdpr-table-header gdpr-table-header-track">Track</div>';

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/css/spotify-gdpr-table.css';

    this.shadowRoot.append(stylesheet, this.table);
  }

  /**
   * Loads the given data into this GDPR table. This must be called in order for
   * the table to respond to the chart properly.
   *
   * @param {Map<string, number[]>} histories The ranking history for each
   * track.
   * @param {Date[]} dates The date of each history entry.
   * @public
   */
  load(histories, dates) {
    this.histories = histories;
    this.dates = dates;
  }

  /**
   * Fires when the user hovers over a series on the chart.
   *
   * @param {CustomEvent} ev The 'series-hit' event object.
   * @private
   */
  onSeriesHit(ev) {
    const {x, y} = ev.detail;
    const ranking = [];

    for (const [key, history] of this.histories) {
      // song's rank at this x position (i.e., date)
      const rank = history[x];
      // true if this is the song the user hovered over
      const selected = rank === y;

      if (rank === undefined || rank === null) {
        continue;
      }

      ranking.push({key, rank, selected});
    }

    // sort by rank ascending
    ranking.sort((a, b) => a.rank - b.rank);

    // clear the table
    for (const cell of this.table.querySelectorAll('.gdpr-table-cell')) {
      cell.remove();
    }

    for (const {key, rank, selected} of ranking) {
      const rankCell = document.createElement('div');
      const keyCell = document.createElement('div');

      rankCell.classList.add('gdpr-table-cell', 'gdpr-table-track-rank');
      keyCell.classList.add('gdpr-table-cell', 'gdpr-table-track-track');
      rankCell.classList.toggle('gdpr-table-track-selected', selected);
      keyCell.classList.toggle('gdpr-table-track-selected', selected);

      rankCell.innerText = `#${rank}`;
      keyCell.innerText = key;

      this.table.append(rankCell, keyCell);
    }
  }
}

customElements.define('gdpr-table', GdprTable);
