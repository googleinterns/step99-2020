/**
 * figures out which section the user is currently scrolled to
 * in youtube-genre.html
 *
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
   * and the resize fn to the resize event.
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
   * determines where each of the .step elements are on the page,
   * relate to the top of the first element. Saves all of the
   * coordinates of the elements in the sectionPositions array.
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
   * then determins which section of text should currently be in view.
   * signals the 'progress' event via D3's dispatching tools.
   * Progress event passes along the current section index to determine
   * which animation/visualization should be displayed
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
   * @returns {fn} scroll function to scroll.container
   */
  scroll.container = function(value) {
    if (arguments.length === 0) {
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
