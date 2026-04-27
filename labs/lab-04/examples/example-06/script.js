// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: ThemedButton
// Su única función es leer CSS Custom Properties via var() — la estrella
// del ejemplo es el CSS, no la arquitectura del componente
// ─────────────────────────────────────────────────────────────────────────────

class ThemedButton extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;

    var shadow = this.attachShadow({ mode: "open" });
    var tpl = document.getElementById("themed-button-tpl");
    shadow.appendChild(tpl.content.cloneNode(true));
  }
}

customElements.define("themed-button", ThemedButton);

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
// SECCIÓN 1 — la prueba: selector CSS vs custom property
// ─────────────────────────────────────────────────────────────────────────────

function aplicarSelectorCSS() {
  // Eliminar inyección previa
  var prev = document.getElementById("injected-css");
  if (prev) prev.remove();

  // Inyectar una regla CSS que intenta llegar al botón dentro del Shadow DOM
  var style = document.createElement("style");
  style.id = "injected-css";
  style.textContent =
    "themed-button#btn-proof button {" +
    "  background: hotpink !important;" +
    "  color: black !important;" +
    "}";
  document.head.appendChild(style);

  // Verificar el efecto real sobre el botón en shadow DOM
  var host = document.getElementById("btn-proof");
  var innerBtn =
    host && host.shadowRoot ? host.shadowRoot.querySelector("button") : null;

  var bgComputed = innerBtn
    ? getComputedStyle(innerBtn).backgroundColor
    : "no accesible";

  log(
    "out-s1",
    "Regla inyectada en document.head:\n" +
      "  themed-button#btn-proof button { background: hotpink !important }\n\n" +
      "La regla EXISTE en el DOM:\n" +
      '  document.getElementById("injected-css") → style ✅\n\n' +
      "Pero el botón NO ha cambiado ❌\n" +
      '  getComputedStyle(shadowRoot.querySelector("button")).backgroundColor\n' +
      "  → " +
      bgComputed +
      "\n\n" +
      "Los selectores CSS no pueden cruzar el shadow boundary.\n" +
      "La regla es válida pero ciega para los elementos del Shadow DOM.\n\n" +
      'Prueba "2 · Custom Property" para ver la diferencia.',
  );
}

function aplicarCustomProperty() {
  var host = document.getElementById("btn-proof");
  if (!host) return;

  // La custom property se establece en el HOST (Light DOM)
  // y es heredada por los elementos del Shadow DOM via var(--btn-bg)
  host.style.setProperty("--btn-bg", "hotpink");
  host.style.setProperty("--btn-color", "black");

  var bgVal = getComputedStyle(host).getPropertyValue("--btn-bg").trim();
  var colorVal = getComputedStyle(host).getPropertyValue("--btn-color").trim();

  log(
    "out-s1",
    'host.style.setProperty("--btn-bg", "hotpink")\n' +
      'host.style.setProperty("--btn-color", "black")\n\n' +
      "La propiedad se establece en el elemento HOST (Light DOM).\n" +
      "CSS Custom Properties son heredables → cruzan shadow boundaries.\n\n" +
      'getComputedStyle(host).getPropertyValue("--btn-bg")    → "' +
      bgVal +
      '" ✅\n' +
      'getComputedStyle(host).getPropertyValue("--btn-color") → "' +
      colorVal +
      '" ✅\n\n' +
      "El botón ha cambiado visualmente ✅\n\n" +
      "El Shadow DOM lo recibe con: var(--btn-bg, #6366f1)\n" +
      "  Si --btn-bg tiene valor → lo usa\n" +
      "  Si no → usa el fallback #6366f1\n\n" +
      'Las custom properties son los "parámetros CSS" del componente.',
  );
}

function restablecerPrueba() {
  var host = document.getElementById("btn-proof");
  if (host) {
    host.style.removeProperty("--btn-bg");
    host.style.removeProperty("--btn-color");
  }

  var injected = document.getElementById("injected-css");
  if (injected) injected.remove();

  log(
    "out-s1",
    "Restablecido:\n\n" +
      '  host.style.removeProperty("--btn-bg")\n' +
      '  host.style.removeProperty("--btn-color")\n' +
      "  Regla CSS inyectada eliminada\n\n" +
      "El botón vuelve al fallback definido en el componente: #6366f1",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — inspeccionar propiedades de los tres temas
// ─────────────────────────────────────────────────────────────────────────────

function verPropiedades() {
  var ids = ["btn-default", "btn-danger", "btn-ghost"];
  var props = [
    "--btn-bg",
    "--btn-color",
    "--btn-border",
    "--btn-radius",
    "--btn-padding",
    "--btn-font-size",
  ];

  var msg = "";

  ids.forEach(function (id) {
    var el = document.getElementById(id);
    msg += "── #" + id + " ──\n";
    props.forEach(function (prop) {
      var val = getComputedStyle(el).getPropertyValue(prop).trim();
      msg += "  " + prop + "\n";
      msg +=
        "    → " +
        (val ? '"' + val + '"' : "(vacío — componente usa fallback)") +
        "\n";
    });
    msg += "\n";
  });

  msg +=
    "getComputedStyle(el).getPropertyValue(prop) lee el valor\n" +
    "calculado sobre el ELEMENTO HOST (no dentro del shadow DOM).\n\n" +
    "Los valores vacíos indican que el componente usará\n" +
    "el fallback declarado en su template:\n" +
    "  button { background: var(--btn-bg, #6366f1); }";

  log("out-s2", msg);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — theming en tiempo real
// ─────────────────────────────────────────────────────────────────────────────

function actualizarPropiedad(prop, value) {
  var btn = document.getElementById("btn-live");
  if (!btn) return;

  var trimmed = value ? value.trim() : "";

  if (trimmed) {
    btn.style.setProperty(prop, trimmed);
  } else {
    btn.style.removeProperty(prop);
  }

  var computed = getComputedStyle(btn).getPropertyValue(prop).trim();

  log(
    "out-s3",
    'btn.style.setProperty("' +
      prop +
      '", "' +
      trimmed +
      '")\n\n' +
      "Verificación:\n" +
      'getComputedStyle(btn).getPropertyValue("' +
      prop +
      '")\n' +
      '→ "' +
      (computed || "(vacío — usa fallback)") +
      '"\n\n' +
      "El shadow DOM recalcula var(" +
      prop +
      ") al instante.\n" +
      "No es necesario re-renderizar el componente.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.ThemedButton = ThemedButton;
window.btnProof = document.getElementById("btn-proof");
window.btnLive = document.getElementById("btn-live");
// Prueba en consola:
//   window.btnLive.style.setProperty('--btn-bg', 'crimson')
//   getComputedStyle(window.btnLive).getPropertyValue('--btn-bg')
//   window.btnLive.style.removeProperty('--btn-bg')
//
//   // Comparar: selector CSS no llega al shadow DOM
//   document.querySelector('themed-button#btn-proof button')  → null
//   window.btnProof.shadowRoot.querySelector('button')        → button ✅
//
//   // Ver el fallback en acción
//   getComputedStyle(document.getElementById('btn-default')).getPropertyValue('--btn-bg')
//   → '' (vacío: el componente usa el fallback #6366f1)
