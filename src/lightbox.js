// Click a screenshot to view it full size. Uses a native <dialog>, which gives us
// Escape to close, focus trapping and a backdrop for free.

export function initLightbox(root) {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Screenshot');
  dialog.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close">Close</button>
    <img class="lightbox-img" alt="" />
    <p class="lightbox-cap"></p>`;
  document.body.appendChild(dialog);

  const img = dialog.querySelector('.lightbox-img');
  const cap = dialog.querySelector('.lightbox-cap');

  root.addEventListener('click', (e) => {
    const link = e.target.closest('.evidence-fig a');
    if (!link) return;
    const thumb = link.querySelector('img');
    e.preventDefault();
    img.src = link.href;
    img.alt = thumb?.alt ?? '';
    cap.textContent = thumb?.alt ?? '';
    dialog.showModal();
  });

  // Anything that is not the image itself closes it: backdrop, empty space, close button.
  dialog.addEventListener('click', (e) => {
    if (e.target !== img) dialog.close();
  });

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    document.documentElement.classList.remove('lightbox-open');
  });
  dialog.addEventListener('toggle', () => {
    document.documentElement.classList.toggle('lightbox-open', dialog.open);
  });
}
