// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: ShadowButton — demuestra encapsulación de estilos
// ─────────────────────────────────────────────────────────────────────────────

class ShadowButton extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;

    var shadow = this.attachShadow({ mode: "open" });

    // Estilos propios — no afectan al exterior, no son afectados desde fuera
    var style = document.createElement("style");
    style.textContent =
      "button {" +
      "background: #6366f1;" +
      "color: white;" +
      "border: none;" +
      "padding: 0.625rem 1.25rem;" +
      "border-radius: 6px;" +
      "cursor: pointer;" +
      "font-size: 0.875rem;" +
      "font-family: var(--font-sans);" +
      "}" +
      "button:hover { background: #4f46e5; }";

    var btn = document.createElement("button");
    btn.textContent = "Botón en Shadow DOM";

    shadow.appendChild(style);
    shadow.appendChild(btn);
  }
}

customElements.define("shadow-button", ShadowButton);

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  var el = document.getElementById(outId);
  if (!el) return;
  var ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent = "[" + ts + "]\n" + msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — toggle de estilo global e inspección de acceso
// ─────────────────────────────────────────────────────────────────────────────

var overrideActive = false;

function toggleGlobalStyle() {
  overrideActive = !overrideActive;

  var demo = document.getElementById("s1-demo");
  var btnTgl = document.getElementById("btn-toggle");

  demo.classList.toggle("override-active", overrideActive);
  btnTgl.textContent = overrideActive
    ? "↺ Quitar estilo global"
    : "⚡ Aplicar estilo global";

  log(
    "out-s1",
    overrideActive
      ? "Regla activa: #s1-demo.override-active .base-btn { background: crimson }\n\n" +
          "Botón 1 (Light DOM)     → AFECTADO   — el selector lo alcanza ✅\n" +
          "Botón 2 (shadow-button) → INTACTO    — el shadow boundary lo protege ✅\n" +
          "Botón 3 (div + shadow)  → INTACTO    — mismo mecanismo ✅\n\n" +
          "El selector no puede cruzar el límite del Shadow DOM."
      : "Regla eliminada. Los tres botones vuelven a su estado original.\n\n" +
          "El Shadow DOM de los botones 2 y 3 nunca fue afectado.",
  );
}

