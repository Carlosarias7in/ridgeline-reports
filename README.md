# ridgeline-reports

Personalized website performance reports for Ridgeline Labs prospects.
Each report lives at `/for/<slug>` and is private (`noindex` via meta tag, `X-Robots-Tag` header and `robots.txt`).

Stack: Vite, vanilla JS, Netlify.

## Run

```bash
npm install
npm run dev     # then open http://localhost:5173/for/mondragon-mechanical
npm run build
```

## Add a report

1. Copy `data/_template.json` to `data/reports/<slug>.json`. The filename is the URL slug (lowercase, letters, numbers, hyphens).
2. Fill in `meta` and the blocks you need. Blocks render in the order listed. Drop any you do not need.
3. Set `meta.status` to `"final"` when the numbers are verified. While it is `"draft"`, a banner shows at the top.
4. Commit and push. Netlify deploys it.

## Blocks

`hero`, `snapshot`, `kpis`, `metrics`, `gallery`, `findings`, `competitors`, `ai_visibility`, `recommendations`, `cta`.
Renderers live in `src/render.js`. To add a block type, add a function there. Nothing else changes.

## Design

Tokens are CSS variables at the top of `src/styles.css`. Fonts (Geist, Geist Mono) load from Google Fonts.
Copy rules: quiet, plainspoken, short sentences, no em dashes, no jargon.

## Privacy notes

- Reports are separate files, loaded one at a time by slug. One report never ships inside another's page.
- The link is the only access control. Anyone with the URL can read the report. Use hard-to-guess slugs if that matters, or add Netlify password protection.
- All text from JSON is escaped before rendering.

## Screenshots

AI visibility screenshots go in `public/images/ai/` and are referenced from the JSON as `"image": "/images/ai/<file>.png"`.
Shared filenames apply to every report, so for a second client use a subfolder, like `/images/ai/<slug>/chatgpt.png`.
A missing file hides its figure instead of showing a broken image.

PageSpeed screenshots go in `public/images/pagespeed/` and the homepage screenshot in `public/images/site/` (cut a long page into 2 or 3 parts so each reads at a glance). Every image in the report opens in the lightbox when clicked.
