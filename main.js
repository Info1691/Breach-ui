let breachTags = [];

function loadTags() {
  fetch('breaches.json')
    .then(response => response.json())
    .then(data => {
      breachTags = data;
      renderTags();
    })
    .catch(error => {
      console.error('Failed to load breach tags:', error);
    });
}

function renderTags() {
  const list = document.getElementById('tag-list');
  list.innerHTML = '';

  breachTags.forEach(tag => {
    const card = document.createElement('div');
    card.className = 'tag-card';

    const title = document.createElement('h3');
    title.textContent = `Breach of ${tag.tag.toLowerCase()}`;

    const category = document.createElement('p');
    category.innerHTML = `<strong>Category:</strong> ${tag.category}`;

    const aliases = document.createElement('p');
    aliases.innerHTML = `<strong>Aliases:</strong> ${tag.aliases.join(', ')}`;

    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(aliases);
    list.appendChild(card);
  });
}

function addBreach() {
  const category = document.getElementById('category').value.trim();
  const tag = document.getElementById('tag').value.trim();
  const aliases = document.getElementById('aliases').value.split(',').map(a => a.trim()).filter(Boolean);

  if (!category || !tag) {
    alert('Both Category and Canonical Tag are required.');
    return;
  }

  const existing = breachTags.find(t => t.tag.toLowerCase() === tag.toLowerCase());
  if (existing) {
    existing.category = category;
    existing.aliases = aliases;
  } else {
    breachTags.push({ category, tag, aliases });
  }

  renderTags();
}

window.onload = loadTags;
