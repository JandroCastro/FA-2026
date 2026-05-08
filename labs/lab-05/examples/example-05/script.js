import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  const el = document.getElementById(outId);
  if (!el) return;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent = "[" + ts + "]\n" + msg;
}

function appendLog(outId, line) {
  const el = document.getElementById(outId);
  if (!el) return;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent += "[" + ts + "] " + line + "\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — REFLECT-CARD
// ─────────────────────────────────────────────────────────────────────────────

class ReflectCard extends LitElement {
  static properties = {
    title: { type: String }, // sin reflect → atributo no se actualiza
    active: { type: Boolean, reflect: true }, // con reflect → atributo sincronizado
    variant: { type: String, reflect: true }, // con reflect → :host([variant="..."]) funciona
  };

  static styles = css`
    :host {
      display: block;
    }
    .card {
      padding: 1.25rem;
      border-radius: var(--radius);
      background: var(--clr-bg-2);
      border: 2px solid var(--clr-border);
      transition:
        border-color 0.2s,
        background 0.2s;
    }
    :host([active]) .card {
      border-color: rgba(16, 185, 129, 0.5);
      background: rgba(16, 185, 129, 0.05);
    }
    :host([variant="primary"]) .card {
      border-color: var(--clr-primary-border);
    }
    :host([variant="danger"]) .card {
      border-color: rgba(239, 68, 68, 0.5);
    }
    .card-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.75rem;
      color: var(--clr-text);
    }
    .props {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .prop {
      font-size: 0.8125rem;
      font-family: var(--font-mono);
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--clr-bg-3);
      color: var(--clr-text-muted);
    }
  `;

  constructor() {
    super();
    this.title = "Título del componente";
    this.active = false;
    this.variant = "default";
  }

  render() {
    return html`
      <div class="card">
        <p class="card-title">${this.title}</p>
        <div class="props">
          <span class="prop">active: ${this.active}</span>
          <span class="prop">variant: "${this.variant}"</span>
        </div>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — TYPE-DEMO
// ─────────────────────────────────────────────────────────────────────────────

class TypeDemo extends LitElement {
  static properties = {
    amount: { type: Number },
    enabled: { type: Boolean },
    label: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }
    .wrapper {
      padding: 1.25rem;
      border-radius: var(--radius);
      background: var(--clr-bg-2);
      border: 1px solid var(--clr-border);
    }
    .row {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      padding: 0.625rem 0;
      border-bottom: 1px solid var(--clr-border);
    }
    .row:last-child {
      border-bottom: none;
    }
    .prop-name {
      font-size: 0.8125rem;
      font-family: var(--font-mono);
      color: var(--clr-primary-light);
      min-width: 80px;
    }
    .val {
      font-size: 0.875rem;
      font-family: var(--font-mono);
      color: var(--clr-text);
      flex: 1;
    }
    .type-badge {
      font-size: 0.6875rem;
      font-family: var(--font-mono);
      color: var(--clr-text-muted);
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
      background: var(--clr-bg-3);
    }
  `;

  constructor() {
    super();
    this.amount = 0;
    this.enabled = false;
    this.label = "";
  }

  render() {
    return html`
      <div class="wrapper">
        <div class="row">
          <span class="prop-name">amount</span>
          <span class="val">${this.amount}</span>
          <span class="type-badge">${typeof this.amount}</span>
        </div>
        <div class="row">
          <span class="prop-name">enabled</span>
          <span class="val">${String(this.enabled)}</span>
          <span class="type-badge">${typeof this.enabled}</span>
        </div>
        <div class="row">
          <span class="prop-name">label</span>
          <span class="val">"${this.label}"</span>
          <span class="type-badge">${typeof this.label}</span>
        </div>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — LIFECYCLE-DEMO
// ─────────────────────────────────────────────────────────────────────────────

class LifecycleDemo extends LitElement {
  static properties = { value: { type: String } };

  static styles = css`
    :host {
      display: block;
    }
    .wrapper {
      padding: 1.5rem;
      border-radius: var(--radius);
      background: var(--clr-bg-2);
      border: 1px solid var(--clr-border);
      text-align: center;
    }
    .lbl {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      color: var(--clr-text-muted);
      margin: 0 0 0.375rem;
    }
    .val {
      font-size: 1.75rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: var(--clr-primary-light);
      margin: 0;
    }
  `;

  constructor() {
    super();
    this.value = "inicial";
  }

  // Dispara UNA SOLA VEZ tras el primer render.
  // Aquí es seguro acceder a this.renderRoot (= el shadow root en Lit).
  firstUpdated(changedProperties) {
    this._emitHook("firstUpdated", changedProperties);
  }

  // Dispara tras CADA re-render.
  // changedProperties: Map<propName, oldValue> — guarda los valores ANTERIORES.
  updated(changedProperties) {
    this._emitHook("updated", changedProperties);
  }

  _emitHook(hookName, changedProperties) {
    const changes = [];
    changedProperties.forEach((oldVal, key) => {
      changes.push(
        key + ": " + JSON.stringify(oldVal) + " → " + JSON.stringify(this[key]),
      );
    });
    this.dispatchEvent(
      new CustomEvent("lifecycle-hook", {
        bubbles: true,
        composed: true,
        detail: { hook: hookName, changes },
      }),
    );
  }

  render() {
    return html`
      <div class="wrapper">
        <p class="lbl">valor actual</p>
        <p class="val">${this.value}</p>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// customElements.define — después de todas las clases
// ─────────────────────────────────────────────────────────────────────────────

customElements.define("reflect-card", ReflectCard);
customElements.define("type-demo", TypeDemo);
customElements.define("lifecycle-demo", LifecycleDemo);

// ─────────────────────────────────────────────────────────────────────────────
// Referencias
// ─────────────────────────────────────────────────────────────────────────────

const reflectCard = document.getElementById("reflect-card");
const typeDemo = document.getElementById("type-demo");
const lifecycleEl = document.getElementById("lifecycle-demo");

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — funciones de los botones
// ─────────────────────────────────────────────────────────────────────────────

function toggleActive() {
  reflectCard.active = !reflectCard.active;
  log(
    "out-s1",
    "reflectCard.active = " +
      reflectCard.active +
      "\n\n" +
      "reflect: true → el atributo HTML se sincroniza:\n" +
      '  getAttribute("active")  →  ' +
      JSON.stringify(reflectCard.getAttribute("active")) +
      "\n\n" +
      "Inspecciona el elemento en DevTools:\n" +
      "  [active] aparece o desaparece según el valor de la propiedad.\n\n" +
      "El selector CSS :host([active]) reacciona automáticamente.",
  );
}

const variants = ["default", "primary", "danger"];
let variantIdx = 0;

function cycleVariant() {
  variantIdx = (variantIdx + 1) % variants.length;
  reflectCard.variant = variants[variantIdx];
  log(
    "out-s1",
    'reflectCard.variant = "' +
      reflectCard.variant +
      '"\n\n' +
      'getAttribute("variant")  →  "' +
      reflectCard.getAttribute("variant") +
      '"\n\n' +
      'El selector :host([variant="' +
      reflectCard.variant +
      '"]) aplica\n' +
      "estilos distintos sin ningún código JS adicional.",
  );
}

const titles = ["Nuevo título A", "Nuevo título B", "Nuevo título C"];
let titleIdx = 0;

function changeTitle() {
  titleIdx = (titleIdx + 1) % titles.length;
  reflectCard.title = titles[titleIdx];
  log(
    "out-s1",
    'reflectCard.title = "' +
      reflectCard.title +
      '"\n\n' +
      "sin reflect → el atributo HTML NO se actualiza:\n" +
      '  getAttribute("title")  →  ' +
      JSON.stringify(reflectCard.getAttribute("title")) +
      "\n\n" +
      "El componente se re-renderiza (el texto cambia en pantalla),\n" +
      "pero el atributo HTML sigue siendo null.\n\n" +
      'CSS :host([title="..."]) no funcionaría.',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — funciones de los botones
// ─────────────────────────────────────────────────────────────────────────────

function setAmountAttr() {
  const val = String(Math.floor(Math.random() * 900) + 100);
  typeDemo.setAttribute("amount", val);
  log(
    "out-s2",
    'setAttribute("amount", "' +
      val +
      '")  ← string\n\n' +
      "typeDemo.amount          →  " +
      typeDemo.amount +
      "\n" +
      'typeof typeDemo.amount   →  "' +
      typeof typeDemo.amount +
      '"\n\n' +
      'Lit convirtió el string "' +
      val +
      '" al número ' +
      typeDemo.amount +
      ".\n" +
      "type: Number hace la conversión automáticamente.",
  );
}

function toggleEnabledAttr() {
  if (typeDemo.enabled) {
    typeDemo.removeAttribute("enabled");
  } else {
    typeDemo.setAttribute("enabled", "");
  }
  log(
    "out-s2",
    (typeDemo.enabled
      ? 'setAttribute("enabled", "")  ← presencia del atributo'
      : 'removeAttribute("enabled")   ← ausencia del atributo') +
      "\n\n" +
      "typeDemo.enabled  →  " +
      typeDemo.enabled +
      "\n\n" +
      "type: Boolean en Lit: PRESENCIA = true, AUSENCIA = false.\n" +
      "El valor del atributo no importa.",
  );
}

function setBooleanGotcha() {
  typeDemo.setAttribute("enabled", "false");
  log(
    "out-s2",
    'setAttribute("enabled", "false")  ← parece false…\n\n' +
      "typeDemo.enabled  →  " +
      typeDemo.enabled +
      "  ← ¡es TRUE!\n\n" +
      '⚠️  El atributo "enabled" ESTÁ PRESENTE.\n' +
      "   Lit solo mira si existe, no su valor.\n" +
      '   El string "false" no significa false.\n\n' +
      "Para poner enabled = false:\n" +
      '  typeDemo.removeAttribute("enabled")\n' +
      "  typeDemo.enabled = false",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — listener del ciclo de vida
// ─────────────────────────────────────────────────────────────────────────────

// Lit renderiza en un microtask después del define().
// Para cuando este listener se registra, el primer render
// aún no ha ocurrido → firstUpdated se capturará correctamente.
lifecycleEl.addEventListener("lifecycle-hook", function (e) {
  const { hook, changes } = e.detail;
  const out = document.getElementById("out-s3");
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });

  let entry = "[" + ts + "] " + hook + "()\n";

  if (changes.length > 0) {
    changes.forEach(function (c) {
      entry += "  " + c + "\n";
    });
  } else {
    entry += "  changedProperties: Map vacío\n";
  }

  if (hook === "firstUpdated") {
    entry += "  → solo dispara ESTA VEZ\n";
    entry += "  → this.renderRoot.querySelector() ya es seguro aquí\n";
    out.textContent = entry + "\n"; // primera vez: reemplazar el placeholder
  } else {
    out.textContent += entry + "\n";
  }
});

const cycleValues = ["alpha", "beta", "gamma", "delta", "epsilon"];
let cycleIdx = 0;

function changeLifecycleValue() {
  cycleIdx = (cycleIdx + 1) % cycleValues.length;
  lifecycleEl.value = cycleValues[cycleIdx];
}

function clearLifecycleLog() {
  document.getElementById("out-s3").textContent = "Log limpiado.\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.reflectCard = reflectCard;
// reflectCard.active = true          → atributo se actualiza (reflect)
// reflectCard.title = 'X'            → atributo NO se actualiza (sin reflect)
// reflectCard.getAttribute('active') → comprueba el atributo

window.typeDemo = typeDemo;
// typeDemo.setAttribute('amount', '99')  → typeDemo.amount === 99 (number)
// typeDemo.setAttribute('enabled', 'false') → typeDemo.enabled === true (!)
// typeDemo.removeAttribute('enabled')    → typeDemo.enabled === false

window.lifecycleEl = lifecycleEl;
// lifecycleEl.value = 'nuevo'  → updated() dispara, se registra en el log

window.toggleActive = toggleActive;
window.cycleVariant = cycleVariant;
window.changeTitle = changeTitle;
window.setAmountAttr = setAmountAttr;
window.toggleEnabledAttr = toggleEnabledAttr;
window.setBooleanGotcha = setBooleanGotcha;
window.changeLifecycleValue = changeLifecycleValue;
window.clearLifecycleLog = clearLifecycleLog;
