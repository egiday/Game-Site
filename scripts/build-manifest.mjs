#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GAMES_DIR = path.join(ROOT, 'games');
const OUT = path.join(ROOT, 'games-manifest.json');

async function main() {
  await ensureDir(path.join(ROOT, 'assets', 'thumbnails'));
  const entries = await fs.readdir(GAMES_DIR, { withFileTypes: true });
  const games = [];
  for (const dirent of entries) {
    if (!dirent.isDirectory()) continue;
    const id = dirent.name;
    const metaPath = path.join(GAMES_DIR, id, 'meta.json');
    let meta = {};
    try {
      meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
    } catch {
      meta = { title: id, genre: 'Unknown', description: 'No meta.json present', status: 'placeholder' };
    }
    const title = meta.title || id;
    const genre = meta.genre || 'Misc';
    const description = meta.description || '';
    const status = meta.status || 'placeholder';
    let thumbnail = meta.thumbnail || '';

    // Validate existing thumbnail path
    if (thumbnail) {
      const absThumb = path.join(ROOT, thumbnail);
      try { await fs.access(absThumb); } catch { thumbnail = ''; }
    }
    // Auto-generate if missing or placeholder
    if (!thumbnail || /placeholder\.png$/.test(thumbnail)) {
      thumbnail = await generateThumbnail(title, id);
    }

    games.push({ id, title, genre, description, status, thumbnail });
  }
  games.sort((a,b)=> a.id.localeCompare(b.id, undefined, { numeric:true }));
  await fs.writeFile(OUT, JSON.stringify(games, null, 2));
  console.log(`Manifest written: ${OUT} (${games.length} games)`);
}

async function ensureDir(dir) {
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
}

function initials(str) {
  const parts = str.trim().split(/\s+/).slice(0,2);
  return parts.map(p=>p[0]).join('').toUpperCase();
}

function pickGradient(id) {
  const palettes = [
    ['#1e3a8a','#3b82f6'],
    ['#7e22ce','#a855f7'],
    ['#be123c','#f43f5e'],
    ['#075985','#0ea5e9'],
    ['#065f46','#10b981'],
    ['#92400e','#f59e0b'],
    ['#78350f','#d97706']
  ];
  let hash = 0; for (const ch of id) hash = (hash + ch.charCodeAt(0)) % palettes.length;
  return palettes[hash];
}

async function generateThumbnail(title, id) {
  const [c1,c2] = pickGradient(id);
  const text = initials(title) || id.slice(0,2).toUpperCase();
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice">\n  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>\n  <rect width="480" height="300" fill="url(#g)"/>\n  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,Segoe UI,Roboto" font-size="120" font-weight="600" fill="rgba(255,255,255,.9)" letter-spacing="4">${text}</text>\n</svg>`;
  const relPath = path.join('assets','thumbnails',`${id}.svg`);
  const abs = path.join(ROOT, relPath);
  await fs.writeFile(abs, svg, 'utf8');
  return relPath;
}

main().catch(err => { console.error(err); process.exit(1); });
