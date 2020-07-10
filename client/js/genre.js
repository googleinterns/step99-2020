/** fetches youtube api calls from YoutubeServlet.java
    and displays on youtube-genre.html
*/

async function displayMusicGenre() {
  const genreBlock = document.getElementById('genres');
  const response = await fetch("/api/youtube");
  console.log(response.status);
  if (response.status != 200) {
    // redirect to login if there are errors 
    window.location.href = "/api/oauth/login/youtube";
  }
  const genreCount = await response.text();
  genreBlock.innerHTML = genreCount;
}

displayMusicGenre();

function updateNumVids() {
  const numVideosInput = document.getElementById('numVideos');
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  console.log(queryString);
  console.log(urlParams.get('num_videos'));
  numVideosInput.value = urlParams.get('num_videos');
}

updateNumVids();
