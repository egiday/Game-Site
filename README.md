# Game Hub (Static)

Dark-mode static game hub with 20 placeholder slots. Each game lives in `games/<game-id>/` and provides at minimum an `index.html` plus `meta.json`.

## Folder Structure

```
games/
  game-01/
    index.html
    meta.json
  ... up to game-20/
scripts/
  build-manifest.mjs
styles/
  theme.css
index.html
games-manifest.json
```

## Adding a Game

1. Choose an empty placeholder folder (status `placeholder` in manifest).
2. Replace its `index.html` with your game code (iframe will load it).
3. Update `meta.json` (title, genre, description, status = `active`).
4. (Optional) Provide a custom `thumbnail` path (PNG/JPG/SVG). If omitted or invalid, an SVG thumbnail with initials is auto-generated on manifest build.
5. Run build script to regenerate manifest:

```bash
npm run refresh-games
```

6. Reload the homepage. The card now shows the thumbnail and loads the iframe preview lazily (for active games).

## meta.json Schema

```jsonc
{
  "title": "Dungeon Crawler Deluxe",
  "genre": "RPG",
  "description": "Explore randomly generated dungeons and loot treasure.",
  "status": "active", // placeholder | active | coming-soon
  "thumbnail": "assets/thumbnails/game-01.svg" // optional; auto-generated if missing or placeholder
}
```

## Search

The search box filters by title, genre, and description instantly client-side.

## Manifest Generation

`scripts/build-manifest.mjs` scans all subdirectories of `games/` and reads `meta.json`. Missing `meta.json` => placeholder entry. If `thumbnail` missing, invalid, or pointing to the default placeholder, an SVG thumbnail is generated in `assets/thumbnails/<game-id>.svg` using two-letter initials + gradient.

## Security / Sandbox

Each game loads in an iframe with `sandbox="allow-scripts"`. No same-origin privileges; adjust if your games need more (e.g., storage APIs) by expanding sandbox flags carefully.

## Customization Ideas

- Add tag filtering
- Add favorites (localStorage)
- Add light mode by extending CSS variables

## License

Internal / private. No external license text added.
