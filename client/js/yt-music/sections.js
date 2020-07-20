/**
 * runs functions as user scrolls past diff sections on youtube-genre.html
 */

const scroll = scroller().container(d3.select('#graphic'));
scroll();

let lastIndex; let activeIndex = 0;

// set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 40, left: 90};
const width = 460 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select('#vis')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform',
    'translate(' + margin.left + ',' + margin.top + ')');

/**
 * every time the user scrolls, we receive a new index everytime the user
 * scrolls. First find all the irrelevant sections, and reduce their opacity.
 */
scroll.on('active', function(index) {
  d3.selectAll('.step')
    .transition().duration(500)
    .style('opacity', function(d, i) {
      return i === index ? 1 : 0.1;
    });
  // select fn from activationFunctions based on current section's index
  activeIndex = index;
  const sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
  const scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
  scrolledSections.forEach((i) => {
    activationFunctions[i]();
  });
  lastIndex = activeIndex;
});

/**
 * ith function in this array is run when section i is reached
 *
 */
const activationFunctions = [
  draw1,
  draw2,
  draw3,
  draw4,
  draw5,
];


/**
 * displays bar chart in section 1
 */
function draw1() {


  console.log(window.data);
  const genre = window.data.data;

  // Add X axis
  const x = d3.scaleLinear()
    .domain([0, 6]) // x range (changed)
    .range([0, width]);
  svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Y axis
  const y = d3.scaleBand()
    .range([0, height])
    .domain(genre.map(function(d) {
      return d.genre;
    }))
    .padding(.1);
  svg.append('g')
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll('myRect')
    .data(genre)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', x(0) )
    .attr('y', function(d) {
      return y(d.genre);
    }); // TODO separate construction with display
  svg.selectAll('.bar')
    .transition()
    .delay(function (d, i) { return 300 * (i + 1);}) // delays in succession
    .duration(600)
    .attr('width', function(d) {
      return x(d.count);
    })
    .attr('height', y.bandwidth() )
    .attr('fill', '#69b3a2');

}

/**
 * function triggered on 2nd section
 */
function draw2() {

  // svg.selectAll('.bar')
  //   .transition()
  //   .duration(0)
  //   .attr('opacity', 0);
  console.log('draw2');
}

/**
 * function triggered on 3rd section
 */
function draw3() {
  console.log('draw3');
}

/**
 * function triggered on 4th section
 */
function draw4() {
  console.log('draw4');
}

/**
 * function triggered on 5th section
 */
function draw5() {
  console.log('draw5');
}
