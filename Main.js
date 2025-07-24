let breaches = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("breaches.json")
    .then(res => res.json())
    .then(data => {
      breaches = data;
      renderList();
    })
    .catch(() => {
      breaches = [];
      renderList();
    });

  document.getElementById("addButton").addEventListener("click", () => {
    const input = document.getElementById("newBreachInput");
    const value = input.value.trim();
    if (value) {
      breaches.push(value);
      input.value = "";
      renderList();
    }
  });

  document.getElementById("exportButton").addEventListener("click", saveBreaches);
});

function renderList() {
  const list = document.getElementById("breachList");
  list.innerHTML = "";

  breaches.forEach((tag, index) => {
    const li = document.createElement("li");

    const input = document.createElement("input");
    input.type = "text";
    input.value = tag;
    input.addEventListener("change", () => {
      breaches[index] = input.value.trim();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      breaches.splice(index, 1);
      renderList();
    });

    li.appendChild(input);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function saveBreaches() {
  const blob = new Blob([JSON.stringify(breaches, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "breaches.json";
  a.click();
  URL.revokeObjectURL(url);
}
