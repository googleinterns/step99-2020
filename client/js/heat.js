import {GENRE_ANALYSIS} from '/js/genre.js';

class HeatMapRow {
  /**
   * format for a row for heat map values obj
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
const likedMusicBinaryHist = makeBinaryArr(LIKED_MUSIC_HIST, TOTAL_LIKED);

/**
 * converts an array to binary arr
 * @param {number[]} arr values will be indices that hold 1 in output arr
 * @param {number[]} total size of output arr
 * @returns binary arr of size total where ith value 1
 * corresponds to value i in input arr
 */
function makeBinaryArr(arr, total) {
  // first fill with 0s then 1s
  const binaryArr = [...Array(total)].fill(0);
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    binaryArr[el] = 1;
  }
  return binaryArr;
}

/**
 * turns array of data into heat map
 * @param {number[]} data array of all 0s/1s heat map data
 * @returns {HeatMapRow[]} square matrix of HeatMapValues for HeatMap
 */
function createHeatMapValues(data) {
  // heat map should have equal length and width
  const numRows = Math.ceil(Math.sqrt(data.length));

  const heatMapValues = [];
  let row;
  for (let i = 0; i < data.length; i += numRows) {
    row = new HeatMapRow(data.slice(i, i + numRows));
    heatMapValues.push(row);
  }
  return heatMapValues.reverse();
}

/**
 * renders heat map onto html
 * @param {number[]} allBinaryData array of all 0s/1s heat map data
 */
function createHeatMap(allBinaryData) {
  const options = {
    series: createHeatMapValues(allBinaryData),
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

GENRE_ANALYSIS.then((DATA) => {
  console.log(DATA);
  const LIKED_MUSIC_BINARY_HIST = 
    makeBinaryArr(DATA.likedMusicHistory, DATA.totalLiked);
  createHeatMap(LIKED_MUSIC_BINARY_HIST);
});
