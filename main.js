async function loadBreaches() {
  try {
    const res = await fetch('breaches.json');
    const breaches = await res.json();

    const tagList = document.getElementById('tag-list');
    tagList.innerHTML = '';

    breaches.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'breach-item';

      div.innerHTML = `
        <h3>${entry.tag}</h3>
        <p><strong>Category:</strong> ${entry.category}</p>
        <p><strong>Aliases:</strong> ${entry.aliases.join(', ')}</p>
      `;

      tagList.appendChild(div);
    });
  } catch (e) {
    console.error("Failed to load breach tags:", e);
  }
}

function addBreach() {
  const category = document.getElementById('category').value.trim();
  const tag = document.getElementById('tag').value.trim();
  const aliases = document.getElementById('aliases').value.split(',').map(s => s.trim()).filter(Boolean);

  if (!category || !tag) return alert("Both Category and Canonical Tag are required.");

  const newEntry = {
    category,
    tag,
    aliases
  };

  console.log("New breach to be added (not persisted):", newEntry);
  alert("This UI does not yet persist changes. Add functionality coming soon.");
}

window.onload = loadBreaches;
