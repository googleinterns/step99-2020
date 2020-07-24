export class GdprTable extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.chart = document.getElementById(this.getAttribute('chart'));
    this.chart.addEventListener('series-hit', this.onSeriesHit.bind(this));
    this.histories = new Map();
    this.dates = [];

    this.table = document.createElement('table');
    this.table.classList.add('gdpr-table');

    const thead = document.createElement('thead');
    thead.innerHTML =
      '<th class="gdpr-table-header gdpr-table-header-rank">Rank</th>' +
      '<th class="gdpr-table-header gdpr-table-header-track">Track</th>';

    const tbody = document.createElement('tbody');
    tbody.classList.add('gdpr-table-body');

    this.table.append(thead, tbody);

    this.tbody = tbody;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/css/spotify-gdpr-table.css';

    this.shadowRoot.append(stylesheet, this.table);

  }

  /**
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
    ranking.sort((a, b) => a.rank < b.rank ? -1 : 1);

    // update the table
    this.tbody.innerHTML = '';

    for (const {key, rank, selected} of ranking) {
      const row = document.createElement('tr');

      row.classList.add('gdpr-table-track');
      row.classList.toggle('gdpr-table-track-selected', selected);

      const rankCell = document.createElement('td');
      const keyCell = document.createElement('td');

      rankCell.classList.add('gdpr-table-track-rank');
      keyCell.classList.add('gdpr-table-track-track');

      rankCell.innerText = `#${rank}`;
      keyCell.innerText = key;

      row.append(rankCell, keyCell);

      this.tbody.append(row);
    }
  }
}

customElements.define('gdpr-table', GdprTable);
