class HeatRow {
  /**
   *
   * @param {int[]} data The array of 0s and 1s for heat row colors
   */
  constructor(data) {
    this.data = data;
  }
}

const TOTAL_LIKED = 36;
const RANDOM_DATA =
  [...Array(TOTAL_LIKED)].map((x) => (Math.random() > 0.5) ? 0 : 1);
console.log(RANDOM_DATA);

const NUM_ROWS = Math.floor(Math.sqrt(TOTAL_LIKED)); // do square root

const HeatMapValues = [];
let row;
for (let i = 0; i < NUM_ROWS; i++) {
  row = new HeatRow(RANDOM_DATA.slice(i, i + NUM_ROWS));
  HeatMapValues.push(row);
}

const options = {
  series: HeatMapValues,
  chart: {
    height: '100%',
    width: '100%',
    type: 'heatmap',
    foreColor: 'white',
    redrawOnParentResize: true,
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    enabled: false,
  },
  dataLabels: {
    enabled: false,
  },
  colors: ['#5bc0eb'],
  yaxis: {
    show: false,
  },
  xaxis: {
    labels: {
      show: false,
    },
  },
};

const chart = new ApexCharts(document.querySelector('#heat-map'), options);
chart.render();

console.log(typeof options);
