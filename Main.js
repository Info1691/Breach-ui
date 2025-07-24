let breaches = [];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("breachContainer");
  const addButton = document.getElementById("addButton");

  fetch("breaches.json")
    .then(res => res.json())
    .then(data => {
      breaches = data;
      renderBreaches();
    })
    .catch(err => console.error("Failed to load breaches.json", err));

  addButton.addEventListener("click", () => {
    const newBreach = {
      id: Date.now(),
      tag: "",
      description: ""
    };
    breaches.push(newBreach);
    renderBreaches();
  });

  function renderBreaches() {
    container.innerHTML = "";

    breaches.forEach((breach, index) => {
      const card = document.createElement("div");
      card.className = "card";

      const tagInput = document.createElement("input");
      tagInput.type = "text";
      tagInput.value = breach.tag;
      tagInput.placeholder = "Breach Tag (e.g., Misappropriation)";
      tagInput.oninput = (e) => breaches[index].tag = e.target.value;

      const descInput = document.createElement("textarea");
      descInput.placeholder = "Brief Description";
      descInput.value = breach.description;
      descInput.oninput = (e) => breaches[index].description = e.target.value;

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.onclick = () => saveBreaches();

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete");
      deleteBtn.onclick = () => {
        breaches.splice(index, 1);
        renderBreaches();
        saveBreaches();
      };

      card.appendChild(document.createTextNode("Tag:"));
      card.appendChild(tagInput);
      card.appendChild(document.createElement("br"));

      card.appendChild(document.createTextNode("Description:"));
      card.appendChild(descInput);
      card.appendChild(document.createElement("br"));

      card.appendChild(saveBtn);
      card.appendChild(deleteBtn);

      container.appendChild(card);
    });
  }

  function saveBreaches() {
    fetch("save-breaches.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(breaches)
    })
    .then(() => console.log("Breaches saved"))
    .catch(err => console.error("Save failed", err));
  }
});
