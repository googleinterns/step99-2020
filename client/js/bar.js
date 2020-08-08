/**
 * @file constructs bar graph from scratch
 */

import {SVG_NS} from '/js/util.js';
import {fetchMusicGenre} from '/js/genre.js';

const GRAPH_HEIGHT = 100;
const GRAPH_LEFT_PADDING = 2.5;

// each bar container is composed of bar padding and fill
const BAR_PERCENT_FILL = 0.7;
const BAR_PERCENT_PADDING = 1 - BAR_PERCENT_FILL;

/**
 * creates SVG bar chart given chart values and categories
 *
 * @param {number[]} chartValues array of bar values/lengths
 * @param {string[]} chartCategories array of bar categories/labels
 */
function createBarChart(chartValues, chartCategories) {
  const maxChartVal = Math.max(...chartValues);
  const barContainerHeight = GRAPH_HEIGHT / chartValues.length;

  const barThickness = BAR_PERCENT_FILL * barContainerHeight;
  const barUnitLength = 100 / maxChartVal;

  // top graph padding depends on bar padding
  const graphTopPadding = (BAR_PERCENT_PADDING / 2) * barContainerHeight;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'svg');
  document.getElementById('graph').appendChild(svg);

  for (let i = 0; i < chartValues.length; i++) {
    const g = document.createElementNS(SVG_NS, 'g');
    svg.appendChild(g);
    g.setAttribute('class', 'bar');

    const bar = document.createElementNS(SVG_NS, 'rect');
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

fetchMusicGenre().then((genreAnalysisInfo) => {
  createBarChart(
      Object.values(genreAnalysisInfo.genreData),
      Object.keys(genreAnalysisInfo.genreData));
});
