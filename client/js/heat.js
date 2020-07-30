class HeatRow {
  /**
   *
   * @param {number[]} data The array of 0s and 1s for a row in a heat map
   */
  constructor(data) {
    this.data = data;
  }
}

// data will be from backend next time
const TOTAL_LIKED = 13;
// element value of x means xth latest video is music
const LIKED_MUSIC_HIST = [1, 4, 7];

// ith value of 1 means ith latest video is music
const likedMusicBinaryHist = [...Array(TOTAL_LIKED)].fill(0);
for (let i = 0; i < LIKED_MUSIC_HIST.length; i++) {
  const el = LIKED_MUSIC_HIST[i];
  likedMusicBinaryHist[el] = 1;
}


/**
 * turns array of data into heat map
 * @param {number[]} data array of all 0s/1s heat map data
 * @param {number} dataLength size of data array
 * @returns {HeatRow[]} square matrix of HeatMapValues for HeatMap
 */
function createHeatMapValues(data, dataLength) {
  // heat map should have equal length and width
  const numRows = Math.ceil(Math.sqrt(dataLength));

  const heatMapValues = [];
  let row;
  for (let i = 0; i < dataLength; i += numRows) {
    row = new HeatRow(data.slice(i, i + numRows));
    heatMapValues.push(row);
  }
  return heatMapValues.reverse();
}

/**
 * renders heat map onto html
 * @param {number[]} data array of all 0s/1s heat map data
 * @param {number} dataLength size of data array
 */
function createHeatMap(data, dataLength) {
  const options = {
    series: createHeatMapValues(data, dataLength),
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
}

createHeatMap(likedMusicBinaryHist, TOTAL_LIKED);
