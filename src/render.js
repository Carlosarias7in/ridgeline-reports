// Block renderers. Each block in a report's JSON has a `type` that maps to one function here.
// All text is escaped. Nothing in a report file is trusted as HTML.

const esc = (v = '') =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const safeHref = (href = '') => (/^(https:\/\/|mailto:|tel:|\/|#)/i.test(href) ? esc(href) : '#');

const logo = (on, cls = 'logo') =>
  `<img class="${cls}" src="/brand/logo-on-${on}.png" alt="Ridgeline Labs" width="1625" height="445" />`;

// The ridge line from the logo: flat rule with two small peaks near the left.
const ridge = () =>
  `<svg class="ridge" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,21 150,21 200,7 250,15 300,5 350,21 1000,21" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;

const STATUS_LABEL = { good: 'Good', warn: 'Needs improvement', poor: 'Poor' };
const status = (s) => (STATUS_LABEL[s] ? s : 'warn');

const head = (b, eyebrow) => `
  <header class="section-head">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h2>${esc(b.heading)}</h2>
    ${b.intro ? `<p class="lede">${esc(b.intro)}</p>` : ''}
  </header>`;

const blocks = {
  hero(b, { meta }) {
    return `
    <section class="hero">
      <div class="wrap">
        ${logo('dark')}
        <p class="eyebrow eyebrow-dark">${esc(b.eyebrow ?? 'Website performance report')}</p>
        <h1>${esc(b.title ?? meta.company)}</h1>
        ${b.subtitle ? `<p class="hero-sub">${esc(b.subtitle)}</p>` : ''}
        <dl class="hero-meta">
          ${meta.industry ? `<div><dt>Industry</dt><dd>${esc(meta.industry)}</dd></div>` : ''}
          ${meta.location ? `<div><dt>Location</dt><dd>${esc(meta.location)}</dd></div>` : ''}
          ${meta.website ? `<div><dt>Website</dt><dd>${esc(meta.website)}</dd></div>` : ''}
          ${meta.prepared ? `<div><dt>Prepared</dt><dd>${esc(meta.prepared)}</dd></div>` : ''}
        </dl>
        ${ridge()}
      </div>
    </section>`;
  },

  kpis(b) {
    const items = (b.items ?? [])
      .map((k) => {
        const s = status(k.status);
        const pct = typeof k.value === 'number' && k.max ? Math.min(100, (k.value / k.max) * 100) : null;
        return `
        <article class="kpi kpi-${s}">
          <p class="kpi-label">${esc(k.label)}</p>
          <p class="kpi-value">${esc(k.value)}${k.unit ? `<span class="kpi-unit">${esc(k.unit)}</span>` : ''}</p>
          ${pct !== null ? `<div class="meter" role="img" aria-label="${esc(k.value)} out of ${esc(k.max)}"><span style="width:${pct}%"></span></div>` : ''}
          <p class="badge badge-${s}">${esc(k.statusLabel ?? STATUS_LABEL[s])}</p>
          ${k.note ? `<p class="kpi-note">${esc(k.note)}</p>` : ''}
        </article>`;
      })
      .join('');
    return `<section class="section"><div class="wrap">${b.heading ? head(b, b.eyebrow) : ''}<div class="kpi-grid">${items}</div></div></section>`;
  },

  findings(b) {
    const items = (b.items ?? [])
      .map(
        (f, i) => `
        <article class="finding">
          <p class="finding-n">${String(i + 1).padStart(2, '0')}</p>
          <div>
            <h3>${esc(f.title)}</h3>
            <p>${esc(f.body)}</p>
            ${f.evidence ? `<p class="evidence">${esc(f.evidence)}</p>` : ''}
          </div>
          ${f.severity ? `<p class="sev sev-${esc(f.severity)}">${esc(f.severity)}</p>` : ''}
        </article>`,
      )
      .join('');
    return `<section class="section section-surface"><div class="wrap">${head(b, b.eyebrow ?? 'What we found')}<div class="findings">${items}</div></div></section>`;
  },

  competitors(b) {
    const cols = b.columns ?? [];
    const rows = (b.rows ?? [])
      .map(
        (r) => `
        <tr class="${r.client ? 'is-client' : ''}">
          <th scope="row">${esc(r.name)}${r.client ? ' <span class="you">You</span>' : ''}</th>
          ${cols
            .map((_, i) => {
              const c = r.cells?.[i] ?? {};
              return `<td class="${c.status ? `cell-${status(c.status)}` : ''}">${esc(c.value ?? '')}</td>`;
            })
            .join('')}
        </tr>`,
      )
      .join('');
    return `
    <section class="section"><div class="wrap">
      ${head(b, b.eyebrow ?? 'Local competition')}
      <div class="table-scroll">
        <table class="compare">
          <thead><tr><th scope="col">${esc(b.rowLabel ?? 'Company')}</th>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${b.note ? `<p class="fine">${esc(b.note)}</p>` : ''}
    </div></section>`;
  },

  ai_visibility(b) {
    const LABEL = { mentioned: 'Named', partial: 'Mentioned, not recommended', absent: 'Not named' };
    const SIGN = { mentioned: '✓', partial: '–', absent: '✕' };
    const items = (b.engines ?? [])
      .map((e) => {
        const r = LABEL[e.result] ? e.result : 'absent';
        return `
        <article class="engine engine-${r}">
          <p class="engine-name">${esc(e.name)}</p>
          <p class="engine-result"><span class="sign" aria-hidden="true">${SIGN[r]}</span>${LABEL[r]}</p>
          ${e.query ? `<p class="engine-query">${esc(e.query)}</p>` : ''}
          ${e.note ? `<p class="engine-note">${esc(e.note)}</p>` : ''}
          ${
            e.image
              ? `<figure class="evidence-fig"><a href="${safeHref(e.image)}" target="_blank" rel="noopener"><img class="evidence-img" src="${safeHref(e.image)}" alt="${esc(e.imageAlt ?? `${e.name} results for the query: ${e.query ?? ''}`)}" loading="lazy" /></a><figcaption>Screenshot of the actual ${esc(e.name)} result. Click to enlarge.</figcaption></figure>`
              : ''
          }
        </article>`;
      })
      .join('');
    return `<section class="section section-surface"><div class="wrap">${head(b, b.eyebrow ?? 'AI visibility')}<div class="engines">${items}</div>${b.note ? `<p class="fine">${esc(b.note)}</p>` : ''}</div></section>`;
  },

  recommendations(b) {
    const items = (b.items ?? [])
      .map(
        (r, i) => `
        <li class="rec">
          <span class="rec-n">${i + 1}</span>
          <div>
            <h3>${esc(r.title)}</h3>
            <p>${esc(r.body)}</p>
            <p class="rec-meta">${r.impact ? `Impact: ${esc(r.impact)}` : ''}${r.impact && r.effort ? ' · ' : ''}${r.effort ? `Effort: ${esc(r.effort)}` : ''}</p>
          </div>
        </li>`,
      )
      .join('');
    return `<section class="section"><div class="wrap">${head(b, b.eyebrow ?? 'What we would do')}<ol class="recs">${items}</ol></div></section>`;
  },

  cta(b, { meta }) {
    const c = meta.contact ?? {};
    return `
    <section class="cta">
      <div class="wrap">
        <h2>${esc(b.heading)}</h2>
        ${b.body ? `<p class="lede">${esc(b.body)}</p>` : ''}
        ${b.button ? `<a class="button" href="${safeHref(b.button.href)}">${esc(b.button.label)}</a>` : ''}
        ${c.name ? `<p class="cta-for">Prepared for ${esc(c.name)}${c.role ? `, ${esc(c.role)}` : ''}, ${esc(meta.company)}.</p>` : ''}
        ${ridge()}
      </div>
    </section>`;
  },
};

export function renderReport(data) {
  const ctx = { meta: data.meta };
  const draft =
    data.meta.status === 'draft'
      ? `<p class="draft-bar">Draft. Some figures are placeholders and need verification before this goes out.</p>`
      : '';
  const body = (data.blocks ?? [])
    .map((b) => (blocks[b.type] ? blocks[b.type](b, ctx) : `<!-- unknown block: ${esc(b.type)} -->`))
    .join('');
  return `${draft}<main>${body}</main><footer class="footer"><div class="wrap">${logo('dark', 'logo logo-sm')}<p class="fine">This report was prepared for ${esc(data.meta.company)}. Please do not share the link.</p></div></footer>`;
}

export function renderMessage(title, body) {
  return `<main class="plain">${logo('light')}<h1 class="plain-title">${esc(title)}</h1><p class="plain-note">${esc(body)}</p></main>`;
}
