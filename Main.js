const breachForm = document.getElementById("breach-form");
const breachInput = document.getElementById("new-breach");
const breachList = document.getElementById("breach-list");

// Load existing breaches from localStorage
window.onload = () => {
  const stored = JSON.parse(localStorage.getItem("breachTags") || "[]");
  stored.forEach(addBreachToDOM);
};

breachForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const value = breachInput.value.trim();
  if (!value) return;
  addBreachToDOM(value);
  storeBreach(value);
  breachInput.value = "";
});

function addBreachToDOM(breach) {
  const li = document.createElement("li");
  li.textContent = breach;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => {
    breachList.removeChild(li);
    deleteBreach(breach);
  };

  li.appendChild(deleteBtn);
  breachList.appendChild(li);
}

function storeBreach(breach) {
  const tags = JSON.parse(localStorage.getItem("breachTags") || "[]");
  if (!tags.includes(breach)) {
    tags.push(breach);
    localStorage.setItem("breachTags", JSON.stringify(tags));
  }
}

function deleteBreach(breach) {
  const tags = JSON.parse(localStorage.getItem("breachTags") || "[]");
  const updated = tags.filter(tag => tag !== breach);
  localStorage.setItem("breachTags", JSON.stringify(updated));
}
