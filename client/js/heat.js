class HeatRow {
  /**
   *
   * @param {string} name The day of the first element in the row
   * @param {int[]} data The array of 0s and 1s for heat row colors
   */
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }
}

const DEFAULT_DATA = [0, 0, 1, 1, 1];
const DEFAULT_NAME = 'Metric';
const DEFAULT_NUM_ROWS = 10;

const row = new HeatRow(DEFAULT_NAME, DEFAULT_DATA);
console.log(row);
const HeatMapValues = [];
for (var i = 0; i < DEFAULT_NUM_ROWS; i++) {
  HeatMapValues.push(row);
}
console.log(HeatMapValues);

var options = {
  series: HeatMapValues,
  chart: {
    height: 500, // change
    type: 'heatmap',
  },
  dataLabels: {
    enabled: false,
  },
  colors: ['#5bc0eb'],
  title: {
    text: 'HeatMap Chart (Single color)',
  },
};

var chart = new ApexCharts(document.querySelector('#heat-map'), options);
chart.render();

console.log(typeof options);
