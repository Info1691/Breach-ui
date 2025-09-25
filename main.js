async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

function normaliseSources(entry) {
  // Accept either `sources` or `provenance`
  const list = Array.isArray(entry.sources) ? entry.sources
              : Array.isArray(entry.provenance) ? entry.provenance
              : [];
  // Light normalisation (defensive)
  return list.map(s => ({
    ref: (s.ref || s.id || s.case_id || "").toString(),
    label: s.label || s.case_name || "",
    book: s.book || s.book_id || "",
    page: s.page || "",
    line: s.line || s.loc || "",
    rule: s.rule || "",
    statute: s.statute || "",
    score: s.score != null ? s.score : "",
    snippet: s.snippet || s.note || ""
  }));
}

function badge(text) {
  const span = document.createElement('span');
  span.className = 'badge';
  span.textContent = text;
  return span;
}

function makeProvenance(details, sources) {
  const wrapper = document.createElement('div');
  wrapper.className = 'prov-wrapper';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'prov-toggle';
  btn.textContent = 'Provenance';
  details.appendChild(btn);

  const panel = document.createElement('div');
  panel.className = 'prov-panel';
  if (!sources.length) {
    panel.innerHTML = `<div class="prov-empty">No sources yet.</div>`;
  } else {
    const ul = document.createElement('ul');
    ul.className = 'prov-list';
    for (const s of sources) {
      const li = document.createElement('li');
      const head = [];
      if (s.label) head.push(s.label);
      if (s.ref) head.push(`(${s.ref})`);
      const meta = [];
      if (s.book) meta.push(`book: ${s.book}`);
      if (s.page) meta.push(`page: ${s.page}`);
      if (s.line) meta.push(`line: ${s.line}`);
      if (s.rule) meta.push(`rule: ${s.rule}`);
      if (s.statute) meta.push(`statute: ${s.statute}`);
      if (s.score !== "") meta.push(`score: ${s.score}`);
      li.innerHTML = `
        <div class="prov-head">${head.join(' ')}</div>
        ${meta.length ? `<div class="prov-meta">${meta.join(' · ')}</div>` : ''}
        ${s.snippet ? `<div class="prov-snippet">“${s.snippet}”</div>` : ''}
      `;
      ul.appendChild(li);
    }
    panel.appendChild(ul);
  }
  wrapper.appendChild(panel);

  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  return wrapper;
}

function renderBreach(entry) {
  const card = document.createElement('div');
  card.className = 'breach-card';

  const title = document.createElement('div');
  title.className = 'breach-title';
  title.textContent = entry.tag || '(untitled)';
  card.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'breach-sub';
  const aliases = Array.isArray(entry.aliases) ? entry.aliases.join(', ') : '';
  sub.textContent = aliases ? `Aliases: ${aliases}` : '';
  card.appendChild(sub);

  const meta = document.createElement('div');
  meta.className = 'breach-meta';
  if (entry.category) meta.appendChild(badge(entry.category));
  const srcs = normaliseSources(entry);
  meta.appendChild(badge(`${srcs.length} ${srcs.length === 1 ? 'source' : 'sources'}`));
  card.appendChild(meta);

  const prov = document.createElement('div');
  prov.className = 'breach-prov';
  prov.appendChild(makeProvenance(prov, srcs));
  card.appendChild(prov);

  return card;
}

async function boot() {
  const container = document.getElementById('breach-list');
  container.innerHTML = '';

  const data = await fetchJSON('breaches.json');
  // sort: category, tag
  data.sort((a, b) => {
    const ca = (a.category || '').toLowerCase(), cb = (b.category || '').toLowerCase();
    if (ca !== cb) return ca < cb ? -1 : 1;
    const ta = (a.tag || '').toLowerCase(), tb = (b.tag || '').toLowerCase();
    return ta < tb ? -1 : (ta > tb ? 1 : 0);
  });

  for (const entry of data) {
    container.appendChild(renderBreach(entry));
  }
}

document.addEventListener('DOMContentLoaded', boot);
