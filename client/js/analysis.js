const COMMENT_APPEARANCE_TIME = 1500;
const TOTAL_COMMENTS_TO_DISPLAY = 6;
const TOTAL_COMMENTS_TIME = COMMENT_APPEARANCE_TIME * TOTAL_COMMENTS_TO_DISPLAY;

window.onload = function() {
  for (let i = 1; i < 6; i++) {
    setTimeout(() => {
      addListElement(i);
    }, i * COMMENT_APPEARANCE_TIME);
  }
  setTimeout(() => {
    addFeedbackResult('POSITIVE');
  }, TOTAL_COMMENTS_TO_DISPLAY);

  for (let i = 0; i < 6; i++) {
    const values = [
      'TOXICITY',
      'IDENTITY ATTACK',
      'INSULT',
      'PROFANITY',
      'THREAT',
      'FLIRTATION',
    ];
    // Mock the data with a number between 30% and 60% for now.
    const chartFullness = Math.floor(Math.random() * 61 + 30);
    addDonutChart(values[i], chartFullness);
  }
};

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

  div.classList = 'a-chart';
  div.className = 'item donut';
  div.style.setProperty('--percent', percent);

  const header = document.createElement('h2');
  header.innerText = str;
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
 * @param {string} el the string for the svg element
 */
function createSVGElement(el) {
  return document.createElementNS('http://www.w3.org/2000/svg', el);
}

