window.onload = function() {
  // Listen for submission click
  const formSubmit = document.getElementById('sendbutton');
  formSubmit.addEventListener('click', fetchResponse, false);
};

/**
 * Fetches the data from the backend and populates the screen
 *
 */
async function fetchResponse() {
  const param = document.getElementById('searchbar').value;
  const response = await fetch(`/api/analysis?name=${param}`);
  const value = await response.json();
  console.log(value);
  populationHandler(value);
}

/**
 * Handles populating all elements on the screen
 *
 * @param {object} json the json object
 */
function populationHandler(json) {
  const charts = document.getElementById('charts');
  const list = document.getElementById('list');

  removeAllChildNodes(charts);
  removeAllChildNodes(list);
  populateDonutCharts(json);
  const time = populateComments(json);
  determineOverall(json, time*1500);
}

/**
 * Puts the charts on the screen
 *
 * @param {object} json the json object
 */
function populateDonutCharts(json) {
  const map = json.perspectiveMap;
  for (const key in map) {
    if (key) { // this is here bc of the linter
      // Convert to string for type compatibility
      addDonutChart(key, String(100 - map[key]*100));
    }
  }
}

/**
 * Puts the comments on the screen
 *
 * @param {object} json the json object
 * @returns {number} the stop index so that overall knows when to come in
 */
function populateComments(json) {
  const array = json.commentArray;
  const stopIndex = array.length < 5 ? array.length : 5;
  for (let i = 0; i < stopIndex; i++) {
    setTimeout(() => {
      // removes all linebreaks
      addListElement(array[i].replace('\n', ''));
    }, (i+1) * 1500);
  }
  // so that the overall knows when to come in
  return stopIndex+1;
}

/**
 * Determines the overall sentiment and adds it to the screen
 *
 * @param {object} json the json object
 * @param {number} time the time for the text to come in
 */
function determineOverall(json, time) {
  const magnitude = json.magnitudeAndScore.magnitude;
  const score = json.magnitudeAndScore.score;
  let isClear = '';
  let tone = '';

  if (magnitude > 3.0) {
    isClear = 'CLEARLY ';
  }

  if (score < -0.2) {
    tone = 'NEGATIVE';
  } else if (score > 0.2) {
    tone = 'POSITIVE';
  } else {
    tone = 'MIXED';
  }

  setTimeout(() => {
    addFeedbackResult(isClear + tone);
  }, time);
}

/**
 * Removes all children from parent node in DOM tree
 *
 * @param {HTMLElement} parent the parent node
 */
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 * Adds a bullet point to the comment list
 *
 * @param {string} str the txt of the bullet point
 */
function addListElement(str) {
  const el = document.createElement('li');
  el.innerHTML = str;
  document.getElementById('list').appendChild(el);
}

/**
 * Adds the feedback result element to the DOM tree
 *
 * @param {string} result Positive, Negative, or Neutral
 */
function addFeedbackResult(result) {
  const el = document.createElement('div');
  el.classList = 'center fade';
  const text = document.createElement('h1');
  text.setAttribute('id', 'overall');
  text.innerHTML = 'Overall Response:\n ' + result;
  el.appendChild(text);

  const list = document.getElementById('list');
  list.appendChild(el);
}

/**
 * Adds a donut chart
 *
 * @param {string} str the header string of the circle
 * @param {string} percent the amount the circle will be filled
 */
function addDonutChart(str, percent) {
  const div = document.createElement('div');

  div.setAttribute('id', 'a-chart');
  div.className = 'item donut';
  div.style.setProperty('--percent', percent);

  // Convert back to actual percentage
  const percentString = String(100 - Number.parseInt(percent));

  const header = document.createElement('h2');
  header.innerText = str + ': ' + percentString.substring(0, 2) + '%';
  div.appendChild(header);

  const svg = createSVGElement('svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const g = buildCircle();
  svg.appendChild(g);

  div.appendChild(svg);

  const currentDiv = document.getElementById('charts');
  currentDiv.appendChild(div);
}

/**
 * builds the circle parts of the donut charts
 */
function buildCircle() {
  const g = createSVGElement('g');

  const insideCircle = createSVGElement('circle');

  insideCircle.setAttribute('r', '70');
  insideCircle.setAttribute('cx', '50%');
  insideCircle.setAttribute('cy', '50%');
  insideCircle.setAttribute('stroke-width', '25');
  insideCircle.setAttribute('stroke', '#d3d3d3');
  insideCircle.setAttribute('fill', 'none');

  const outsideCircle = createSVGElement('circle');

  outsideCircle.setAttribute('class', 'circle_animation');
  outsideCircle.setAttribute('r', '70');
  outsideCircle.setAttribute('cx', '50%');
  outsideCircle.setAttribute('cy', '50%');
  outsideCircle.setAttribute('stroke-width', '25');
  outsideCircle.setAttribute('stroke', '#ff1493'); // ff073a is good too
  outsideCircle.setAttribute('fill', 'none');
  outsideCircle.setAttribute('pathLength', '100');

  g.appendChild(insideCircle);
  g.appendChild(outsideCircle);

  return g;
}

/**
 * Helper function that creates an SVG element
 *
 * @param {string} el the string for the svg element
 */
function createSVGElement(el) {
  return document.createElementNS('http://www.w3.org/2000/svg', el);
}

