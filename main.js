/* Breach-ui full client script
 * Loads breaches.json (canonical tags) and breaches_ui.json (provenance),
 * renders cards with collapsible provenance tables, plus client-side filter.
 */

const FILE_CANON = "breaches.json";
const FILE_PROV  = "breaches_ui.json"; // produced by LTJ workflow & synced here

// -------- utilities
const qs  = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];
const norm = s => (s || "").toString().trim();
const lower = s => norm(s).toLowerCase();
const uniq = arr => [...new Set(arr.filter(Boolean))];
const byAlpha = (a, b) => a.localeCompare(b, undefined, {sensitivity: "base"});

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function safeLink(href, text) {
  if (!href) return text || "";
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = text || href;
  return a.outerHTML;
}

// -------- data loading
async function getJSON(path) {
  const url = `${path}?v=${Date.now()}`; // cache-bust on hard refresh
  const res = await fetch(url, {cache: "no-store"});
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

async function loadData() {
  // breaches.json is required; breaches_ui.json is optional
  const [canon, provMaybe] = await Promise.allSettled([
    getJSON(FILE_CANON),
    getJSON(FILE_PROV)
  ]);

  if (canon.status !== "fulfilled") {
    throw new Error(`Cannot load ${FILE_CANON}: ${canon.reason}`);
  }

  const canonical = canon.value || [];
  const provenance = (provMaybe.status === "fulfilled" ? provMaybe.value : []) || [];

  // Normalize canonical list
  const canonNorm = canonical.map(x => ({
    category: norm(x.category),
    tag: norm(x.tag),
    tag_lc: lower(x.tag),
    aliases: uniq(asArray(x.aliases).map(norm)).filter(Boolean)
  }));

  // Index provenance by canonical tag (case-insensitive)
  // Accept either a flat list with .tag, or an object {tag, sources:[...]}, or {tag, provenance:[...]}
  const provMap = new Map();
  for (const item of provenance) {
    const key = lower(item.tag || item.canonical || "");
    if (!key) continue;
    const entries = [];

    if (Array.isArray(item.provenance)) entries.push(...item.provenance);
    if (Array.isArray(item.sources)) entries.push(...item.sources);
    // tolerate single "provenance" object too
    if (!entries.length && item.provenance && typeof item.provenance === "object") {
      entries.push(item.provenance);
    }

    // Normalise each entry
    const normEntries = entries.map(e => ({
      source: norm(e.source || e.kind || e.type || ""),
      citation: norm(e.citation || e.id || e.ref || ""),
      title: norm(e.title || ""),
      jurisdiction: norm(e.jurisdiction || ""),
      page: norm(e.page || e.page_no || ""),
      line: norm(e.line || e.line_no || ""),
      score: typeof e.score === "number" ? e.score : (e.score ? Number(e.score) : ""),
      snippet: norm(e.snippet || e.text || ""),
      url: norm(e.url || e.href || "")
    })).filter(x => Object.values(x).some(Boolean));

    provMap.set(key, normEntries);
  }

  return { canonical: canonNorm, provMap };
}

// -------- rendering
function renderCards(data) {
  const root = qs("#cards");
  root.innerHTML = "";

  const sorted = [...data.canonical].sort((a,b) => byAlpha(a.tag, b.tag));

  for (const item of sorted) {
    root.appendChild(renderCard(item, data.provMap));
  }
}

function renderCard(item, provMap) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.tag = item.tag_lc;
  card.dataset.category = lower(item.category);
  card.dataset.aliases = item.aliases.map(lower).join(" ");

  const prov = provMap.get(item.tag_lc) || [];

  // header
  const head = document.createElement("div");
  head.className = "card-head";
  head.innerHTML = `
    <h3 class="tag-title">${escapeHTML(item.tag)}</h3>
    <div class="meta">
      <span class="badge category">${escapeHTML(item.category || "Uncategorised")}</span>
      <span class="badge count" title="Provenance entries">${prov.length} source${prov.length===1?"":"s"}</span>
    </div>
  `;

  // aliases
  const aliases = document.createElement("div");
  aliases.className = "aliases";
  aliases.innerHTML = `
    <span class="dim">Aliases:</span>
    ${item.aliases.length ? escapeHTML(item.aliases.join(", ")) : "<span class='muted'>—</span>"}
  `;

  // provenance section (collapsible)
  const provWrap = document.createElement("div");
  provWrap.className = "prov";
  const provId = `prov-${hash(item.tag)}`;

  const hasProv = prov.length > 0;
  provWrap.innerHTML = `
    <details ${hasProv ? "" : ""} id="${provId}">
      <summary>Provenance</summary>
      ${renderProvenanceTable(prov)}
    </details>
  `;

  card.append(head, aliases, provWrap);
  return card;
}

