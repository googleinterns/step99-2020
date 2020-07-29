/* constructs bar graph from scratch */

// hard coded data for bar chart for now
const CHART_VALUES = [1, 3, 1, 2];

const GRAPH_HEIGHT = 100;
// bar container contains a bar. It is composed of bar padding and fill
const BAR_PERCENT_FILL = 0.7;
const BAR_PERCENT_PADDING = 1 - BAR_PERCENT_FILL;

/**
 * creates SVG bar chart given chart values
 * @param {int[]} chartValues
 */
function createBarChart(chartValues) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');

  const maxChartValues = Math.max(...chartValues);
  const barContainerHeight = GRAPH_HEIGHT / chartValues.length;

  const barThickness = BAR_PERCENT_FILL * barContainerHeight;
  const BAR_UNIT_LENGTH = 100 / maxChartValues;

  // top graph padding depends on bar padding
  const GRAPH_TOP_PADDING = (BAR_PERCENT_PADDING / 2) * barContainerHeight;
  const GRAPH_LEFT_PADDING = 2.5;

  for (let i = 0; i < chartValues.length; i++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    g.setAttribute('class', 'bar');

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    g.appendChild(bar);
    bar.setAttribute('width', BAR_UNIT_LENGTH * chartValues[i]);
    bar.setAttribute('height', barThickness);
    bar.setAttribute('x', GRAPH_LEFT_PADDING);
    bar.setAttribute('y', GRAPH_TOP_PADDING + barContainerHeight * i);
  }
  document.getElementById('graph').appendChild(svg);
}

createBarChart(CHART_VALUES);
