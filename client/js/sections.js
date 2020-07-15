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
    console.log(i);
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

function draw1() {
  console.log('draw1');
}

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