function inspectarAcceso() {
  // document.querySelector no atraviesa shadow boundaries
  var viaDirect = document.querySelector("#s1-demo shadow-button button");
  var viaLightDOM = document.querySelector(".base-btn");
  var shadowBtnHost = document.getElementById("shadow-btn-el");
  var divHost = document.getElementById("shadow-host-div");

  var viaOpenRoot =
    shadowBtnHost && shadowBtnHost.shadowRoot
      ? shadowBtnHost.shadowRoot.querySelector("button")
      : null;

  var viaDivRoot =
    divHost && divHost.shadowRoot
      ? divHost.shadowRoot.querySelector("button")
      : null;

  log(
    "out-s1",
    "ACCESO A LOS TRES BOTONES\n\n" +
      "1 · Light DOM:\n" +
      '  document.querySelector(".base-btn")\n' +
      "  → " +
      (viaLightDOM ? viaLightDOM.tagName + " ✅" : "null ❌") +
      "\n\n" +
      "2 · Shadow DOM — intento de penetración:\n" +
      '  document.querySelector("shadow-button button")\n' +
      "  → " +
      (viaDirect === null
        ? "null ❌  (el selector no cruza la frontera)"
        : viaDirect.tagName) +
      "\n\n" +
      "2 · Shadow DOM — acceso correcto (modo open):\n" +
      '  document.getElementById("shadow-btn-el").shadowRoot.querySelector("button")\n' +
      "  → " +
      (viaOpenRoot ? viaOpenRoot.tagName + " ✅" : "null") +
      "\n\n" +
      "3 · div + Shadow DOM:\n" +
      '  document.getElementById("shadow-host-div").shadowRoot.querySelector("button")\n' +
      "  → " +
      (viaDivRoot ? viaDivRoot.tagName + " ✅" : "null") +
      "\n\n" +
      "Los selectores CSS y querySelector solo ven el Light DOM.\n" +
      'Para acceder al Shadow DOM desde fuera: element.shadowRoot (solo en mode "open").',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — open vs closed
// ─────────────────────────────────────────────────────────────────────────────

function verShadowRoot(hostId) {
  var host = document.getElementById(hostId);
  var root = host.shadowRoot; // null si mode: 'closed'

  if (root) {
    log(
      "out-s2",
      'document.getElementById("' +
        hostId +
        '").shadowRoot\n' +
        "→ " +
        root.constructor.name +
        "\n\n" +
        'mode: "open" → el shadow root es accesible desde JavaScript externo.\n' +
        "Puedes leer, modificar e inspeccionar su contenido:\n" +
        '  host.shadowRoot.querySelector("button")\n' +
        "  host.shadowRoot.innerHTML\n" +
        "  host.shadowRoot.children",
    );
  } else {
    log(
      "out-s2",
      'document.getElementById("' +
        hostId +
        '").shadowRoot\n' +
        "→ null\n\n" +
        'mode: "closed" → shadowRoot devuelve null desde fuera.\n' +
        "El componente FUNCIONA (el botón es visible y clicable),\n" +
        "pero el script externo no puede inspeccionar ni modificar su interior.\n\n" +
        'Nota práctica: "closed" es raro en la realidad.\n' +
        'La mayoría de frameworks usan "open" — la encapsulación\n' +
        "viene de la convención, no de la restricción del motor.",
    );
  }
}

function inyectarColorOpen() {
  var host = document.getElementById("host-open");
  if (!host.shadowRoot) {
    log("out-s2", "⚠️  No hay shadow root accesible en host-open.");
    return;
  }

  var btn = host.shadowRoot.querySelector("button");
  if (btn) {
    btn.style.background = "hotpink";
    btn.style.color = "black";
    log(
      "out-s2",
      'host-open.shadowRoot.querySelector("button").style.background = "hotpink"\n\n' +
        '✅ Funciona — mode "open" permite acceso y modificación desde fuera.\n' +
        "El botón ha cambiado a rosa mediante JavaScript externo.\n\n" +
        'Este acceso es intencional en "open": el componente confía\n' +
        "en que el código externo actuará responsablemente.\n\n" +
        'Pulsa "↺ Reset open" para restaurar el color original.',
    );
  }
}

function inyectarColorClosed() {
  var host = document.getElementById("host-closed");
  var root = host.shadowRoot; // null por mode: 'closed'

  if (!root) {
    log(
      "out-s2",
      "host-closed.shadowRoot → null\n\n" +
        "❌ Imposible acceder al shadow root desde fuera.\n\n" +
        "Si intentaras ejecutar:\n" +
        '  host-closed.shadowRoot.querySelector("button")\n' +
        '  → TypeError: Cannot read properties of null (reading "querySelector")\n\n' +
        "El botón sigue ahí y funciona — la referencia closedShadow\n" +
        "existe en el scope del script que lo creó, pero no es\n" +
        "accesible desde ningún otro script externo.\n\n" +
        "Prueba en consola: window.closedShadow (expuesto a propósito para este lab).",
    );
  }
}

function resetColorOpen() {
  var host = document.getElementById("host-open");
  if (host.shadowRoot) {
    var btn = host.shadowRoot.querySelector("button");
    if (btn) {
      btn.style.background = "";
      btn.style.color = "";
      log(
        "out-s2",
        "Color reseteado — los estilos inline eliminados.\n" +
          "El botón vuelve a los estilos definidos dentro del Shadow DOM.",
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP — adjuntar Shadow DOM a elementos que no son custom elements
// ─────────────────────────────────────────────────────────────────────────────

function setupBox3() {
  var host = document.getElementById("shadow-host-div");
  var shadow = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent =
    "button {" +
    "background: #10b981;" +
    "color: white;" +
    "border: none;" +
    "padding: 0.625rem 1.25rem;" +
    "border-radius: 6px;" +
    "cursor: pointer;" +
    "font-size: 0.875rem;" +
    "font-family: var(--font-sans);" +
    "}" +
    "button:hover { background: #059669; }";

  var btn = document.createElement("button");
  btn.textContent = "Botón en div + Shadow DOM";

  shadow.appendChild(style);
  shadow.appendChild(btn);
}

// closedShadow se guarda en window para que el alumno pueda
// comprobarlo en consola y ver que SÍ existe, aunque host.shadowRoot sea null
var closedShadow = null;

function setupSection2() {
  // ── Open ──────────────────────────────────────────────
  var openHost = document.getElementById("host-open");
  var openShadow = openHost.attachShadow({ mode: "open" });

  var openStyle = document.createElement("style");
  openStyle.textContent =
    "button {" +
    "background: #6366f1;" +
    "color: white;" +
    "border: none;" +
    "padding: 0.625rem 1.25rem;" +
    "border-radius: 6px;" +
    "cursor: pointer;" +
    "font-size: 0.875rem;" +
    "font-family: var(--font-sans);" +
    "}";

  var openBtn = document.createElement("button");
  openBtn.textContent = "Botón (mode: open)";
  openShadow.appendChild(openStyle);
  openShadow.appendChild(openBtn);

  // ── Closed ────────────────────────────────────────────
  var closedHost = document.getElementById("host-closed");
  closedShadow = closedHost.attachShadow({ mode: "closed" });

  var closedStyle = document.createElement("style");
  closedStyle.textContent =
    "button {" +
    "background: #475569;" +
    "color: white;" +
    "border: none;" +
    "padding: 0.625rem 1.25rem;" +
    "border-radius: 6px;" +
    "cursor: pointer;" +
    "font-size: 0.875rem;" +
    "font-family: var(--font-sans);" +
    "}";

  var closedBtn = document.createElement("button");
  closedBtn.textContent = "Botón (mode: closed)";
  closedShadow.appendChild(closedStyle);
  closedShadow.appendChild(closedBtn);

  window.closedShadow = closedShadow;
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────

setupBox3();
setupSection2();

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.ShadowButton = ShadowButton;
window.closedShadow = closedShadow;
// Prueba en consola:
//   document.querySelector('shadow-button').shadowRoot          → ShadowRoot
//   document.querySelector('shadow-button button')              → null (no cruza)
//   document.getElementById('host-closed').shadowRoot           → null
//   window.closedShadow.querySelector('button')                 → el botón ✅
//   document.getElementById('shadow-host-div').shadowRoot       → ShadowRoot
