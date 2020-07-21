/**
 * fetches youtube api calls from YoutubeServlet.java
 * and displays on youtube-genre.html
 */

const genreBlock = document.getElementById('genres');
const numVideosInput = document.getElementById('numVideos');
const DEFAULT_NUM_VIDS = 10;

/**
 * extracts num vids from input, otherwise returns default
 * helper fn for displayMusicGenre()
 *
 * @returns {number} num videos user wants to retrieve
 */
function getNumVids() {
  const numVideos = numVideosInput.value;
  return numVideos || DEFAULT_NUM_VIDS;
}

/**
 * fetches genre count hashmap from /api/youtube and updates html
 */
async function displayMusicGenre() {
  const numVideos = getNumVids();

  // keep track of num_videos in URL w/o reload
  history.pushState('', '', `youtube-genre.html?num_videos=${numVideos}`);

  const response = await fetch(`/api/youtube?num_videos=${numVideos}`);
  if (response.status == 401) {
    // no oauth login so redirect to new page
    window.open('/api/oauth/login/youtube');
  }

  const genreCount = await response.text();
  genreBlock.innerHTML = genreCount;
  displayChart();
}

/**
 * updates value in num videos input
 * by extracting num_videos param in URL
 * otherwise if no num_videos param does nothing
 */
function updateNumVids() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  numVideosInput.value = urlParams.get('num_videos');
}

updateNumVids();

function displayChart() {
  const options = {
    series: [{
    data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
  }],
    chart: {
    type: 'bar',
    height: 350
  },
  plotOptions: {
    bar: {
      horizontal: true,
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan',
      'United States', 'China', 'Germany'
    ],
  }
  };

  var chart = new ApexCharts(document.querySelector("#vis"), options);
  chart.render();
}

// issues don't know how to delete / hide chart. hideSeries() doesn't work
