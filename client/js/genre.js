/**
 * fetches youtube api calls from YoutubeServlet.java
 * and displays on youtube-genre.html
 */


/**
 * fetches genre count hashmap from /api/youtube and updates html
 */
async function displayMusicGenre() {
  const genreBlock = document.getElementById('genres');

  const response = await fetch(`/api/youtube`);
  if (response.status == 401) {
    // no oauth login so redirect to new page
    window.open('/api/oauth/login/youtube');
  }

  const genreCount = await response.text();
  genreBlock.innerHTML = genreCount;
}
