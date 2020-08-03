/**
 * @file fetches youtube api calls from YoutubeServlet.java
 * and displays on youtube-genre.html
 */

document.body.onload = fetchMusicGenre();
document.getElementById('fetch').addEventListener('click', fetchMusicGenre());
/**
 * fetches and returns genre analysis object from /api/youtube
 *
 * @returns {JSON object} of youtube genreData and stats
 */
async function fetchMusicGenre() {
  const response = await fetch('/api/youtube');
  if (response.status == 401) {
    // no oauth login so redirect to new page
    window.open('/api/oauth/login/youtube');
  }

  const genreCount = await response.text();
  return JSON.parse(genreCount);
}

export const GENRE_ANALYSIS = fetchMusicGenre();
