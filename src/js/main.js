import '../css/style.css';
import * as lightbox from './lightbox.js';
import * as navigation from './navigation.js';

// Adds .visible to elements as they scroll into view; style.css does the fading.
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      // Paintings that enter together fade in one after another.
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, index) => {
          entry.target.style.transitionDelay = `${index * 150}ms`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll('.artwork, .gallery-header, .about-content, .footer-content')
    .forEach((element) => observer.observe(element));
}

function initScrollToTop() {
  const button = document.getElementById('scroll-to-top');
  const hero = document.querySelector('.hero');
  if (!button || !hero) return;

  new IntersectionObserver(([entry]) => {
    button.classList.toggle('visible', !entry.isIntersecting);
  }).observe(hero);

  // Smoothness comes from scroll-behavior in style.css, which respects reduced motion.
  button.addEventListener('click', () => hero.scrollIntoView());
}

lightbox.init();
navigation.init();
initScrollReveal();
initScrollToTop();
