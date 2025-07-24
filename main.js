// Load breach data from JSON and display
window.onload = async () => {
  try {
    const response = await fetch('breaches.json');
    const breaches = await response.json();
    breaches.forEach(addBreachCard);
  } catch (error) {
    console.error("Failed to load breaches:", error);
  }
};

function addBreachCard(breach) {
  const list = document.getElementById("tag-list");

  const card = document.createElement("div");
  card.className = "tag-card";

  const title = document.createElement("strong");
  title.innerText = `Breach of ${breach.tag.toLowerCase()}`;

  const category = document.createElement("p");
  category.innerHTML = `<strong>Category:</strong> ${breach.category}`;

  const aliases = document.createElement("p");
  aliases.innerHTML = `<strong>Aliases:</strong> ${breach.aliases.join(", ")}`;

  card.appendChild(title);
  card.appendChild(category);
  card.appendChild(aliases);

  list.appendChild(card);
}

// Add new breach entry
function addBreach() {
  const category = document.getElementById("category").value.trim();
  const tag = document.getElementById("tag").value.trim();
  const aliases = document.getElementById("aliases").value.trim().split(',').map(s => s.trim());

  if (!category || !tag) {
    alert("Category and Canonical Tag are required.");
    return;
  }

  const breach = { category, tag, aliases };
  addBreachCard(breach);

  // Clear fields
  document.getElementById("category").value = "";
  document.getElementById("tag").value = "";
  document.getElementById("aliases").value = "";
}
