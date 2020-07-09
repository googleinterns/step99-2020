console.log("Display text on /api/youtube");
/* returns a promise */
async function getMusicGenre() {
  let response = await fetch("/api/youtube");
  return await response.text();
}

console.log(getMusicGenre());

const genreBlock = document.getElementById('genres');
getMusicGenre().then(genre => genreBlock.innerHTML = genre);

/* the return value of an async function is always a promise, so you need to do
  .then to unwrap the promise. Within the .then then you can do the desired fns
  because you will have access to the unwrapped fn

  
 */
