/**
 * fetches youtube api calls from YoutubeServlet.java
 * and displays on youtube-genre.html
 */

const numVideosInput = document.getElementById('numVideos');
const DEFAULT_NUM_VIDS = 10;

/**
 * extracts num vids from input, otherwise returns default
 * helper fn for displayMusicGenre()
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
  const genreBlock = document.getElementById('genres');
  const numVideos = getNumVids();
  const response = await fetch(`/api/youtube?num_videos=${numVideos}`);
  if (response.status != 200) {
    // redirect to login if there are errors 
    window.location.href = "/api/oauth/login/youtube";
  }
  const genreCount = await response.text();
  genreBlock.innerHTML = genreCount;
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
displayMusicGenre();
