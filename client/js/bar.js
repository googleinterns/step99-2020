/* constructs bar graph from scratch */

const textBlock = document.getElementById('bar-text');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 100 100'); // change height in css
document.getElementById('graph').appendChild(svg);

textBlock.setAttribute('height', svg.getBoundingClientRect().height);

const counts = [1, 3, 1, 2];
const genres = ['Pop Music', 'Other Music', 'Electronic Music', 'Music of Latin America'];
const maxCount = 3;
const graphHeight = 100;
const barHeightContainer = graphHeight / counts.length;
const barSpace = 0.1 * barHeightContainer;
const barThickness = 0.8 * barHeightContainer;
const leftBarMargin = 5;
const unitBarLength = 100 / maxCount;

for (var i = 0; i < counts.length; i++) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'bar');
  svg.appendChild(g);

  const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bar.setAttribute('width', unitBarLength * counts[i]);
  bar.setAttribute('height', barThickness);
  bar.setAttribute('x', leftBarMargin);
  bar.setAttribute('y', barSpace + barHeightContainer * i);
  g.appendChild(bar);

  const textContainer = document.createElement('div');
  textBlock.appendChild(textContainer);
  textContainer.setAttribute('class', 'category-container');

  const text = document.createElement('div');
  textContainer.appendChild(text);
  text.setAttribute('class', 'category');
  text.textContent = genres[i];
  console.log(barHeightContainer / 100 * textBlock.getAttribute('height'));
  textContainer.style.height = barHeightContainer / 100 * textBlock.getAttribute('height') + 'px';
}

