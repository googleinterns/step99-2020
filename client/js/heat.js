class HeatRow {
  /**
   *
   * @param {string} name The day of the first element in the row
   * @param {int[]} data The array of 0s and 1s for heat row colors
   */
  constructor(data) {
    this.data = data;
  }
}

const DEFAULT_DATA = [0, 0, 1, 1, 1];
const DEFAULT_NAME = 'Metric';
const TOTAL_LIKED = 50;
const DEFAULT_NUM_ROWS = 10; // do square root

// [{id: 'ererjeirjei', order: 4}]
// {
//   genreData: {PopMusic: 2, OtherMusic: 3},
//   totalLiked: 10,
//   totalMusic: 5,
//   maxGenreCount: 3,
//   likedMusicHistory: [{id: 'ererjeirjei', order: 4}],
// }
const row = new HeatRow(DEFAULT_DATA);
console.log(row);
const HeatMapValues = [];
for (let i = 0; i < DEFAULT_NUM_ROWS; i++) {
  HeatMapValues.push(row);
}
console.log(HeatMapValues);

const options = {
  series: HeatMapValues,
  chart: {
    height: '100%',
    width: '100%', // doesnt fit
    type: 'heatmap',
    foreColor: 'white',
    redrawOnParentResize: true,
  },
  tooltip: {
    enabled: false,
  },
  dataLabels: {
    enabled: false,
  },
  colors: ['#5bc0eb'],
};

const chart = new ApexCharts(document.querySelector('#heat-map'), options);
chart.render();

console.log(typeof options);
