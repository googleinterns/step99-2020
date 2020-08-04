/**
 * @file constructs bar graph from scratch
 */

// hard coded data for bar chart for now
const CHART_VALUES = [1, 3, 1, 2];
const CHART_CATEGORIES = [
  'Pop Music',
  'Other Music',
  'Electronic Music',
  'Music of Latin America',
];

const GRAPH_HEIGHT = 100;
// each bar container is composed of bar padding and fill
const BAR_PERCENT_FILL = 0.7;
const BAR_PERCENT_PADDING = 1 - BAR_PERCENT_FILL;

const GRAPH_LEFT_PADDING = 2.5;

/**
 * creates SVG bar chart given chart values and categories
 *
 * @param {number[]} chartValues array of bar values/lengths
 * @param {string[]} chartCategories array of bar categories/labels
 */
function createBarChart(chartValues, chartCategories) {
  const maxChartValues = Math.max(...chartValues);
  const barContainerHeight = GRAPH_HEIGHT / chartValues.length;

  const barThickness = BAR_PERCENT_FILL * barContainerHeight;
  const barUnitLength = 100 / maxChartValues;

  // top graph padding depends on bar padding
  const graphTopPadding = (BAR_PERCENT_PADDING / 2) * barContainerHeight;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'svg');
  document.getElementById('graph').appendChild(svg);

  for (let i = 0; i < chartValues.length; i++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    g.setAttribute('class', 'bar');

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    g.appendChild(bar);
    bar.setAttribute('width', barUnitLength * chartValues[i]);
    bar.setAttribute('height', barThickness);
    bar.setAttribute('x', GRAPH_LEFT_PADDING);
    bar.setAttribute('y', graphTopPadding + barContainerHeight * i);

    const barTextContainer = document.getElementById('bar-text');
    const category = document.createElement('div');
    barTextContainer.appendChild(category);
    category.setAttribute('class', 'category');
    category.textContent = chartCategories[i];
  }
}

createBarChart(CHART_VALUES, CHART_CATEGORIES);
