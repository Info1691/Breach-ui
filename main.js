document.addEventListener('DOMContentLoaded', () => {
  const categoryInput = document.getElementById('category');
  const canonicalInput = document.getElementById('canonicalTag');
  const aliasesInput = document.getElementById('aliases');
  const tagList = document.getElementById('tagList');
  const addBtn = document.getElementById('addBtn');

  let breachTags = [];

  // Load from breaches.json
  fetch('breaches.json')
    .then(response => response.json())
    .then(data => {
      breachTags = data;
      renderTags();
    });

  addBtn.addEventListener('click', () => {
    const category = categoryInput.value.trim();
    const canonical = canonicalInput.value.trim();
    const aliases = aliasesInput.value.split(',').map(a => a.trim()).filter(Boolean);

    if (!category || !canonical) {
      alert('Category and Canonical Tag are required.');
      return;
    }

    const index = breachTags.findIndex(tag => tag.canonical.toLowerCase() === canonical.toLowerCase());
    if (index > -1) {
      breachTags[index] = { category, canonical, aliases };
    } else {
      breachTags.push({ category, canonical, aliases });
    }

    renderTags();
    categoryInput.value = '';
    canonicalInput.value = '';
    aliasesInput.value = '';
  });

  function renderTags() {
    tagList.innerHTML = '';
    breachTags.forEach(tag => {
      const div = document.createElement('div');
      div.className = 'breach-entry';
      div.innerHTML = `
        <strong>Category:</strong> ${tag.category}<br>
        <strong>Canonical:</strong> ${tag.canonical}<br>
        <strong>Aliases:</strong> ${tag.aliases.join(', ')}
      `;
      tagList.appendChild(div);
    });
  }
});
