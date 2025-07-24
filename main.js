// Load breaches on page load
document.addEventListener("DOMContentLoaded", () => {
  fetch('breaches.json')
    .then(response => response.json())
    .then(data => renderBreaches(data))
    .catch(error => {
      console.error("Error loading breaches:", error);
      document.getElementById("breachList").innerHTML = "<p>Could not load breaches.</p>";
    });
});

// Render breach entries as styled cards
function renderBreaches(breaches) {
  const breachList = document.getElementById("breachList");
  breachList.innerHTML = ''; // Clear existing

  breaches.forEach((entry, index) => {
    const card = document.createElement("li");
    card.className = "breach-card";
    card.innerHTML = `
      <h3>${entry.tag}</h3>
      <p><strong>Category:</strong> ${entry.category}</p>
      <p><strong>Aliases:</strong> ${entry.aliases.join(', ')}</p>
    `;
    breachList.appendChild(card);
  });
}

// Add or update a breach (UI only)
function addBreach() {
  const category = document.getElementById("category").value.trim();
  const tag = document.getElementById("tag").value.trim();
  const aliases = document.getElementById("aliases").value.split(',').map(a => a.trim()).filter(a => a);

  if (!category || !tag || aliases.length === 0) {
    alert("Please fill all fields including aliases.");
    return;
  }

  const newCard = document.createElement("li");
  newCard.className = "breach-card";
  newCard.innerHTML = `
    <h3>${tag}</h3>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Aliases:</strong> ${aliases.join(', ')}</p>
  `;

  document.getElementById("breachList").appendChild(newCard);

  // Reset form
  document.getElementById("category").value = '';
  document.getElementById("tag").value = '';
  document.getElementById("aliases").value = '';
}
