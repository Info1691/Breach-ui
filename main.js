/* Full, data-sided renderer for breaches.json with provenance */

async function loadBreaches() {
  // Load breaches.json from repo root; no dummy data used.
  const res = await fetch('./breaches.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch breaches.json: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('breaches.json must be an array');
  return data;
}

function el(tag, attrs={}, ...kids){
  const n = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const k of kids) n.append(k);
  return n;
}

function chip(txt){ return el('span',{class:'badge',text:txt}); }

function renderProvList(prov){
  if (!Array.isArray(prov) || prov.length === 0){
    return el('div',{class:'prov'}, el('div',{class:'prov-excerpt',text:'No sources yet.'}));
  }
  const ul = el('ul',{class:'prov-list'});
  for (const p of prov){
    const head = el('div',{class:'prov-head'},
      el('span',{class:'prov-type',text: (p.source_type||'treatise') }),
      el('span',{class:'prov-label',text: p.label || p.source_id || 'Source' }),
      el('span',{class:'prov-conf',text: ((+p.confidence||0)*100).toFixed(0)+'%' }),
    );
    const metaParts = [];
    if (p.block_id) metaParts.push(p.block_id);
    if (p.page != null) metaParts.push('p.'+p.page);
    if (p.line != null) metaParts.push('l.'+p.line);
    const meta = el('div',{class:'prov-meta',text: metaParts.join(' · ') || ''});
    const excerpt = el('div',{class:'prov-excerpt',text: p.excerpt || ''});
    const li = el('li',{class:'prov-item'}, head, meta, excerpt);
    ul.append(li);
  }
  return el('div',{class:'prov'}, ul);
}

function renderCard(b){
  const count = Array.isArray(b.provenance) ? b.provenance.length : 0;

  const headL = el('div',{}, el('div',{class:'title',text: b.tag || '(untitled)'}));
  const headR = el('div',{class:'badges'},
    chip(b.category || '—'),
    chip(`${count} source${count===1?'':'s'}`)
  );
  const head = el('div',{class:'card-head'}, headL, headR);

  const aliases = Array.isArray(b.aliases) && b.aliases.length
    ? el('div',{class:'aliases',text:'Aliases: '+b.aliases.join(', ')})
    : el('div',{class:'aliases',text:'Aliases: —'});

  const provBtn = el('button',{class:'btn small prov-btn',text:'Provenance'});
  const provBox = renderProvList(b.provenance);
  provBox.classList.add('hidden');
  provBtn.onclick = () => { provBox.classList.toggle('hidden'); };

  return el('div',{class:'card'}, head, aliases, provBtn, provBox);
}

function normalize(s){ return (s||'').toString().toLowerCase(); }

function matchesQuery(b, q){
  if (!q) return true;
  const hay = [
    b.tag || '',
    b.category || '',
    ...(Array.isArray(b.aliases)? b.aliases : [])
  ].join(' ').toLowerCase();
  return hay.includes(q);
}

function renderList(data, q){
  const list = document.getElementById('list');
  const empty = document.getElementById('empty');
  list.innerHTML = '';
  const qn = normalize(q);
  const results = data.filter(b => matchesQuery(b, qn));
  if (results.length === 0){
    empty.classList.remove('hidden'); return;
  }
  empty.classList.add('hidden');
  for (const b of results) list.append( renderCard(b) );
}

async function main(){
  try{
    const data = await loadBreaches();
    const q = document.getElementById('q');
    renderList(data, q.value);
    q.addEventListener('input', () => renderList(data, q.value));
  }catch(err){
    const list = document.getElementById('list');
    list.innerHTML = '';
    const div = el('div',{class:'empty', text:String(err.message||err)});
    list.append(div);
  }
}

document.addEventListener('DOMContentLoaded', main);
