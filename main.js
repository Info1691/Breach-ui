/* Breach-ui viewer: renders breaches.json with provenance (no snippets). */

(function () {
  const LIST_EL = document.getElementById('breach-list');
  const FILTER_EL = document.getElementById('filter');
  const META_EL = document.getElementById('meta');

  let BREACHES = [];

  async function loadBreaches() {
    // Cache bust to avoid GH Pages CDN staleness after CI publishes
    const url = `breaches.json?cb=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('breaches.json must be an array');
    return data;
  }

  function matchesFilter(item, q) {
    if (!q) return true;
    const hay = [
      item.tag || '',
      item.category || '',
      ...(item.aliases || [])
    ].join(' ').toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function fmtScore(x) {
    return typeof x === 'number' ? x.toFixed(3) : '';
  }

  function renderCaseList(sources) {
    if (!Array.isArray(sources) || sources.length === 0) {
      return `<p class="muted">No supporting cases recorded.</p>`;
    }
    const rows = sources.map(s => {
      const id = s.id || '';
      const score = fmtScore(s.score);
      return `
        <li class="kv">
          <code class="cid">${id}</code>
          <span class="badge">score ${score}</span>
        </li>`;
    });
    return `<ul class="kv-list">${rows.join('')}</ul>`;
  }

  function renderStatuteList(stats) {
    if (!Array.isArray(stats) || stats.length === 0) {
      return `<p class="muted">No statutes linked.</p>`;
    }
    const rows = stats.map(st => `
      <li class="kv">
        <span class="stat">${st.id || ''}</span>
        <span class="badge">score ${fmtScore(st.score)}</span>
      </li>
    `);
    return `<ul class="kv-list">${rows.join('')}</ul>`;
  }

  function card(item) {
    const aliases = (item.aliases || []).join(', ');
    // Use <details> to keep provenance folded by default
    return `
      <article class="card">
        <h3 class="tag">${item.tag || ''}</h3>
        <div class="meta">
          <div><span class="label">Category:</span> ${item.category || ''}</div>
          <div><span class="label">Aliases:</span> ${aliases || '<span class="muted">—</span>'}</div>
        </div>

        <details class="prov">
          <summary>Provenance</summary>
          <div class="prov-grid">
            <section>
              <h4>Supporting cases</h4>
              ${renderCaseList(item.sources)}
            </section>
            <section>
              <h4>Statutes</h4>
              ${renderStatuteList(item.statutes)}
            </section>
          </div>
        </details>
      </article>
    `;
  }

  function render(list) {
    LIST_EL.innerHTML = list.map(card).join('') || `<p class="muted">No breaches.</p>`;
    META_EL.textContent = `${list.length} breach tags • provenance shown without snippets`;
  }

  function onFilter() {
    const q = FILTER_EL.value.trim();
    const view = BREACHES.filter(b => matchesFilter(b, q));
    render(view);
  }

  async function boot() {
    try {
      BREACHES = await loadBreaches();
      // Deterministic sort: tag asc
      BREACHES.sort((a, b) => (a.tag || '').localeCompare(b.tag || ''));
      render(BREACHES);
    } catch (err) {
      LIST_EL.innerHTML = `<p class="error">Error: ${String(err)}</p>`;
      console.error(err);
    }
  }

  FILTER_EL.addEventListener('input', onFilter);
  boot();
})();
