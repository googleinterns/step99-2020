const scroll = scroller().container(d3.select('#graphic'));
scroll();

let lastIndex; let activeIndex = 0;

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
 * I placed all the functions in an array. Each function corresponds
 * to a different change in the visualisation. One may change the
 * graph into a scatter plot, and another may initiate a force simulation.
 *
 */
const activationFunctions = [
  draw1,
  draw2,
  draw3,
  draw4,
  draw5,
];
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
 * displays sample bar chart
 */
function draw1() {
  d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv', function(data) {
    console.log(data);
    // Add X axis
    const x = d3.scaleLinear()
      .domain([0, 13000])
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
      .domain(data.map(function(d) {
        return d.Country;
      }))
      .padding(.1);
    svg.append('g')
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll('myRect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', x(0) )
      .attr('y', function(d) {
        return y(d.Country);
      })
      .attr('width', function(d) {
        return x(d.Value);
      })
      .attr('height', y.bandwidth() )
      .attr('fill', '#69b3a2');
  });
}

/**
 *
 */
function draw2() {
  console.log('draw2');
}

function draw3() {
  console.log('draw3');
}

function draw4() {
  console.log('draw4');
}

function draw5() {
  console.log('draw5');
}
