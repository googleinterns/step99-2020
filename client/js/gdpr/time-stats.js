const MS_PER_HOUR = 60 * 60 * 1000;

export class GdprTimeStats extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.mainContainer = document.createElement('div');
    this.mainContainer.id = 'main-container';

    this.mainContainer.innerHTML = `
      <div id="gdpr-time-stats-hero">
        <p>You've spent</p>
        <span id="gdpr-time-stats-total">?</span>
        <p>hours listening to music on Spotify<p>
      </div>
      <div id="gdpr-time-stats-breakdown">
        <section>
          <span
            id="gdpr-time-stats-this-year"
            class="gdpr-time-stats-breakdown-number">
            ?
          </span>
          <p>hours this year so far</p>
        </section>
        <section>
          <span
            id="gdpr-time-stats-last-year"
            class="gdpr-time-stats-breakdown-number">
            ?
          </span>
          <p>hours last year</p>
        </section>
        <section>
          <span
            id="gdpr-time-stats-old"
            class="gdpr-time-stats-breakdown-number">
            ?
          </span>
          <p>hours before last year</p>
        </section>
      </div>
    `;

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/css/spotify-gdpr-time-stats.css';

    this.shadowRoot.append(stylesheet, this.mainContainer);
  }

  load(records) {
    const currentYear = new Date().getFullYear();

    const thisYearRecords = records
        .filter((record) => record.endTime.getFullYear() === currentYear);
    const lastYearRecords = records
        .filter((record) => record.endTime.getFullYear() === currentYear - 1);
    const oldRecords = records
        .filter((record) => record.endTime.getFullYear() < currentYear - 1);

    const thisYearTime = thisYearRecords
        .reduce((time, record) => time + record.msPlayed, 0);
    const lastYearTime = lastYearRecords
        .reduce((time, record) => time + record.msPlayed, 0);
    const oldTime = oldRecords
        .reduce((time, record) => time + record.msPlayed, 0);

    const totalTime = thisYearTime + lastYearTime + oldTime;

    this.shadowRoot.getElementById('gdpr-time-stats-total').innerText =
      (totalTime / MS_PER_HOUR).toFixed(0);

    this.shadowRoot.getElementById('gdpr-time-stats-this-year').innerText =
      (thisYearTime / MS_PER_HOUR).toFixed(0);

    this.shadowRoot.getElementById('gdpr-time-stats-last-year').innerText =
      (lastYearTime / MS_PER_HOUR).toFixed(0);

    this.shadowRoot.getElementById('gdpr-time-stats-old').innerText =
      (oldTime / MS_PER_HOUR).toFixed(0);
  }
}

customElements.define('gdpr-time-stats', GdprTimeStats);
