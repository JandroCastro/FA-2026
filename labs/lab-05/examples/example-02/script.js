// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  const el = document.getElementById(outId);
  if (!el) return;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent = "[" + ts + "]\n" + msg;
}

function getNodeName(node) {
  if (node instanceof Window) return "Window";
  if (node instanceof Document) return "HTMLDocument";
  if (node instanceof ShadowRoot) return "ShadowRoot";
  if (node && node.tagName) {
    const tag = node.tagName.toLowerCase();
    const id = node.id ? "#" + node.id : "";
    const cls =
      node.className && typeof node.className === "string"
        ? "." + node.className.trim().split(" ")[0]
        : "";
    return tag + id + cls;
  }
  return String(node);
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS DEL SHADOW DOM
// Definidos ANTES de customElements.define: el upgrade al llamar a define()
// es síncrono y connectedCallback — que llama a esta función — dispara
// inmediatamente para cada elemento ya existente en el DOM.
// ─────────────────────────────────────────────────────────────────────────────

function getShadowStyles(isComposed) {
  const accent = isComposed ? "#6ee7b7" : "#fca5a5";
  const accentBg = isComposed ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)";
  const accentBorder = isComposed
    ? "rgba(16,185,129,0.4)"
    : "rgba(239,68,68,0.3)";

  const rules = [
    ":host { display: block; }",
    ".wrapper { padding: 1.25rem; border-radius: var(--radius);" +
      " background: " +
      accentBg +
      "; border: 2px dashed " +
      accentBorder +
      "; }",
    ".lbl { margin: 0 0 .25rem; font-size: .75rem;" +
      " font-family: var(--font-mono); color: var(--clr-text-muted); }",
    ".code-tag { display: block; margin: 0 0 .875rem; font-size: .8125rem;" +
      " font-family: var(--font-mono); font-weight: 600; color: " +
      accent +
      "; }",
    ".btn { padding: .5rem 1.25rem; border-radius: 6px; cursor: pointer;" +
      " font-size: .875rem; font-family: var(--font-sans);" +
      " background: " +
      accentBg +
      "; border: 1px solid " +
      accentBorder +
      ";" +
      " color: " +
      accent +
      "; }",
    ".btn:hover { filter: brightness(1.2); }",
    ".status { margin: .75rem 0 0; font-size: .8125rem; font-family: var(--font-mono);" +
      " color: var(--clr-text-muted); min-height: 1.5rem; }",
  ];

  return rules.join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: shadow-signal
// ─────────────────────────────────────────────────────────────────────────────

class ShadowSignal extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;

    this._isComposed = this.hasAttribute("composed");
    this._eventName = this.getAttribute("event-name") || "shadow-signal";

    this._shadow = this.attachShadow({ mode: "open" });
    this._buildShadow();
  }

  _buildShadow() {
    const style = document.createElement("style");
    style.textContent = getShadowStyles(this._isComposed);

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const lbl = document.createElement("p");
    lbl.className = "lbl";
    lbl.textContent = this.getAttribute("label") || this.id;

    const codeTag = document.createElement("code");
    codeTag.className = "code-tag";
    codeTag.textContent = this._isComposed
      ? "composed: true  →  cruza el Shadow DOM"
      : "composed: false  →  no cruza (default)";

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Disparar evento";
    this._btn = btn;

    const status = document.createElement("p");
    status.className = "status";
    status.textContent = "—";
    this._statusEl = status;

    btn.addEventListener("click", () => this._fire());

    wrapper.appendChild(lbl);
    wrapper.appendChild(codeTag);
    wrapper.appendChild(btn);
    wrapper.appendChild(status);
    this._shadow.appendChild(style);
    this._shadow.appendChild(wrapper);
  }

  _fire() {
    const ev = new CustomEvent(this._eventName, {
      bubbles: true,
      composed: this._isComposed,
      detail: { source: this.id, composed: this._isComposed },
    });
    this._btn.dispatchEvent(ev);

    this._statusEl.textContent = "⚡ evento disparado";
    this._statusEl.style.color = "#6ee7b7";
    setTimeout(() => {
      this._statusEl.textContent = "—";
      this._statusEl.style.color = "";
    }, 1500);
  }
}

// Todas las funciones y métodos usados en connectedCallback deben
// estar definidos antes de esta línea.
customElements.define("shadow-signal", ShadowSignal);

// ─────────────────────────────────────────────────────────────────────────────
// Referencias — el define ya completó el upgrade de todos los elementos
// ─────────────────────────────────────────────────────────────────────────────

const sig1 = document.getElementById("sig-1");
const sig2 = document.getElementById("sig-2");
const sig3 = document.getElementById("sig-3");
const sig4 = document.getElementById("sig-4");

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — composed: false vs composed: true
// ─────────────────────────────────────────────────────────────────────────────

