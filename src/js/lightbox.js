// Opens a painting in a native <dialog>. showModal() supplies the focus trap,
// Escape-to-close and an inert page behind the viewer, and the close button is
// a <form method="dialog"> submit, so none of that needs code here.

// Mirrors the width of .lightbox-image in style.css for square paintings.
const SIZES = 'min(90vw, 75vh)';

export function init() {
  const dialog = document.getElementById('lightbox');
  const grid = document.querySelector('.gallery-grid');
  if (!dialog || !grid) return;

  const caption = dialog.querySelector('.lightbox-info');
  const image = new Image();
  image.className = 'lightbox-image';
  dialog.querySelector('.lightbox-content').prepend(image);

  let trigger = null;

  grid.addEventListener('click', (event) => {
    const link = event.target.closest('.artwork-image');
    const wantsNewTab = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!link || wantsNewTab) return;

    event.preventDefault();
    open(link);
  });

  // A click that lands on the dialog itself is a click on the backdrop.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Safari does not focus a link when it is clicked, so restore focus by hand.
  dialog.addEventListener('close', () => {
    trigger?.focus();
    trigger = null;
  });

  function open(link) {
    const thumbnail = link.querySelector('img');
    const info = link.closest('.artwork').querySelector('.artwork-info');
    trigger = link;

    // Show the grid image the browser already has, at the final size, then let
    // the large file replace it once it has arrived. The browser keeps the
    // current picture on screen while the new source loads.
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
    image.alt = thumbnail.alt;
    image.style.setProperty('--ratio', thumbnail.getAttribute('width') / thumbnail.getAttribute('height'));
    image.src = thumbnail.currentSrc || thumbnail.src;
    image
      .decode()
      .catch(() => {}) // a failed preview should not block the large image
      .then(() => {
        if (trigger !== link) return;
        image.sizes = SIZES;
        image.srcset = link.dataset.srcset || link.href;
      });

    caption.replaceChildren(...info.cloneNode(true).childNodes);
    dialog.showModal();
  }
}
