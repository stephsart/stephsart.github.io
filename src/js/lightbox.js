let triggerElement = null;

export function init() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  // Delegated click on artwork images
  document.querySelector('.gallery-grid').addEventListener('click', (e) => {
    const artworkImage = e.target.closest('.artwork-image');
    if (!artworkImage) return;
    open(artworkImage);
  });

  // Keyboard activation for artwork images
  document.querySelector('.gallery-grid').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const artworkImage = e.target.closest('.artwork-image');
    if (!artworkImage) return;
    e.preventDefault();
    open(artworkImage);
  });

  // Close on background click (but not on the image itself)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === closeBtn) {
      close();
    }
  });

  closeBtn.addEventListener('click', close);

  // Focus trap inside lightbox
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // Only the close button is focusable, so trap focus there
      e.preventDefault();
      closeBtn.focus();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      close();
    }
  });

  // Add role="button" and tabindex to artwork images with real <img> tags
  document.querySelectorAll('.artwork-image').forEach((el) => {
    if (el.querySelector('img')) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
    }
  });
}

function open(element) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const img = element.querySelector('img');

  if (!img) return;

  triggerElement = element;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('active');

  // Focus the close button after opening
  requestAnimationFrame(() => {
    lightbox.querySelector('.lightbox-close').focus();
  });
}

function close() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');

  // Return focus to trigger element
  if (triggerElement) {
    triggerElement.focus();
    triggerElement = null;
  }
}
