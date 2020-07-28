/* constructs bar graph from scratch */

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 100 100'); // change height in css
document.getElementById('graph').appendChild(svg);

// hard coded data for bar chart for now
const CHART_VALUES = [1, 3, 1, 2];
const MAX_CHART_VALUES = Math.max(...CHART_VALUES);

const GRAPH_HEIGHT = 100;
const BAR_CONTAINER_HEIGHT = GRAPH_HEIGHT / CHART_VALUES.length;

// bar container contains a bar. It is composed of bar padding and fill
const BAR_PERCENT_FILL = 0.7;
const BAR_PERCENT_PADDING = 1 - BAR_PERCENT_FILL;
const BAR_THICKNESS = BAR_PERCENT_FILL * BAR_CONTAINER_HEIGHT;
const BAR_UNIT_LENGTH = 100 / MAX_CHART_VALUES;

// top graph padding depends on bar padding
const GRAPH_TOP_PADDING = (BAR_PERCENT_PADDING / 2) * BAR_CONTAINER_HEIGHT;
const GRAPH_LEFT_PADDING = 2.5;

/**
 * creates SVG bar chart given chart values
 * @param {int[]} CHART_VALUES
 */
function createBarChart(CHART_VALUES) {
  for (let i = 0; i < CHART_VALUES.length; i++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    g.setAttribute('class', 'bar');

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    g.appendChild(bar);
    bar.setAttribute('width', BAR_UNIT_LENGTH * CHART_VALUES[i]);
    bar.setAttribute('height', BAR_THICKNESS);
    bar.setAttribute('x', GRAPH_LEFT_PADDING);
    bar.setAttribute('y', GRAPH_TOP_PADDING + BAR_CONTAINER_HEIGHT * i);
  }
}

createBarChart(CHART_VALUES);