// El evento de sig-1 burbujea DENTRO del shadow tree pero no lo cruza.
// Con mode:'open' podemos añadir un listener al shadow root desde fuera.
sig1.shadowRoot.addEventListener("basic-event", function (e) {
  log(
    "out-s1",
    'sig-1 disparó "basic-event"  (composed: false)\n\n' +
      "El shadow root lo recibió: el evento burbujea\n" +
      "dentro del árbol shadow (button → div → shadow-root).\n\n" +
      "🛑 El document listener no recibió nada.\n" +
      "   El evento nunca cruzó la frontera del Shadow DOM.",
  );
});

// El evento de sig-2 cruza la frontera con composed: true.
document.addEventListener("composed-event", function (e) {
  window.lastDocEvent = e;
  log(
    "out-s1",
    'sig-2 disparó "composed-event"  (composed: true)\n\n' +
      "e.composed:  " +
      e.composed +
      "\n" +
      "e.target:    " +
      getNodeName(e.target) +
      "\n" +
      "             ↑ no es el botón — es el shadow host (retargeting)\n\n" +
      "✅ El document listener recibió el evento.\n\n" +
      "Prueba en consola:\n" +
      "  window.lastDocEvent.target\n" +
      "  window.lastDocEvent.target === window.sig2  →  " +
      (e.target === sig2),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — retargeting
// ─────────────────────────────────────────────────────────────────────────────

// Usamos e.timeStamp para detectar cuándo empieza un click nuevo
// y reiniciar la salida una sola vez aunque haya tres listeners.
let s2Ts = -1;

function s2Init(e) {
  if (e.timeStamp === s2Ts) return;
  s2Ts = e.timeStamp;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  document.getElementById("out-s2").textContent =
    "[" +
    ts +
    "] El mismo evento, tres perspectivas de target:\n" +
    "──────────────────────────────────────────────────\n";
}

// ① Dentro del shadow tree: ve el target original
sig3.shadowRoot.addEventListener("retarget-event", function (e) {
  s2Init(e);
  const out = document.getElementById("out-s2");
  out.textContent +=
    "① shadow root:   e.target → " + getNodeName(e.target) + "\n";
  out.textContent +=
    "                 (el botón original, origen del evento)\n\n";
});

// ② En el host, en el light DOM: target ya ha sido retargeteado
sig3.addEventListener("retarget-event", function (e) {
  s2Init(e);
  const out = document.getElementById("out-s2");
  out.textContent +=
    "② host (sig-3):  e.target → " + getNodeName(e.target) + "\n";
  out.textContent +=
    "                 ← el target cambió al cruzar la frontera\n\n";
});

// ③ En document: mismo target retargeteado
document.addEventListener("retarget-event", function (e) {
  window.lastDocEvent = e;
  s2Init(e);
  const out = document.getElementById("out-s2");
  out.textContent +=
    "③ document:      e.target → " + getNodeName(e.target) + "\n\n";
  out.textContent += "Fuera del Shadow DOM, event.target siempre apunta al\n";
  out.textContent += "shadow host, nunca al elemento interno.\n\n";
  out.textContent += "Prueba en consola:\n";
  out.textContent += "  window.lastDocEvent.target\n";
  out.textContent +=
    '  window.sig3.shadowRoot.querySelector(".btn")  ← el botón real';
});

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — composedPath()
// ─────────────────────────────────────────────────────────────────────────────

function formatPath(path) {
  const srIdx = path.findIndex(function (n) {
    return n instanceof ShadowRoot;
  });
  let out = "composedPath() — ruta completa (" + path.length + " nodos):\n\n";

  path.forEach(function (node, i) {
    const name = getNodeName(node);
    let zone;
    if (srIdx < 0) zone = "";
    else if (i < srIdx) zone = "  shadow DOM";
    else if (i === srIdx) zone = "  ─── frontera ───";
    else zone = "  light DOM";

    out += "[" + String(i).padStart(2) + "]  " + name.padEnd(28) + zone + "\n";
  });

  out +=
    "\n⚠️  window.lastDocEvent.composedPath()  →  [] (vacío fuera del handler)\n";
  out +=
    "✅  window.lastComposedPath             →  el array guardado dentro del handler";
  return out;
}

document.addEventListener("path-event", function (e) {
  // composedPath() DEBE capturarse dentro del handler:
  // tras el dispatch el array se vacía. .slice() crea una copia persistente.
  const path = e.composedPath().slice();
  window.lastComposedPath = path;
  window.lastDocEvent = e;
  log("out-s3", formatPath(path));
});

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.sig1 = sig1; // composed: false — el evento queda dentro del shadow
window.sig2 = sig2; // composed: true  — el evento cruza la frontera
window.sig3 = sig3; // composed: true  — demo de retargeting
window.sig4 = sig4; // composed: true  — demo de composedPath

window.lastDocEvent = null; // último evento capturado en document
window.lastComposedPath = null; // composedPath guardado dentro del handler
