import '../css/style.css';
import * as lightbox from './lightbox.js';
import * as navigation from './navigation.js';

// IntersectionObserver for artwork fade-in animations
function initScrollAnimations() {
  const artworks = document.querySelectorAll('.artwork');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animations
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 150);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  artworks.forEach((artwork) => observer.observe(artwork));
}

lightbox.init();
navigation.init();
initScrollAnimations();
