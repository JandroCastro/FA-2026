`labs/lab-04/example-01/script.js`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE 1: HelloWorld — registrado al cargar la página
// ─────────────────────────────────────────────────────────────────────────────

class HelloWorld extends HTMLElement {
  connectedCallback() {
    // Guarda para no re-renderizar si el elemento se mueve en el DOM
    if (this._init) return;
    this._init = true;
    //Propiedad de HTMLElement que devuelve el nombre de la etiqueta en mayúsculas (ej: "HELLO-WORLD").
    // //Si el elemento no tiene un nombre de etiqueta (ej: es un fragmento de documento), devuelve "#document-fragment".
    var tag = this.tagName.toLowerCase();
    var id = this.id || "(sin id)";

    // "this" ES el elemento del DOM: tagName, id, instanceof... todo está aquí
    var html = "";
    html += '<div style="padding:0.875rem 1rem;border-radius:6px;';
    html +=
      'background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);">';
    html += '<p style="font-weight:700;color:#a5b4fc;margin-bottom:0.625rem;';
    html += 'font-family:var(--font-mono);font-size:0.875rem;">';
    html += "¡Hola! Soy &lt;" + tag + "&gt;";
    html += "</p>";
    html +=
      '<p style="font-size:0.8125rem;color:var(--clr-text-muted);margin-bottom:0.25rem;">';
    html +=
      "this.tagName &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&rarr; &quot;" +
      this.tagName +
      "&quot;";
    html += "</p>";
    html +=
      '<p style="font-size:0.8125rem;color:var(--clr-text-muted);margin-bottom:0.25rem;">';
    html +=
      "this.id &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&rarr; &quot;" +
      id +
      "&quot;";
    html += "</p>";
    html +=
      '<p style="font-size:0.8125rem;color:var(--clr-text-muted);margin-bottom:0.25rem;">';
    html +=
      "this.constructor.name &rarr; &quot;" + this.constructor.name + "&quot;";
    html += "</p>";
    html += '<p style="font-size:0.8125rem;color:#6ee7b7;">';
    html +=
      "this instanceof HTMLElement &rarr; " + (this instanceof HTMLElement);
    html += "</p>";
    html += "</div>";

    this.innerHTML = html;
  }
}

customElements.define("hello-world", HelloWorld);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE 2: MysteryElement — pendiente de registrar
// ─────────────────────────────────────────────────────────────────────────────

class MysteryElement extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;

    // Se ejecuta automáticamente cuando el navegador hace el "upgrade"
    var html = "";
    html += '<div style="padding:0.875rem 1rem;border-radius:6px;';
    html +=
      'background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);">';
    html += '<p style="font-weight:700;color:#6ee7b7;margin-bottom:0.625rem;';
    html += 'font-family:var(--font-mono);font-size:0.875rem;">';
    html += "⚡ ¡Ahora sí estoy definido!";
    html += "</p>";
    html +=
      '<p style="font-size:0.8125rem;color:var(--clr-text-muted);margin-bottom:0.25rem;">';
    html += "connectedCallback() llamado en el upgrade";
    html += "</p>";
    html += '<p style="font-size:0.8125rem;color:var(--clr-text-muted);">';
    html +=
      "this.constructor.name &rarr; &quot;" + this.constructor.name + "&quot;";
    html += "</p>";
    html += "</div>";

    this.innerHTML = html;
  }
}

// ⚠️  mystery-element NO se registra aquí — lo hace el usuario al pulsar el botón

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  var el = document.getElementById(outId);
  if (!el) return;
  var ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  // textContent + white-space:pre-wrap = saltos de \n visibles, sin riesgo XSS
  el.textContent = "[" + ts + "]\n" + msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1: definir mystery-element y comparar constructores
// ─────────────────────────────────────────────────────────────────────────────

var mysteryDefined = false;

function definirMystery() {
  if (mysteryDefined) {
    log(
      "out-s1",
      "⚠️  mystery-element ya está registrado.\n\n" +
        "customElements.define() lanza DOMException si intentas\n" +
        "registrar el mismo nombre dos veces en la misma página.",
    );
    return;
  }

  customElements.define("mystery-element", MysteryElement);
  mysteryDefined = true;
  window.MysteryElement = MysteryElement;

  log(
    "out-s1",
    '✅ customElements.define("mystery-element", MysteryElement)\n\n' +
      "El navegador hace upgrade de todos los <mystery-element>\n" +
      "existentes en el DOM y dispara connectedCallback() en cada uno.\n\n" +
      "Observa el panel izquierdo: la caja punteada desaparece.\n" +
      "El CSS :not(:defined) deja de aplicar → ahora es :defined.\n\n" +
      "Prueba en consola:\n" +
      '  customElements.get("mystery-element")\n' +
      "  window.mysteryEl.constructor.name",
  );
}

