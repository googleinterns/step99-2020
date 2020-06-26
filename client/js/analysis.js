
window.onload = function() {
    // Listen for on submit click
    let formSubmit = document.getElementById("formSubmit");
    formSubmit.addEventListener("click", fetchAndShowResponse, false);r
}

/**
 * Grabs response from server
 */ 
async function fetchAndShowResponse() {
    const response = await fetch('/api/musix');
    const value = await response.json();
    changeInnerText("response", value);
    return value;
}

/**
 * Change the contents of div
 * @param elId the id of the element 
 * @param value the value to insert as innerText
 */
function changeInnerText(elId, value) {
    const el = document.getElementById(elId);
    el.innerText = value;
}