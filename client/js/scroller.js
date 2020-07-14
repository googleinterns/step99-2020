/**
 * figures out which section the user is currently scrolled to
 * @returns {scroll}
 */
function scroller() {
  let container = d3.select('body');
  const dispatch = d3.dispatch('active', 'progress');
  const sections = d3.selectAll('.step');
  let sectionPositions;

  let currentIndex = -1;
  const containerStart = 0;

  /**
   * binds the position function to the scroll event,
   * and the resize funciton to the resize event.
   */
  function scroll() {
    d3.select(window)
      .on('scroll.scroller', position)
      .on('resize.scroller', resize);

    resize();

    const timer = d3.timer(function() {
      position();
      timer.stop();
    });
  }

  /**
   * determines where each of teh .step elements are on the page,
   * relate to the top of the first element. It saves all of the
   * coordinates of the elements in an array called sectionPositions.
   */
  function resize() {
    sectionPositions = [];
    let startPos;

    sections.each(function(d, i) {
      const top = this.getBoundingClientRect().top;

      if (i === 0 ) {
        startPos = top;
      }
      sectionPositions.push(top - startPos);
    });
  }

  /**
   * determines where the user is on the page (using window.pageYOffset),
   * and uses that to determine which section of text should currently be in view.
   * It then uses D3's dispatching tools to signal the 'progress' event, which
   * will be used in the main script, passing along the current section index so
   * that the script knows which stage of the animation/visualization should be showing
   */
  function position() {
    const pos = window.pageYOffset - 300 - containerStart;
    let sectionIndex = d3.bisect(sectionPositions, pos);
    sectionIndex = Math.min(sections.size()-1, sectionIndex);

    if (currentIndex !== sectionIndex) {
      dispatch.call('active', this, sectionIndex);
      currentIndex = sectionIndex;
    }

    const prevIndex = Math.max(sectionIndex - 1, 0);
    const prevTop = sectionPositions[prevIndex];
    const progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
    dispatch.call('progress', this, currentIndex, progress);
  }

  /**
   * event listener to dispatcher
   *
   * @param value
   * @returns {scroll} // TODO
   */
  scroll.container = function(value) {
    if (arguments.legth === 0) {
      return container;
    }
    container = value;
    return scroll;
  };

  scroll.on = function(action, callback) {
    dispatch.on(action, callback);
  };

  return scroll;
}
