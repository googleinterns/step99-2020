const COMMENT_APPEARANCE_TIME = 1500;
const COMMENT_TO_STOP_AT = 5;
const FEEDBACK_APPEARANCE_TIME = 1500;

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
  const videoQuery = document.getElementById('searchbar').value;
  const response = await fetch(`/api/analysis?name=${videoQuery}`);
  const responseJson = await response.json();
  renderingHandler(responseJson);
}

/**
 * Handles populating all elements on the screen
 *
 * @param {object} videoAnalysis the object returned from the HTTP request
 * which contains all of the data.
 */
function renderingHandler(videoAnalysis) {
  const charts = document.getElementById('charts');
  const list = document.getElementById('list');

  removeAllChildNodes(charts);
  removeAllChildNodes(list);
  renderDonutCharts(videoAnalysis.perspectiveMap);
 
  const totalComments = renderComments(videoAnalysis.commentArray);
  const commentsRenderTime = totalComments * COMMENT_APPEARANCE_TIME;
  const sentiment = determineSentiment(videoAnalysis.magnitudeAndScore.magnitude,
      videoAnalysis.magnitudeAndScore.score);
  setTimeout(() => {
    addFeedbackResult(sentiment);
  }, commentsRenderTime + FEEDBACK_APPEARANCE_TIME);
}

/**
 * Puts the charts on the screen
 *
 * @param {Map<string, number>} map the map from the videoAnalysis object
 */
function renderDonutCharts(map) {
  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      addDonutChart(key, map[key]);
    }
  }
}

/**
 * Puts the comments on the screen
 *
 * @param {Array} array the comment array from the json response
 * @returns {number} the total number of comments rendered
 */
function renderComments(array) {
  const totalComments = Math.min(COMMENT_TO_STOP_AT, array.length);
  for (let i = 0; i < totalComments; i++) {
    const filteredValue = array[i].replace('\n', '');
    setTimeout(() => {
      addListElement(filteredValue);
    }, (i+1) * COMMENT_APPEARANCE_TIME);
  }

  return totalComments;
}

/**
 * Determines the overall sentiment and adds it to the screen
 *
 * @param {number} magnitude the magnitude returned by Perspective API
 * @param {number} score the score returned by Perspective API
 * @returns {string} a string describing the magnitude and score in words
 */
function determineSentiment(magnitude, score) {
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

  return isClear + tone;
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
  text.innerHTML = 'Overall Response: ' + result;
  el.appendChild(text);

  const list = document.getElementById('list');
  list.appendChild(el);
}

/**
 * Adds a donut chart
 *
 * @param {string} str the header string of the circle
 * @param {number} percentFull the amount the circle will be filled
 */
function addDonutChart(str, percentFull) {
  const div = document.createElement('div');

  // Conversion math for CSS
  const percentRemaining = 100 - percentFull*100;

  div.setAttribute('id', 'a-chart');
  div.className = 'item donut';
  div.style.setProperty('--percent', percentRemaining.toString());

  // Convert back to actual percentage
  const percentString = (percentFull*100).toString();

  const header = document.createElement('h2');
  header.innerText = `${str}: ${percentString.substring(0, 2)}%`;
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
 *
 * @returns {SVGElement} the circle element
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
 * @returns {SVGElement} the svg element
 */
function createSVGElement(el) {
  return document.createElementNS('http://www.w3.org/2000/svg', el);
}

