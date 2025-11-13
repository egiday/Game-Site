import { loadManifest } from './manifest-loader.js';

const gridEl = document.getElementById('gamesGrid');
const observer = new IntersectionObserver(onIntersect, { rootMargin: '150px' });
let manifest = [];

init();

async function init() {
  try {
    manifest = await loadManifest();
    renderCards(manifest);
  } catch (e) {
    gridEl.innerHTML = `<p style="color:#ef4444">Manifest load error: ${e.message}</p>`;
  }
}

function renderCards(list) {
  const frag = document.createDocumentFragment();
  list.forEach(game => frag.appendChild(createCard(game)));
  gridEl.innerHTML = '';
  gridEl.appendChild(frag);
}

function createCard(game) {
  const card = document.createElement('article');
  card.className = 'game-card';
  card.dataset.id = game.id;
  card.dataset.status = game.status;

  const header = document.createElement('header');
  header.innerHTML = `
    <h2>${escapeHtml(game.title)}</h2>
    <div class="meta-line">
      <span class="badge-status">${escapeHtml(game.status)}</span>
      <span class="badge-genre">${escapeHtml(game.genre)}</span>
    </div>
    <p class="desc">${escapeHtml(game.description)}</p>
  `;
  card.appendChild(header);

  // Thumbnail (always show even if placeholder)
  if (game.thumbnail) {
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const img = document.createElement('img');
    img.src = game.thumbnail;
    img.alt = `${game.title} thumbnail`;
    img.loading = 'lazy';
    thumb.appendChild(img);
    card.appendChild(thumb);
  }

  const previewWrap = document.createElement('div');
  previewWrap.className = 'preview-wrap';
  const skeleton = document.createElement('div');
  skeleton.className = 'skeleton';
  previewWrap.appendChild(skeleton);

  if (game.status === 'placeholder') {
    const emptyNote = document.createElement('div');
    emptyNote.className = 'empty-note';
    emptyNote.textContent = 'Game not added yet';
    previewWrap.appendChild(emptyNote);
  } else {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', game.title);
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.dataset.src = `games/${game.id}/index.html`;
    previewWrap.appendChild(iframe);
    observer.observe(card);
  }
  card.appendChild(previewWrap);
  return card;
}

function onIntersect(entries) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const card = entry.target;
    const iframe = card.querySelector('iframe[data-src]');
    if (iframe && !iframe.src) {
      iframe.src = iframe.dataset.src;
      iframe.addEventListener('load', () => {
        const skeleton = card.querySelector('.skeleton');
        skeleton && skeleton.remove();
      }, { once: true });
    }
    observer.unobserve(card);
  });
}

export function filterCards(query) {
  const q = query.trim().toLowerCase();
  manifest.forEach(game => {
    const card = gridEl.querySelector(`[data-id="${CSS.escape(game.id)}"]`);
    if (!card) return;
    if (!q) { card.hidden = false; return; }
    const haystack = `${game.title} ${game.genre} ${game.description}`.toLowerCase();
    card.hidden = !haystack.includes(q);
  });
}

function escapeHtml(str='') {
  return str.replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
}
