(function() {
  'use strict';

  var sliders = document.querySelectorAll('.js-slider');

  if (sliders.length === 0) return;

  sliders.forEach(function(slider) {
    var track = slider.querySelector('.slider__track');
    var viewport = slider.querySelector('.slider__viewport');
    var prevBtn = slider.querySelector('.js-slider-prev');
    var nextBtn = slider.querySelector('.js-slider-next');
    var countDisplay = slider.querySelector('.slider__count');
    
    if (!track || !viewport) return;

    var slides = Array.from(track.querySelectorAll('.slider__slide'));
    var currentIndex = 0;
    var totalSlides = slides.length;
    var isDragging = false;
    var startX = 0;
    var currentTranslate = 0;
    var prevTranslate = 0;

    function updateCount() {
      if (countDisplay) {
        countDisplay.textContent = (currentIndex + 1) + ' / ' + totalSlides;
      }
    }

    function setSlidePosition(index) {
      if (!track) return;
      
      // Calculate width of a slide based on the first one or viewport logic
      // For simplicity in this specific layout, we assume equal widths or use percentage.
      // However, since images vary (portrait/landscape), we rely on track transform 
      // relative to the number of slides.
      var translateValue = -(index * 100) + '%';
      
      if (!isDragging) {
        currentTranslate = index;
      }
      
      track.style.transform = 'translateX(' + translateValue + ')';
      currentIndex = index;
      updateCount();
    }

    function nextSlide() {
      if (currentIndex < totalSlides - 1) {
        setSlidePosition(currentIndex + 1);
      } else {
        // Stay at end, maybe a small bounce effect could be added via CSS later, 
        // but spec says "stop at edge".
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        setSlidePosition(currentIndex - 1);
      }
    }

    // Button Click Events
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }

    // Keyboard Navigation
    slider.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    // Swipe Support
    slider.addEventListener('touchstart', function(e) {
      isDragging = true;
      startX = e.touches[0].clientX;
      track.style.transition = 'none'; // Remove transition for drag feel
    }, { passive: true });

    slider.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      var currentX = e.touches[0].clientX;
      var diff = currentX - startX;
      
      // Simple parallax effect calculation could go here, 
      // but for this spec, we just track the drag.
      // To keep it simple and robust without complex math:
      // We won't move the track during drag in this basic implementation 
      // to avoid layout thrashing, or we can do a simple translate.
      // Let's implement a smooth drag feel.
      
      var slideWidth = 100 / totalSlides;
      var currentSlideIndex = currentIndex + (diff / viewport.offsetWidth * slideWidth);
      
      if (currentSlideIndex < 0) {
        currentTranslate = 0; // Elastic top
      } else if (currentSlideIndex > totalSlides - 1) {
        currentTranslate = totalSlides - 1; // Elastic bottom
      } else {
        currentTranslate = currentSlideIndex;
      }
      
      track.style.transform = 'translateX(' + (-currentTranslate * slideWidth) + '%)';
    }, { passive: true });

    slider.addEventListener('touchend', function(e) {
      if (!isDragging) return;
      isDragging = false;
      var endX = e.changedTouches[0].clientX;
      var diff = startX - endX; // Positive if swiped left (next), negative if right (prev)
      
      track.style.transition = 'transform 0.3s ease-out';

      if (Math.abs(diff) > 50) { // Threshold for swipe
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      } else {
        // Snap back to current index
        setSlidePosition(currentIndex);
      }
    });

    // Initialize count
    updateCount();
  });

})();
