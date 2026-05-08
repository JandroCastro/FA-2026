// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  const el = document.getElementById(outId);
  if (!el) return;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent = "[" + ts + "]\n" + msg;
}

function flash(el) {
  if (!el) return;
  el.classList.add("flash-box");
  setTimeout(() => el.classList.remove("flash-box"), 350);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — target vs currentTarget
// ─────────────────────────────────────────────────────────────────────────────

const outer = document.getElementById("outer");
const middle = document.getElementById("middle");
const inner = document.getElementById("inner");
const out1 = document.getElementById("out-s1");

// Formatea una línea del recorrido del evento
function bubbleLine(label, targetId, ctId) {
  const isOrigin = targetId === ctId;
  return (
    "⬆  " +
    label.padEnd(8) +
    "│ target: #" +
    targetId.padEnd(10) +
    "│ currentTarget: #" +
    ctId +
    (isOrigin ? "  ← origen" : "")
  );
}

// e.timeStamp es el mismo para todos los listeners de un mismo evento:
// lo usamos para detectar cuándo empieza un click nuevo y reiniciar la salida.
let lastS1Ts = -1;

function s1Init(e) {
  if (e.timeStamp === lastS1Ts) return;
  lastS1Ts = e.timeStamp;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  out1.textContent =
    "[" +
    ts +
    "] Click en #" +
    e.target.id +
    "\n" +
    "──────────────────────────────────────────────────\n";
  window.lastClickEvent = e;
}

inner.addEventListener("click", function (e) {
  s1Init(e);
  out1.textContent +=
    bubbleLine("inner", e.target.id, e.currentTarget.id) + "\n";
  flash(inner);
});

middle.addEventListener("click", function (e) {
  s1Init(e);
  out1.textContent +=
    bubbleLine("middle", e.target.id, e.currentTarget.id) + "\n";
  flash(middle);
});

outer.addEventListener("click", function (e) {
  s1Init(e);
  out1.textContent +=
    bubbleLine("outer", e.target.id, e.currentTarget.id) + "\n";
  out1.textContent += "─ continúa hacia document y window\n\n";
  out1.textContent += "Prueba en consola:\n";
  out1.textContent += "  window.lastClickEvent.target.id\n";
  out1.textContent +=
    "  window.lastClickEvent.currentTarget  → null (el dispatch ya terminó)";
  flash(outer);
});

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — stopPropagation
// ─────────────────────────────────────────────────────────────────────────────

const outer2 = document.getElementById("outer2");
const middle2 = document.getElementById("middle2");
const inner2 = document.getElementById("inner2");
const stopToggle = document.getElementById("stop-toggle");
const stopStatus = document.getElementById("stop-status");
const stopBadge = document.getElementById("stop-badge");
const out2 = document.getElementById("out-s2");

// El toggle de stopPropagation. Por defecto, stopPropagation está desactivado.
let stopEnabled = false;
let lastS2Ts = -1;

stopToggle.addEventListener("change", function () {
  stopEnabled = this.checked;
  window.stopPropagationEnabled = stopEnabled;

  stopStatus.textContent = stopEnabled ? "activado" : "desactivado";
  stopStatus.style.color = stopEnabled ? "#fca5a5" : "";
  stopBadge.style.display = stopEnabled ? "inline-block" : "none";

  log(
    "out-s2",
    "stopPropagation " +
      (stopEnabled ? "activado" : "desactivado") +
      " en #middle.\n" +
      "Haz click en el recuadro interior.",
  );
});

function s2Init(e) {
  if (e.timeStamp === lastS2Ts) return;
  lastS2Ts = e.timeStamp;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  out2.textContent =
    "[" +
    ts +
    "] Click en #" +
    e.target.id +
    "\n" +
    "──────────────────────────────────────────────────\n";
}

inner2.addEventListener("click", function (e) {
  s2Init(e);
  out2.textContent += "⬆  inner    │ dispara ✅\n";
  flash(inner2);
});

middle2.addEventListener("click", function (e) {
  s2Init(e);
  if (stopEnabled) {
    e.stopPropagation();
    out2.textContent +=
      "⬆  middle   │ dispara ✅  →  stopPropagation() llamado\n\n";
    out2.textContent += "🛑 #outer nunca recibe este evento.\n";
    out2.textContent += "El bubbling se detuvo en #middle.";
  } else {
    out2.textContent += "⬆  middle   │ dispara ✅\n";
  }
  flash(middle2);
});

outer2.addEventListener("click", function (e) {
  s2Init(e);
  out2.textContent += "⬆  outer    │ dispara ✅\n";
  out2.textContent += "─ recorrido completo.";
  flash(outer2);
});

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — delegación de eventos
// ─────────────────────────────────────────────────────────────────────────────

const taskList = document.getElementById("task-list");
let taskCounter = 3;
let clickCount = 0;

// Un solo addEventListener en el ul — ningún li tiene el suyo
taskList.addEventListener("click", function (e) {
  const item = e.target.closest(".task-item");
  if (!item) return;

  window.lastDelegatedEvent = e;
  clickCount++;

  item.classList.add("flash-item");
  setTimeout(() => item.classList.remove("flash-item"), 300);

  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  const targetTag = e.target.tagName.toLowerCase();
  const isSameAsItem = e.target === item;
  const total = taskList.querySelectorAll(".task-item").length;

  document.getElementById("out-s3").textContent =
    "[" +
    ts +
    "] Click #" +
    clickCount +
    "  —  ítem " +
    item.dataset.taskId +
    "\n" +
    "──────────────────────────────────────────────────\n" +
    "e.target         → " +
    targetTag +
    (isSameAsItem ? " (el li)" : " (hijo del li)") +
    "\n" +
    "e.currentTarget  → ul#task-list  ← donde está el listener\n" +
    'closest(...)     → li[data-task-id="' +
    item.dataset.taskId +
    '"]\n\n' +
    "✅ 1 listener gestiona " +
    total +
    " ítems.\n" +
    "Los ítems creados dinámicamente también funcionan.";
});

function addTask() {
  taskCounter++;

  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.taskId = taskCounter;

  const txt = document.createTextNode("Ítem añadido dinámicamente ");
  const badge = document.createElement("span");
  badge.className = "task-badge-item";
  badge.textContent = "#" + taskCounter;

  li.appendChild(txt);
  li.appendChild(badge);
  taskList.appendChild(li);

  log(
    "out-s3",
    "Ítem #" +
      taskCounter +
      " añadido al DOM.\n\n" +
      "No se añadió ningún addEventListener.\n" +
      "El listener del ul lo gestiona igual.\n" +
      "Haz click en él para comprobarlo.",
  );
}

function clearDelegationLog() {
  clickCount = 0;
  log("out-s3", "Log limpiado. Haz click en cualquier ítem…");
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.lastClickEvent = null; // último evento de la sección 1
window.stopPropagationEnabled = false; // estado del toggle de la sección 2
window.lastDelegatedEvent = null; // último evento delegado de la sección 3
window.taskList = taskList; // el ul con el único listener
