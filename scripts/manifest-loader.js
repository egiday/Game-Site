export async function loadManifest() {
  const res = await fetch('games-manifest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load games-manifest.json');
  return res.json();
}
