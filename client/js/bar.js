/* constructs bar graph from scratch */

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 100 100');
svg.setAttribute('class', 'svg');
svg.setAttribute('preserveAspectRatio', 'none');


// hard coded data for bar chart for now
const CHART_VALUES = [1, 3, 1, 2];
const MAX_CHART_VALUES = Math.max(...CHART_VALUES);
const CHART_CATEGORIES = [
  'Pop Music',
  'Other Music',
  'Electronic Music',
  'Music of Latin America',
];

const GRAPH_HEIGHT = 100;
const BAR_CONTAINER_HEIGHT = GRAPH_HEIGHT / CHART_VALUES.length;

<<<<<<< HEAD

=======
>>>>>>> e9b8fa3f571f62779b634fee0908cb7886ff92ce
// bar container contains a bar. It is composed of bar padding and fill
const BAR_PERCENT_FILL = 0.7;
const BAR_PERCENT_PADDING = 1 - BAR_PERCENT_FILL;
const BAR_THICKNESS = BAR_PERCENT_FILL * BAR_CONTAINER_HEIGHT;
const BAR_UNIT_LENGTH = 100 / MAX_CHART_VALUES;

// top graph padding depends on bar padding
const GRAPH_TOP_PADDING = (BAR_PERCENT_PADDING / 2) * BAR_CONTAINER_HEIGHT;
const GRAPH_LEFT_PADDING = 2.5;

document.getElementById('graph').appendChild(svg);
const barTextContainer = document.getElementById('bar-text');

/**
 * creates SVG bar chart given chart values and categories
 *
 * @param {int[]} values bar values/lengths
 * @param {string[]} categories bar categories
 */
function createBarChart(values, categories) {
  for (let i = 0; i < values.length; i++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);
    g.setAttribute('class', 'bar');

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    g.appendChild(bar);
    bar.setAttribute('width', BAR_UNIT_LENGTH * values[i]);
    bar.setAttribute('height', BAR_THICKNESS);
    bar.setAttribute('x', GRAPH_LEFT_PADDING);
    bar.setAttribute('y', GRAPH_TOP_PADDING + BAR_CONTAINER_HEIGHT * i);

    const category = document.createElement('div');
    barTextContainer.appendChild(category);
    category.setAttribute('class', 'category');
    category.textContent = categories[i];
  }
}

createBarChart(CHART_VALUES, CHART_CATEGORIES);
