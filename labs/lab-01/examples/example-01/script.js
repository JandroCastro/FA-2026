function addItem(text, type) {
  const li = document.createElement("li");
  li.textContent = text;
  li.classList.add("output-item", `output-item--${type}`);
  document.getElementById("output").appendChild(li);
}

function runDemo() {
  document.getElementById("output").innerHTML = "";

  addItem("1 · Síncrono — Call Stack", "sync");

  setTimeout(() => {
    addItem("2 · setTimeout(fn, 0) — llega después del stack", "macro");
  }, 0);

  addItem("3 · Síncrono — Call Stack", "sync");
}

function runQueues() {
  document.getElementById("output").innerHTML = "";

  addItem("1 · Síncrono", "sync");

  setTimeout(() => addItem("2 · macrotask — setTimeout", "macro"), 0);

  Promise.resolve()
    .then(() => addItem("3 · microtask A — Promise", "micro"))
    .then(() => addItem("4 · microtask B — .then()", "micro"));

  addItem("5 · Síncrono", "sync");
}
