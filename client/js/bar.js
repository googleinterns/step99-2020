/* constructs bar graph from scratch */

const textBlock = document.getElementById('bar-text');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 100 100'); // change height in css
document.getElementById('graph').appendChild(svg);

// textBlock should align vertically with bar chart
textBlock.setAttribute('height', svg.getBoundingClientRect().height);

// hard coded data for bar chart for now
const counts = [1, 3, 1, 2];
const maxCount = 3;
const genres = ['Pop Music', 'Other Music', 'Electronic Music', 'Music of Latin America'];

const GRAPH_HEIGHT = 100;
const GRAPH_HEIGHT_CONTAINER = GRAPH_HEIGHT / counts.length;

const BAR_PERCENT_FILL = 0.8;
const BAR_PERCENT_PADDING = (1 - BAR_PERCENT_FILL) / 2;
const BAR_THICKNESS = BAR_PERCENT_FILL * GRAPH_HEIGHT_CONTAINER;
const GRAPH_TOP_PADDING = BAR_PERCENT_PADDING * GRAPH_HEIGHT_CONTAINER;

const GRAPH_LEFT_PADDING = 5;
const UNIT_BAR_LENGTH = 100 / maxCount;

const CATEGORY_HEIGHT = GRAPH_HEIGHT_CONTAINER / 100 * textBlock.getAttribute('height');

for (let i = 0; i < counts.length; i++) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(g);
  g.setAttribute('class', 'bar');

  const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  g.appendChild(bar);
  bar.setAttribute('width', UNIT_BAR_LENGTH * counts[i]);
  bar.setAttribute('height', BAR_THICKNESS);
  bar.setAttribute('x', GRAPH_LEFT_PADDING);
  bar.setAttribute('y', GRAPH_TOP_PADDING + GRAPH_HEIGHT_CONTAINER * i);

  const textContainer = document.createElement('div');
  textBlock.appendChild(textContainer);
  textContainer.setAttribute('class', 'category');
  textContainer.style.height = CATEGORY_HEIGHT + 'px';
  textContainer.textContent = genres[i];
}
