/* constructs bar graph from scratch */

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 100 100'); // change height in css
document.getElementById('graph').appendChild(svg);

// hard coded data for bar chart for now
const counts = [1, 3, 1, 2];
const maxCount = 3;

const GRAPH_HEIGHT = 100;
const BAR_CONTAINER_HEIGHT = GRAPH_HEIGHT / counts.length;

// bar container contains a bar. It is composed of bar padding and fill
const BAR_PERCENT_FILL = 0.8;
const BAR_PERCENT_PADDING = 1 - BAR_PERCENT_FILL;
const BAR_THICKNESS = BAR_PERCENT_FILL * BAR_CONTAINER_HEIGHT;
const BAR_UNIT_LENGTH = 100 / maxCount;

// top graph padding depends on bar padding
const GRAPH_TOP_PADDING = (BAR_PERCENT_PADDING / 2) * BAR_CONTAINER_HEIGHT;
const GRAPH_LEFT_PADDING = 2.5;

for (let i = 0; i < counts.length; i++) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(g);
  g.setAttribute('class', 'bar');

  const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  g.appendChild(bar);
  bar.setAttribute('width', BAR_UNIT_LENGTH * counts[i]);
  bar.setAttribute('height', BAR_THICKNESS);
  bar.setAttribute('x', GRAPH_LEFT_PADDING);
  bar.setAttribute('y', GRAPH_TOP_PADDING + BAR_CONTAINER_HEIGHT * i);
}
