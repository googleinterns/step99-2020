window.onload = function() {
  for (let i = 1; i < 6; i++) {
    setTimeout(() => {
      addListElement(i);
    }, i * 1500);
  }
  setTimeout(() => {
    addResult2("POSITIVE");
  }, 9000);

  for (let i = 0; i < 5; i++) {
    addElement(i);
  }
}

// ADDING COMMENTS AND FADES
function addListElement(num) {
  let el = document.createElement("li");
  el.innerHTML = "This is comment number " + num + ".";
  document.getElementById("list").appendChild(el);
}

function addResult(result) {
  let el = document.createElement("div");
  el.classList = "flex-row center fade";
  let text = document.createElement("h2");
  text.setAttribute("id", "overall");
  text.innerHTML = "Overall Response: " + result;
  el.appendChild(text);

  let middle = document.getElementById("middle-content");
  // insert after
  middle.parentNode.insertBefore(el, middle.nextSibling);
}

function addResult2(result) {
  let el = document.createElement("div");
  el.classList = "center fade";
  let text = document.createElement("h2");
  text.setAttribute("id", "overall");
  text.innerHTML = "Overall Response\n: " + result;
  el.appendChild(text);

  let list = document.getElementById("list");
  list.appendChild(el);
}

// ADDING CHARTS
function addElement(str) {
  var div = document.createElement("div");

  div.setAttribute("id", "a-chart");
  div.className = "item donut";
  div.style.setProperty("--percent", Math.random() * (100));

  var header = document.createElement("h2");
  header.innerText = str;

  div.appendChild(header);

  var svg = createSVGElement("svg");

  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  var g = buildCircle();
  svg.appendChild(g);

  div.appendChild(svg);

  var currentDiv = document.getElementById("charts");
  currentDiv.appendChild(div);
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
  outsideCircle.setAttribute("stroke", "#ffb6c1");
  outsideCircle.setAttribute("fill", "none");
  outsideCircle.setAttribute("pathLength", "100");

  g.appendChild(insideCircle);
  g.appendChild(outsideCircle);

  return g;
}

function createSVGElement(el) {
  return document.createElementNS("http://www.w3.org/2000/svg", el);
}
