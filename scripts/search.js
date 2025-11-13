import { filterCards } from './grid.js';

const input = document.getElementById('search');
const clearBtn = document.getElementById('clearSearch');
input.addEventListener('input', () => filterCards(input.value));
clearBtn.addEventListener('click', () => { input.value=''; filterCards(''); input.focus(); });

// Keyboard shortcut: Ctrl/Cmd + K to focus search
window.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault(); input.focus(); }
});
