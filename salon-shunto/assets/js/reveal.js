(function() {
  'use strict';

  // Mark motion as ready for the head script to remove class if needed, 
  // but primarily this ensures observers are set up.
  window.shuntoMotionReady = true;

  var revealElements = document.querySelectorAll('.js-reveal');
  
  if (revealElements.length === 0) return;

  // Check for reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && window.IntersectionObserver) {
    var observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% visible
    };

    var observer = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // Fallback for no JS or reduced motion: show all immediately
    revealElements.forEach(function(el) {
      el.classList.add('is-visible');
    });
  }

})();
