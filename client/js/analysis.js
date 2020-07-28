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
  try {
    // see caching.js for this function
    const response = await getData(`/api/analysis?name=${param}`);
    populationHandler(response);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Handles populating all elements on the screen
 *
 * @param {object} json the json object from backend
 */
function populationHandler(json) {
  const charts = document.getElementById('charts');
  const list = document.getElementById('list');
  const card = document.getElementById('videocard-wrapper');

  removeAllChildNodes(charts);
  removeAllChildNodes(list);
  removeAllChildNodes(card);
  populateDonutCharts(json);
  showCommentHeader();
  const time = populateComments(json);
  determineOverall(json, time*1500);
}

/**
 * Puts the charts on the screen
 *
 * @param {object} json the json object from backend
 */
function populateDonutCharts(json) {
  const map = json.perspectiveMap;
  for (const key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      // Convert to string for type compatibility
      addDonutChart(key, (100 - map[key]*100).toString());
    }
  }
}

/**
 * Creates the card that displays on a result match
 *
 * @param {object} json the json object from backend
 */
function createCard(json) {
  const id = json.videoId;
  const name = json.videoInfo.name;
  const channel = json.videoInfo.channel;

  const el = document.getElementById('videocard-wrapper');

  const card = document.createElement('div');
  card.setAttribute('id', 'videocard');

  const img = document.createElement('img');
  img.classList = 'card-image';
  img.setAttribute('src', `https://img.youtube.com/vi/${id}/sddefault.jpg`);
  card.appendChild(img);

  const videoInfo = document.createElement('div');

  const link = document.createElement('a');
  link.setAttribute('href', `https://www.youtube.com/watch?v=${id}`);
  link.setAttribute('target', '_blank');

  const title = document.createElement('h3');
  title.setAttribute('id', 'card-title');
  title.innerText = name;

  link.appendChild(title);
  videoInfo.appendChild(link);

  const author = document.createElement('p');
  author.setAttribute('id', 'card-author');
  author.innerText = channel;
  videoInfo.appendChild(author);

  card.appendChild(videoInfo);
  el.appendChild(card);
}

/**
 * Puts the comments on the screen
 *
 * @param {object} json the json object from backend
 * @returns {number} the stop index so that overall knows when to come in
 */
function populateComments(json) {
  const array = json.commentArray;
  const stopIndex = array.length < 5 ? array.length : 5;
  for (let i = 0; i < stopIndex; i++) {
    setTimeout(() => {
      // replace newlines with dashes
      addListElement(array[i].comment.replace(/\n/g, ' -- '));
    }, (i+1) * 1500);
  }
  // so that the overall knows when to come in
  return stopIndex+1;
}

/**
 * Determines the overall sentiment and adds it to the screen
 *
 * @param {object} json the json object from backend
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

  if (score < -0.35) {
    tone = 'NEGATIVE';
  } else if (score > 0.35) {
    tone = 'POSITIVE';
  } else {
    tone = 'MIXED';
  }

  setTimeout(() => {
    addFeedbackResult(isClear + tone);
    createCard(json);
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
 * Toggles the comment header
 *
 */
function showCommentHeader() {
  const el = document.getElementById('commentHeader');
  el.classList.toggle('hidden');
  el.classList.toggle('fade');
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
 * @param {string} percent the amount the circle will be filled
 */
function addDonutChart(str, percent) {
  const div = document.createElement('div');

  div.setAttribute('id', 'a-chart');
  div.className = 'item donut';
  div.style.setProperty('--percent', percent);

  const percentString = (100 - parseInt(percent)).toString();
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

