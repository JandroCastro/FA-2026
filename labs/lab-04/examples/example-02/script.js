`labs/lab-04/example-02/script.js`;

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE — metadatos visuales por tipo de evento
// ─────────────────────────────────────────────────────────────────────────────

var EVENT_META = {
  constructor: { label: "constructor()", color: "#a5b4fc" },
  connected: { label: "connectedCallback()", color: "#6ee7b7" },
  disconnected: { label: "disconnectedCallback()", color: "#fca5a5" },
  attrchanged: { label: "attributeChangedCallback()", color: "#fcd34d" },
};

// _suppressEvents evita que resetearTodo() registre el disconnect final
var _suppressEvents = false;

function addEvent(type, detail) {
  if (_suppressEvents) return;

  var tl = document.getElementById("timeline");
  var emp = document.getElementById("tl-empty");
  if (emp) emp.style.display = "none";

  var meta = EVENT_META[type] || { label: type, color: "#94a3b8" };
  var ts = new Date().toLocaleTimeString("es-ES", { hour12: false });

  var div = document.createElement("div");
  div.className = "lc-entry lc-entry--" + type;

  var html = "";
  html += '<span class="lc-entry__ts">' + ts + "</span>";
  html += '<span class="lc-entry__badge" style="color:' + meta.color + ';">';
  html += meta.label;
  html += "</span>";
  if (detail) {
    html += '<span class="lc-entry__detail">' + detail + "</span>";
  }
  div.innerHTML = html;

  // El más reciente queda arriba
  tl.insertBefore(div, tl.firstChild);

  // Mantener referencia en window actualizada
  window.loggerEl = loggerEl;
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER — actualiza el interior del componente (solo si está en el DOM)
// ─────────────────────────────────────────────────────────────────────────────

var COLOR_HEX = {
  indigo: "#6366f1",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  pink: "#ec4899",
  blue: "#3b82f6",
};

function _render(el) {
  if (!el.isConnected) return;

  var colorAttr = el.getAttribute("color") || "indigo";
  var labelAttr = el.getAttribute("label") || "(sin label)";
  var hex = COLOR_HEX[colorAttr] || colorAttr;

  var html = "";
  html += '<div class="lc-card" style="border-left-color:' + hex + ';">';
  html += '<p class="lc-card__tag" style="color:' + hex + ';">';
  html += "⚡ &lt;lifecycle-logger&gt;";
  html += "</p>";
  html +=
    '<p class="lc-card__attr">color &rarr; &quot;' + colorAttr + "&quot;</p>";
  html +=
    '<p class="lc-card__attr">label &rarr; &quot;' + labelAttr + "&quot;</p>";
  html += '<div class="lc-card__stats">';
  html +=
    "<span>conectado <strong>" + el.connectedCount + "&times;</strong></span>";
  html +=
    "<span>desconectado <strong>" +
    el.disconnectedCount +
    "&times;</strong></span>";
  html +=
    "<span>attrs <strong>" + el.attrChangedCount + "&times;</strong></span>";
  html += "</div>";
  html += "</div>";

  el.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: LifecycleLogger
// ─────────────────────────────────────────────────────────────────────────────

class LifecycleLogger extends HTMLElement {
  static get observedAttributes() {
    // Solo estos dos nombres disparan attributeChangedCallback
    return ["color", "label"];
  }

  constructor() {
    super();
    // ⚠️  Solo inicializar propiedades JS — NO manipular el DOM aquí.
    // En este momento el elemento NO está en el documento.
    this.connectedCount = 0;
    this.disconnectedCount = 0;
    this.attrChangedCount = 0;

    addEvent(
      "constructor",
      "creado en memoria — isConnected: " +
        //prop del Node que indica si el elemento está en el DOM o no (true/false)
        this.isConnected +
        " — ⚠️  NO tocar el DOM aquí",
    );
  }

  connectedCallback() {
    this.connectedCount++;
    _render(this);
    addEvent(
      "connected",
      "insertado en el DOM — isConnected: " +
        this.isConnected +
        " — llamada #" +
        this.connectedCount,
    );
    updateButtons();
  }

  disconnectedCallback() {
    this.disconnectedCount++;
    addEvent(
      "disconnected",
      "eliminado del DOM — isConnected: " +
        this.isConnected +
        " — llamada #" +
        this.disconnectedCount,
    );
    updateButtons();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this.attrChangedCount++;
    if (this.isConnected) _render(this); // re-renderizar con el nuevo valor
    addEvent(
      "attrchanged",
      '("' +
        name +
        '", ' +
        (oldVal === null ? "null" : '"' + oldVal + '"') +
        ', "' +
        newVal +
        '") — inDOM: ' +
        this.isConnected,
    );
  }
}

customElements.define("lifecycle-logger", LifecycleLogger);

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO Y SINCRONIZACIÓN DE BOTONES
// ─────────────────────────────────────────────────────────────────────────────

var loggerEl = null;

function updateButtons() {
  var created = loggerEl !== null;
  var inDOM = created && loggerEl.isConnected;

  document.getElementById("btn-crear").disabled = created;
  document.getElementById("btn-anadir").disabled = !created || inDOM;
  document.getElementById("btn-quitar").disabled = !inDOM;
  document.getElementById("btn-color").disabled = !created;
  document.getElementById("btn-label").disabled = !created;

  // Mostrar u ocultar el placeholder del stage
  document.getElementById("stage-placeholder").style.display = inDOM
    ? "none"
    : "flex";
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — controles del ciclo de vida
// ─────────────────────────────────────────────────────────────────────────────

function crearElemento() {
  if (loggerEl) return;
  // constructor() se dispara aquí — elemento en memoria, fuera del DOM
  loggerEl = document.createElement("lifecycle-logger");
  window.loggerEl = loggerEl;
  updateButtons();
}

function anadirDOM() {
  if (!loggerEl || loggerEl.isConnected) return;
  // connectedCallback() se dispara síncronamente dentro del appendChild
  document.getElementById("stage-component").appendChild(loggerEl);
  updateButtons();
}

function quitarDOM() {
  if (!loggerEl || !loggerEl.isConnected) return;
  // disconnectedCallback() se dispara síncronamente dentro del removeChild
  document.getElementById("stage-component").removeChild(loggerEl);
  updateButtons();
}

function resetearTodo() {
  // Suprimir eventos durante el reset para no ensuciar el timeline
  _suppressEvents = true;
  if (loggerEl && loggerEl.isConnected) {
    loggerEl.remove();
  }
  _suppressEvents = false;

  loggerEl = null;
  window.loggerEl = null;

  // Reconstruir el timeline vacío
  var tl = document.getElementById("timeline");
  tl.innerHTML = "";
  var emp = document.createElement("p");
  emp.id = "tl-empty";
  emp.style.cssText =
    "color:var(--clr-text-disabled);font-size:0.8125rem;" +
    "text-align:center;padding:1rem;margin:0;";
  emp.textContent = "Los eventos aparecerán aquí…";
  tl.appendChild(emp);

  updateButtons();
}

function aplicarColor() {
  if (!loggerEl) return;
  var val = document.getElementById("input-color").value.trim();
  if (val) loggerEl.setAttribute("color", val);
}

function aplicarLabel() {
  if (!loggerEl) return;
  var val = document.getElementById("input-label").value.trim();
  if (val) loggerEl.setAttribute("label", val);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — observedAttributes
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  var el = document.getElementById(outId);
  if (!el) return;
  var ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent = "[" + ts + "]\n" + msg;
}

function cambiarObservado(nombre, valor) {
  if (!loggerEl) {
    log("out-s2", "⚠️  Crea el elemento primero (sección 1, paso 1).");
    return;
  }
  loggerEl.setAttribute(nombre, valor);
  log(
    "out-s2",
    '✅ setAttribute("' +
      nombre +
      '", "' +
      valor +
      '")\n\n' +
      '"' +
      nombre +
      '" está en observedAttributes:\n' +
      "  static get observedAttributes() { return ['color', 'label']; }\n\n" +
      "attributeChangedCallback() disparado → mira el timeline.",
  );
}

function cambiarNoObservado(nombre, valor) {
  if (!loggerEl) {
    log("out-s2", "⚠️  Crea el elemento primero (sección 1, paso 1).");
    return;
  }
  loggerEl.setAttribute(nombre, valor);
  log(
    "out-s2",
    '⚠️  setAttribute("' +
      nombre +
      '", "' +
      valor +
      '")\n\n' +
      '"' +
      nombre +
      '" NO está en observedAttributes.\n' +
      "El atributo existe en el DOM — comprueba:\n" +
      '  window.loggerEl.getAttribute("' +
      nombre +
      '") → "' +
      valor +
      '"\n\n' +
      "Pero attributeChangedCallback() NO se ha disparado.\n" +
      "El timeline no tiene ningún nuevo evento.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

updateButtons();

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.LifecycleLogger = LifecycleLogger;
window.loggerEl = null;
// Prueba en consola tras crear y añadir el elemento:
//   window.loggerEl.connectedCount
//   window.loggerEl.isConnected
//   window.loggerEl.setAttribute('color', 'blue')
//   window.loggerEl.getAttribute('data-version')   // existe aunque no dispare callback
//   customElements.get('lifecycle-logger') === window.LifecycleLogger
