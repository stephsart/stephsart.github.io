// The links are plain in-page anchors; scrolling is left to the browser
// (scroll-behavior in style.css). This module only opens and closes the menu
// and gives the header its background once the hero has scrolled away.

export function init() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('nav-overlay');
  const nav = document.getElementById('floating-nav');
  const hero = document.querySelector('.hero');
  if (!hamburger || !overlay) return;

  function setOpen(open) {
    hamburger.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  }

  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) overlay.querySelector('a')?.focus();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('active')) {
      setOpen(false);
      hamburger.focus();
    }
  });

  if (hero && nav) {
    new IntersectionObserver(([entry]) => {
      nav.classList.toggle('scrolled', !entry.isIntersecting);
    }).observe(hero);
  }
}
