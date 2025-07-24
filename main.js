document.addEventListener('DOMContentLoaded', () => {
  const categoryInput = document.getElementById('category');
  const tagInput = document.getElementById('tag');
  const aliasesInput = document.getElementById('aliases');
  const addButton = document.getElementById('add-btn');
  const tagList = document.getElementById('tag-list');

  // Load and display existing breach tags
  fetch('breaches.json')
    .then(response => response.json())
    .then(data => {
      tagList.innerHTML = ''; // Clear before rendering
      data.forEach((breach, index) => {
        const card = document.createElement('div');
        card.className = 'breach-card';
        card.innerHTML = `
          <h4>${breach.tag}</h4>
          <p><strong>Category:</strong> ${breach.category}</p>
          <p><strong>Aliases:</strong> ${breach.aliases.join(', ')}</p>
        `;
        tagList.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Failed to load breaches.json:', error);
    });

  // Add or update a breach (for display only, not persistent)
  addButton.addEventListener('click', () => {
    const category = categoryInput.value.trim();
    const tag = tagInput.value.trim();
    const aliases = aliasesInput.value.split(',').map(alias => alias.trim()).filter(Boolean);

    if (!category || !tag) {
      alert('Category and Canonical Tag are required.');
      return;
    }

    const card = document.createElement('div');
    card.className = 'breach-card';
    card.innerHTML = `
      <h4>${tag}</h4>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Aliases:</strong> ${aliases.join(', ')}</p>
    `;
    tagList.appendChild(card);

    // Clear fields
    categoryInput.value = '';
    tagInput.value = '';
    aliasesInput.value = '';
  });
});
