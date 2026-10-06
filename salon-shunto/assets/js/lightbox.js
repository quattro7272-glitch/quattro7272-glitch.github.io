(function() {
  'use strict';

  var openBtns = document.querySelectorAll('.js-lightbox-open');
  var lightbox = document.querySelector('.js-lightbox');
  var closeBtn = document.querySelector('.js-lightbox-close');
  var lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('.lightbox__caption') : null;

  if (!openBtns.length || !lightbox) return;

  function openLightbox(e) {
    e.preventDefault();
    
    var btn = e.target.closest('button'); // Ensure we get the button even if clicked on img inside
    if (!btn) return;

    var fullSrc = btn.getAttribute('data-full');
    var altText = btn.getAttribute('data-alt') || '';

    if (lightboxImg && lightboxCaption) {
      lightboxImg.src = fullSrc;
      lightboxImg.alt = altText;
      lightboxCaption.textContent = altText;
      
      // Show dialog
      try {
        lightbox.showModal();
      } catch (err) {
        console.error('Dialog not supported or error:', err);
      }
    }
  }

  function closeLightbox() {
    if (lightbox && lightbox.open) {
      lightbox.close();
    }
  }

  // Attach click event to open buttons
  openBtns.forEach(function(btn) {
    btn.addEventListener('click', openLightbox);
  });

  // Close on button click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  // Close on backdrop click (outside the dialog content)
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox__overlay')) {
      closeLightbox();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.open) {
      closeLightbox();
    }
  });

})();
