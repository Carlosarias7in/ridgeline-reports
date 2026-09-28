import './styles.css';
import { renderReport, renderMessage } from './render.js';
import { initLightbox } from './lightbox.js';

// Lazy glob: each report becomes its own chunk, fetched only when its slug is requested.
const reports = import.meta.glob('/data/reports/*.json', { import: 'default' });

const app = document.getElementById('app');
initLightbox(app);

function getSlug() {
  const match = location.pathname.match(/^\/for\/([a-z0-9-]+)\/?$/i);
  if (match) return match[1].toLowerCase();
  // Fallback for opening report.html directly in dev: /report.html?slug=name
  return new URLSearchParams(location.search).get('slug')?.toLowerCase() ?? null;
}

async function boot() {
  const slug = getSlug();
  const load = slug && reports[`/data/reports/${slug}.json`];

  if (!load) {
    document.title = 'Report not found | Ridgeline Labs';
    app.innerHTML = renderMessage('We could not find this report.', 'Check the link you were given, or reply to the email it came in.');
    return;
  }

  try {
    const data = await load();
    document.title = `${data.meta.company} | Ridgeline Labs Report`;
    app.innerHTML = renderReport(data);
    // If a screenshot file is missing, drop the figure rather than show a broken image.
    app.querySelectorAll('.evidence-img').forEach((img) =>
      img.addEventListener('error', () => img.closest('.evidence-fig')?.remove()),
    );
  } catch (err) {
    console.error(err);
    app.innerHTML = renderMessage('This report did not load.', 'Refresh the page. If it keeps happening, let us know.');
  }
}

boot();
