console.log("Display text on /api/youtube");

async function getMusicGenre() {
  let response = await fetch("/api/youtube");
  return await response.text();
}

console.log(getMusicGenre());
