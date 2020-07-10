window.onload = function() {
  // Listen for on submit click
  const formSubmit = document.getElementById('formSubmit');
  formSubmit.addEventListener('click', fetchAndShowResponse, false);
};

async function fetchAndShowResponse() {
  const response = await fetch('/api/musix');
  const value = await response.json();
  changeInnerText('response', value);
  return value;
}

function changeInnerText(elId, value) {
  const el = document.getElementById(elId);
  el.innerText = value;
}

document.body.onload = addElement;

function addElement() {
  var div = document.createElement("div");
  div.className = "item donut";
  
  var header = document.createElement("h2");
  header.innerText = "Toxicity";
  div.appendChild(header);
  
  var svg = createSVGElement("svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var g = buildCircle();
  svg.appendChild(g);
  div.appendChild(svg);
  
  var currentDiv = document.getElementById("poop");
  document.body.insertBefore(div, currentDiv);
}

function buildCircle() {
  var g = createSVGElement("g");
  
  var insideCircle = createSVGElement("circle");
  
  insideCircle.setAttribute("r", "70");
  insideCircle.setAttribute("cx", "50%");
  insideCircle.setAttribute("cy", "50%");
  insideCircle.setAttribute("stroke-width", "20");
  insideCircle.setAttribute("stroke", "#f2f2f2");
  insideCircle.setAttribute("fill", "none");
  
  var outsideCircle = createSVGElement("circle");
  
  outsideCircle.setAttribute("class", "circle_animation");
  outsideCircle.setAttribute("r", "70");
  outsideCircle.setAttribute("cx", "50%");
  outsideCircle.setAttribute("cy", "50%");
  outsideCircle.setAttribute("stroke-width", "20");
  outsideCircle.setAttribute("stroke", "#ffb6c1"); // light pink
  outsideCircle.setAttribute("fill", "none");
  
  g.appendChild(insideCircle);
  g.appendChild(outsideCircle);
  
  return g;
}

function createSVGElement(el) {
  return document.createElementNS("http://www.w3.org/2000/svg", el);
}