const COMMENT_APPEARANCE_TIME = 1500;
const COMMENT_TO_STOP_AT = 5;
const FEEDBACK_APPEARANCE_TIME = 1500;
const COOLDOWN_TIME = 1000;
const TEN_MINUTES_IN_SECONDS = 60 * 10;

/**
 * Sets the headers for the cache.
 * We only want to pull from the client-side cache if two requests
 * are made within 10 mins of eachother.
 */
const siteHeaders = new Headers();
siteHeaders.set('Cache-control', `max-age=${TEN_MINUTES_IN_SECONDS}`);

/* global getData */

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
  buttonCoolDown();
  const param = document.getElementById('searchbar').value;
  let response = null;
  if (param === '') {
    shakeSearchBar();
    return;
  }

  try {
    response = await getData(`/api/analysis?name=${param}`);
  } catch (e) {
    console.error(e);
  }
  if (response) {
    if (response.status == 500) {
      // This will hit when comments are disabled for the video.
      alert(`The video you selected is incompatible with this tool. 
            Please try again.`);
      return;
    }
    renderingHandler(response);
  }
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
  const card = document.getElementById('videocard-wrapper');
  const featuredComments = document.getElementById('commentHeader');
  featuredComments.classList.remove('hidden');

  removeAllChildNodes(charts);
  removeAllChildNodes(list);
  removeAllChildNodes(card);
  renderDonutCharts(videoAnalysis.perspectiveMap);
  const totalComments = renderComments(videoAnalysis.commentArray);
  const commentsRenderTime = totalComments * COMMENT_APPEARANCE_TIME;
  const sentiment = determineSentiment(
      videoAnalysis.magnitudeAndScore.magnitude,
      videoAnalysis.magnitudeAndScore.score,
  );
  setTimeout(() => {
    addFeedbackResult(sentiment);
    createCard(videoAnalysis.videoId,
        videoAnalysis.videoInfo.name,
        videoAnalysis.videoInfo.channel,
    );
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
 * Creates the card that displays on a result match
 *
 * @param {string} id the id of the wanted video
 * @param {string} name the name of the wanted video
 * @param {string} channel the name of the wanted channel
 */
function createCard(id, name, channel) {
  const el = document.getElementById('videocard-wrapper');

  const card = document.createElement('div');
  card.setAttribute('id', 'videocard');

  const img = document.createElement('img');
  img.classList = 'card-image';
  img.setAttribute('src', `https://img.youtube.com/vi/${id}/sddefault.jpg`);
  card.appendChild(img);

  const link = document.createElement('a');
  link.setAttribute('href', `https://www.youtube.com/watch?v=${id}`);
  link.setAttribute('target', '_blank');

  const title = document.createElement('h3');
  title.setAttribute('id', 'card-title');
  title.innerText = name;
  link.appendChild(title);

  const videoInfo = document.createElement('div');
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
 * @param {Array} array the comment array from the json response
 * @returns {number} the total number of comments rendered
 */
function renderComments(array) {
  const totalComments = Math.min(COMMENT_TO_STOP_AT, array.length);

  for (let i = 0; i < totalComments; i++) {
    const filteredValue = array[i].text.replace('\n/g', ' -- ');
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

  if (score < -0.35) {
    tone = 'NEGATIVE';
  } else if (score > 0.35) {
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

  outsideCircle.setAttribute('class', 'circle-animation');
  outsideCircle.setAttribute('r', '70');
  outsideCircle.setAttribute('cx', '50%');
  outsideCircle.setAttribute('cy', '50%');
  outsideCircle.setAttribute('stroke-width', '25');
  outsideCircle.setAttribute('stroke', '#ff1493');
  outsideCircle.setAttribute('fill', 'none');
  outsideCircle.setAttribute('pathLength', '100');

  g.appendChild(insideCircle);
  g.appendChild(outsideCircle);

  return g;
}

/**
 * Helper function that creates an SVG element
 *
 *
 * @param {string} el the string for the svg element
 * @returns {SVGElement} the svg element
 */
function createSVGElement(el) {
  return document.createElementNS('http://www.w3.org/2000/svg', el);
}

/**
 * Toggles the display class for the lightbox
 *
 * @param {boolean} isLightboxClosed determines whether the lightbox is open
 */
// this function is referenced from HTML
// eslint-disable-next-line no-unused-vars
function toggleLightboxVisibility(isLightboxClosed) {
  if (isLightboxClosed === true) {
    showLightbox();
  } else if (isLightboxClosed === false) {
    hideLightbox();
  } else {
    alert('Invalid parameter for toggleLightboxVisibility');
  }
}

/**
 * Hides the lightbox
 *
 */
function hideLightbox() {
  const target = document.getElementById('info');
  target.classList.add('hide-lightbox');
}

/**
 * Shows the lightbox
 *
 */
function showLightbox() {
  const target = document.getElementById('info');
  target.classList.remove('hide-lightbox');
}

/**
 * Shakes the search bar and make it glow
 */
function shakeSearchBar() {
  const el = document.getElementById('searchbar');
  el.classList.add('searchbarglow');
  el.onanimationend = () => {
    el.classList.remove('searchbarglow');
  };
}

/**
 * Sets a cooldown period for the submit button
 */
function buttonCoolDown() {
  const buttonElement = document.getElementById('sendbutton');
  buttonElement.disabled = true;
  setTimeout(() => {
    buttonElement.disabled = false;
  }, COOLDOWN_TIME);
}