function renderProvenanceTable(rows) {
  if (!rows || !rows.length) {
    return `<div class="prov-empty">No provenance linked yet.</div>`;
  }

  // sort by (jurisdiction desc Jersey first), then score desc
  const sorted = [...rows].sort((a,b) => {
    const aj = (a.jurisdiction || "").toLowerCase();
    const bj = (b.jurisdiction || "").toLowerCase();
    if (aj.includes("jersey") !== bj.includes("jersey")) return aj.includes("jersey") ? -1 : 1;
    const as = Number.isFinite(a.score) ? a.score : -Infinity;
    const bs = Number.isFinite(b.score) ? b.score : -Infinity;
    return bs - as;
  });

  const head = `
    <thead>
      <tr>
        <th>Jurisdiction</th>
        <th>Source</th>
        <th>Case / Citation</th>
        <th>Page</th>
        <th>Line</th>
        <th>Score</th>
      </tr>
    </thead>`;

  const body = sorted.map(r => `
    <tr>
      <td>${escapeHTML(r.jurisdiction || "")}</td>
      <td>${escapeHTML(r.source || "")}</td>
      <td>${r.url ? safeLink(r.url, r.citation || r.title || "link") : escapeHTML(r.citation || r.title || "")}</td>
      <td>${escapeHTML(r.page || "")}</td>
      <td>${escapeHTML(r.line || "")}</td>
      <td>${r.score === "" || r.score == null ? "" : escapeHTML(String(r.score))}</td>
    </tr>
    ${r.snippet ? `<tr class="snippet-row"><td colspan="6"><div class="snippet">${escapeHTML(r.snippet)}</div></td></tr>` : ""}
  `).join("");

  return `<div class="table-wrap"><table class="prov-table">${head}<tbody>${body}</tbody></table></div>`;
}

// -------- filtering
function attachFilter() {
  const input = qs("#filterBox");
  const cards = () => qsa(".card");

  function apply() {
    const q = lower(input.value);
    if (!q) {
      cards().forEach(c => c.classList.remove("hide"));
      return;
    }
    const parts = q.split(/\s+/).filter(Boolean);
    cards().forEach(c => {
      const hay = [
        c.dataset.tag,
        c.dataset.category,
        c.dataset.aliases
      ].join(" ");
      const ok = parts.every(p => hay.includes(p));
      c.classList.toggle("hide", !ok);
    });
  }

  input.addEventListener("input", apply);
}

// -------- helpers
function escapeHTML(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&nbsp;&amp;','<':'&nbsp;&lt;','>':'&nbsp;&gt;','"':'&quot;'}[c]).replace("&nbsp;",""));
}

// small deterministic hash for element IDs
function hash(s) {
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

// -------- boot
(async function init() {
  try {
    const data = await loadData();
    renderCards(data);
    attachFilter();
  } catch (err) {
    console.error(err);
    qs("#cards").innerHTML = `
      <div class="error">
        <strong>Failed to load data.</strong><br/>
        ${escapeHTML(err.message || err)}
      </div>`;
  }
})();
