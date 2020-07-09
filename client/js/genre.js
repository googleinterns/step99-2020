/** fetches youtube api calls from YoutubeServlet.java
    and displays on youtube-genre.html
*/

const genreBlock = document.getElementById('genres');
async function displayMusicGenre() {
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
