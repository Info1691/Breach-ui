document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addBreachForm");
  const categoryInput = document.getElementById("category");
  const tagInput = document.getElementById("tag");
  const aliasesInput = document.getElementById("aliases");
  const breachContainer = document.getElementById("breachContainer");

  let breachTags = [];

  // Load breaches from localStorage
  function loadBreaches() {
    const saved = localStorage.getItem("breachTags");
    breachTags = saved ? JSON.parse(saved) : [];
    renderBreaches();
  }

  // Render breach tags
  function renderBreaches() {
    breachContainer.innerHTML = '';
    breachTags.forEach((entry, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Category:</strong> ${entry.category}<br>
        <strong>Tag:</strong> ${entry.tag}<br>
        <strong>Aliases:</strong> ${entry.aliases.join(", ")}
      `;

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => {
        breachTags.splice(index, 1);
        saveBreaches();
      };

      li.appendChild(delBtn);
      breachContainer.appendChild(li);
    });
  }

  // Save to localStorage
  function saveBreaches() {
    localStorage.setItem("breachTags", JSON.stringify(breachTags));
    renderBreaches();
  }

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const category = categoryInput.value.trim();
    const tag = tagInput.value.trim();
    const aliases = aliasesInput.value.split(",").map(a => a.trim()).filter(a => a);

    if (!category || !tag) return;

    const existing = breachTags.find(b => b.tag.toLowerCase() === tag.toLowerCase());
    if (existing) {
      existing.category = category;
      existing.aliases = aliases;
    } else {
      breachTags.push({ category, tag, aliases });
    }

    saveBreaches();
    form.reset();
  });

  loadBreaches();
});
