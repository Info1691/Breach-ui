let breachData = [];

async function fetchBreaches() {
  try {
    const response = await fetch("breaches.json");
    if (!response.ok) throw new Error("Failed to load breaches");
    breachData = await response.json();
    renderBreaches();
  } catch (err) {
    console.error("Error loading breaches:", err);
  }
}

function renderBreaches() {
  const list = document.getElementById("breachList");
  list.innerHTML = "";
  breachData.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Category:</strong> ${item.category} |
                    <strong>Tag:</strong> ${item.tag} |
                    <strong>Aliases:</strong> ${item.aliases.join(", ")}`;
    list.appendChild(li);
  });
}

function addBreach() {
  const category = document.getElementById("category").value.trim();
  const tag = document.getElementById("tag").value.trim();
  const aliases = document
    .getElementById("aliases")
    .value.split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!category || !tag) {
    alert("Category and Tag are required.");
    return;
  }

  const index = breachData.findIndex(
    (b) => b.tag.toLowerCase() === tag.toLowerCase()
  );

  if (index >= 0) {
    breachData[index] = { category, tag, aliases };
  } else {
    breachData.push({ category, tag, aliases });
  }

  renderBreaches();
  document.getElementById("category").value = "";
  document.getElementById("tag").value = "";
  document.getElementById("aliases").value = "";
}

window.onload = fetchBreaches;
