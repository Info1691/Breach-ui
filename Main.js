const form = document.getElementById("breach-form");
const breachList = document.getElementById("breach-list");

window.onload = () => {
  const stored = JSON.parse(localStorage.getItem("breachTags") || "[]");
  stored.forEach(addToList);
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const category = document.getElementById("category").value.trim();
  const canonical = document.getElementById("canonical").value.trim();
  const aliases = document.getElementById("aliases").value.trim().split(",").map(a => a.trim());

  if (!category || !canonical) return;

  const breach = { category, canonical, aliases };
  let breaches = JSON.parse(localStorage.getItem("breachTags") || "[]");

  // Remove if already exists
  breaches = breaches.filter(b => b.canonical !== canonical);
  breaches.push(breach);
  localStorage.setItem("breachTags", JSON.stringify(breaches));

  updateList(breaches);
  form.reset();
});

function updateList(breaches) {
  breachList.innerHTML = "";
  breaches.forEach(addToList);
}

function addToList(breach) {
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${breach.category}</strong> - ${breach.canonical}
    <br><em>Aliases:</em> ${breach.aliases.join(", ")}
    <button onclick="deleteTag('${breach.canonical}')">Delete</button>
  `;
  breachList.appendChild(li);
}

function deleteTag(canonical) {
  let breaches = JSON.parse(localStorage.getItem("breachTags") || "[]");
  breaches = breaches.filter(b => b.canonical !== canonical);
  localStorage.setItem("breachTags", JSON.stringify(breaches));
  updateList(breaches);
}
