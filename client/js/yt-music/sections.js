/**
 * runs functions as user scrolls past different sections
 */

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
 * function triggered on 1st section
 */
function draw1() {
  console.log('draw1');
}

/**
 * function triggered on 2nd section
 */
function draw2() {
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
