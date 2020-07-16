// Listen for on submit click
let formSubmit = document.getElementById("formSubmit");
formSubmit.addEventListener("click", fetchAndShowResponse, false);

/**
 * Grabs response from server
 */ 
async function fetchAndShowResponse() {
  const response = await fetch('/api/musix');
  const value = await response.json();
  const el = document.getElementById(elId); 
  el.innerText = value;
  return value;
}