function compararConstructores() {
  var mystery = document.getElementById("mystery-el");
  var hello = document.getElementById("hello-el");

  var mysteryReg = customElements.get("mystery-element")
    ? "✅ MysteryElement"
    : "❌ undefined (sin registrar)";

  log(
    "out-s1",
    "MYSTERY-ELEMENT\n" +
      "  constructor.name         → " +
      mystery.constructor.name +
      "\n" +
      "  instanceof HTMLElement   → " +
      (mystery instanceof HTMLElement) +
      "\n" +
      "  customElements.get(...)  → " +
      mysteryReg +
      "\n\n" +
      "HELLO-WORLD\n" +
      "  constructor.name         → " +
      hello.constructor.name +
      "\n" +
      "  instanceof HTMLElement   → " +
      (hello instanceof HTMLElement) +
      "\n" +
      "  customElements.get(...)  → ✅ HelloWorld\n\n" +
      "Ambos son instancias de HTMLElement.\n" +
      "La diferencia: uno tiene clase propia, el otro es genérico.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2: regla del guión
// ─────────────────────────────────────────────────────────────────────────────

function probarNombre() {
  var input = document.getElementById("name-input");
  var nombre = input.value.trim().toLowerCase();

  if (!nombre) {
    log("out-s2", "⚠️  Escribe un nombre antes de intentar registrar.");
    return;
  }

  // Si ya está en el registro (por una llamada anterior), informamos sin relanzar
  if (customElements.get(nombre)) {
    log(
      "out-s2",
      '⚠️  "' +
        nombre +
        '" ya está en el CustomElementRegistry.\n\n' +
        "Cada nombre solo puede registrarse una vez por página.\n" +
        "Prueba con un nombre diferente.",
    );
    return;
  }

  try {
    // Clase anónima: solo necesitamos algo que extienda HTMLElement
    var AnonClass = class extends HTMLElement {};
    customElements.define(nombre, AnonClass);
    log(
      "out-s2",
      '✅ "' +
        nombre +
        '" registrado con éxito.\n\n' +
        "El nombre contiene guión → es un nombre válido.\n" +
        "Ya puedes usar <" +
        nombre +
        "> en el HTML de esta página.\n\n" +
        'customElements.get("' +
        nombre +
        '") → ' +
        customElements.get(nombre).name,
    );
  } catch (e) {
    log(
      "out-s2",
      "❌ DOMException: " +
        e.message +
        "\n\n" +
        '"' +
        nombre +
        '" no es un nombre de custom element válido.\n' +
        "Regla: debe contener al menos un guión (-).",
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3: CustomElementRegistry API
// ─────────────────────────────────────────────────────────────────────────────

function llamarGet(nombre) {
  var resultado = customElements.get(nombre);
  if (resultado) {
    log(
      "out-s3",
      'customElements.get("' +
        nombre +
        '") → ' +
        resultado.name +
        "\n\n" +
        "Devuelve la clase constructora.\n" +
        "Puedes usarla directamente:\n" +
        '  const Cls = customElements.get("' +
        nombre +
        '")\n' +
        "  Cls === " +
        resultado.name +
        "  →  " +
        (resultado === HelloWorld),
    );
  } else {
    log(
      "out-s3",
      'customElements.get("' +
        nombre +
        '") → undefined\n\n' +
        '"' +
        nombre +
        '" no está registrado en el CustomElementRegistry.\n\n' +
        "Tip: define mystery-element en la sección 1 y después llama\n" +
        'a customElements.get("mystery-element") desde consola.',
    );
  }
}

function llamarGetName() {
  if (typeof customElements.getName !== "function") {
    log(
      "out-s3",
      "customElements.getName() no está disponible en este navegador.\n\n" +
        "Requiere Chrome 117+, Firefox 116+, Safari 17+.\n" +
        "Actualiza el navegador o prueba en uno moderno.",
    );
    return;
  }

  var nombre = customElements.getName(HelloWorld);
  log(
    "out-s3",
    'customElements.getName(HelloWorld) → "' +
      nombre +
      '"\n\n' +
      "Es el inverso exacto de .get():\n" +
      '  .get("hello-world")    → HelloWorld  (nombre → clase)\n' +
      '  .getName(HelloWorld)   → "hello-world"  (clase → nombre)\n\n' +
      "Útil cuando tienes la referencia a la clase pero no\n" +
      "recuerdas con qué nombre se registró.",
  );
}

function llamarWhenDefined() {
  log(
    "out-s3",
    'customElements.whenDefined("hello-world")…\nEsperando microtask…',
  );

  customElements.whenDefined("hello-world").then(function (klass) {
    log(
      "out-s3",
      'customElements.whenDefined("hello-world") → Promise resuelta ✅\n\n' +
        "Ya estaba definido → se resuelve en el siguiente microtask.\n" +
        "Clase recibida en el .then(): " +
        klass.name +
        "\n\n" +
        "Caso de uso real (carga diferida):\n" +
        '  import("./my-datepicker.js");\n' +
        '  customElements.whenDefined("my-datepicker").then(() => {\n' +
        '    document.querySelector("my-datepicker").setDate(new Date());\n' +
        "  });",
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.HelloWorld = HelloWorld;
window.helloEl = document.getElementById("hello-el");
window.mysteryEl = document.getElementById("mystery-el");
// window.MysteryElement → disponible tras pulsar "⚡ Definir mystery-element"
