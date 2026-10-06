(function() {
  'use strict';
  
  var header = document.querySelector('.site-header');
  var toggleBtn = document.querySelector('.js-menu-toggle');
  var globalMenu = document.querySelector('.js-global-menu');
  var navLinks = globalMenu ? globalMenu.querySelectorAll('a') : [];
  var scrollThreshold = 80;
  var rafId = null;

  if (!header || !toggleBtn) return;

  // Header Scroll Effect
  function handleScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > scrollThreshold) {
        header.classList.add('is-compact');
      } else {
        header.classList.remove('is-compact');
      }
      rafId = null;
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // Global Menu Toggle Logic
  function toggleMenu() {
    var isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    if (!globalMenu || !toggleBtn) return;
    
    toggleBtn.setAttribute('aria-expanded', 'true');
    globalMenu.classList.add('is-open');
    globalMenu.removeAttribute('inert');
    globalMenu.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-menu-open');
  }

  function closeMenu() {
    if (!globalMenu || !toggleBtn) return;
    
    toggleBtn.setAttribute('aria-expanded', 'false');
    globalMenu.classList.remove('is-open');
    globalMenu.setAttribute('inert', '');
    globalMenu.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-menu-open');
    toggleBtn.focus();
  }

  // Event Listeners for Menu
  toggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });

  navLinks.forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var currentOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (currentOpen) {
        closeMenu();
      } else {
        toggleBtn.focus();
      }
    }
  });

})();
