export function init() {
  const hamburger = document.getElementById('hamburger');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinks = navOverlay.querySelectorAll('a');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    navOverlay.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      // Focus first nav link when menu opens
      navLinks[0]?.focus();
    }
  });

  // Smooth scroll for navigation links
  navLinks.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    });
  });

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
      closeMenu();
      hamburger.focus();
    }
  });

  function closeMenu() {
    hamburger.classList.remove('active');
    navOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
}
