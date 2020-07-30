/**
 * fetches youtube api calls from YoutubeServlet.java
 * and displays on youtube-genre.html
 */

const genreBlock = document.getElementById('genres');

/**
 * fetches genre count hashmap from /api/youtube and updates html
 */
async function displayMusicGenre() {
  // keep track of num_videos in URL w/o reload
  history.pushState('', '', `youtube-genre.html`);

  const response = await fetch(`/api/youtube`);
  if (response.status == 401) {
    // no oauth login so redirect to new page
    window.open('/api/oauth/login/youtube');
  }

  const genreCount = await response.text();
  genreBlock.innerHTML = genreCount;
  console.log(JSON.parse(genreCount));
}

