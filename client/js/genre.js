/** fetches youtube api calls from YoutubeServlet.java
    and displays on youtube-genre.html
*/
const numVideosInput = document.getElementById('numVideos');
const DEFAULT_NUM_VIDS = 10;

async function displayMusicGenre() {
  const genreBlock = document.getElementById('genres');
  const numVids = getNumVids();
  const response = await fetch(`/api/youtube?num_videos=${numVids}`);
  console.log(response.status);
  if (response.status != 200) {
    // redirect to login if there are errors 
    window.location.href = "/api/oauth/login/youtube";
  }
  const genreCount = await response.text();
  genreBlock.innerHTML = genreCount;
}

function updateNumVids() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  console.log(queryString);
  console.log(urlParams.get('num_videos'));
  numVideosInput.value = urlParams.get('num_videos');
}

function getNumVids() {
  const numVids = numVideosInput.value;
  return numVids || DEFAULT_NUM_VIDS;
}
updateNumVids();
displayMusicGenre();
