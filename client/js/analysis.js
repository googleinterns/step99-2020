// Will be overwritten in merge
window.onload = function() {
  // Listen for on submit click
  const formSubmit = document.getElementById('formSubmit');
  formSubmit.addEventListener('click', fetchAndShowResponse, false);
};

/**
 * Will be overwritten in merge
 */
async function fetchAndShowResponse() {
  const response = await fetch('/api/musix');
  const value = await response.json();
  changeInnerText('response', value);
  return value;
}

/**
 * Will be overwritten in merge
 * @param elId
 * @param value
 */
function changeInnerText(elId, value) {
  const el = document.getElementById(elId);
  el.innerText = value;
}

/**
 * Adds a new chart to the page
 */
function addElement() {
  const div = document.createElement('div');
  div.className = 'item donut';

  const header = document.createElement('h2');
  header.innerText = 'Toxicity';
  div.appendChild(header);

  const svg = createSVGElement('svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const g = buildCircle();
  svg.appendChild(g);
  div.appendChild(svg);

  const currentDiv = document.getElementById('id');
  document.body.insertBefore(div, currentDiv);
}

/**
 * Builds the circles within the svg tag
 */
function buildCircle() {
  const g = createSVGElement('g');

  const insideCircle = createSVGElement('circle');

  insideCircle.setAttribute('r', '70');
  insideCircle.setAttribute('cx', '50%');
  insideCircle.setAttribute('cy', '50%');
  insideCircle.setAttribute('stroke-width', '20');
  insideCircle.setAttribute('stroke', '#f2f2f2');
  insideCircle.setAttribute('fill', 'none');

  const outsideCircle = createSVGElement('circle');

  outsideCircle.setAttribute('class', 'circle_animation');
  outsideCircle.setAttribute('r', '70');
  outsideCircle.setAttribute('cx', '50%');
  outsideCircle.setAttribute('cy', '50%');
  outsideCircle.setAttribute('stroke-width', '20');
  outsideCircle.setAttribute('stroke', '#ffb6c1'); // light pink
  outsideCircle.setAttribute('fill', 'none');

  g.appendChild(insideCircle);
  g.appendChild(outsideCircle);

  return g;
}

/**
 * Creates an SVG Element
 * @param el
 */
function createSVGElement(el) {
  return document.createElementNS('http://www.w3.org/2000/svg', el);
}
