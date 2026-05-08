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

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — VANILLA COUNTER (referencia para comparar)
// ─────────────────────────────────────────────────────────────────────────────

// Estilos del shadow DOM construidos como string — los usamos en ambos contadores
// para que sean visualmente idénticos y la diferencia sea solo el código.
function getCounterStyles(accentColor) {
  return (
    ":host { display: block; }" +
    " .wrapper { text-align: center; padding: 1.5rem 1rem;" +
    " border-radius: var(--radius); background: var(--clr-bg-3); }" +
    " .num { display: block; font-size: 2.5rem; font-weight: 700;" +
    " font-family: var(--font-mono); color: " +
    accentColor +
    ";" +
    " margin-bottom: 0.5rem; }" +
    " .lbl { font-size: 0.75rem; font-family: var(--font-mono);" +
    " color: var(--clr-text-disabled); margin: 0 0 0.75rem; }" +
    " .btn { padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer;" +
    " font-size: 0.875rem; font-family: var(--font-sans);" +
    " background: var(--clr-bg-2); border: 1px solid var(--clr-border);" +
    " color: var(--clr-text); display: block; width: 100%; margin-top: 0.25rem; }" +
    " .btn:hover { filter: brightness(1.1); }"
  );
}

class VanillaCounter extends HTMLElement {
  constructor() {
    super();
    this._count = 0;
  }

  connectedCallback() {
    if (this._init) return;
    this._init = true;

    const shadow = this.attachShadow({ mode: "open" });

    // ① Estilos: manual
    const style = document.createElement("style");
    style.textContent = getCounterStyles("var(--clr-text-muted)");

    // ② Estructura: un elemento a la vez
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const numEl = document.createElement("span");
    numEl.className = "num";
    numEl.textContent = "0";
    this._numEl = numEl; // referencia guardada para actualizar a mano

    const lbl = document.createElement("p");
    lbl.className = "lbl";
    lbl.textContent = "vanilla";

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "+1 click";

    // ③ Actualización del DOM: manual y obligatoria en cada click
    btn.addEventListener("click", () => {
      this._count++;
      this._numEl.textContent = this._count; // ← sin esto el número no cambia
      this.dispatchEvent(
        new CustomEvent("counter-click", {
          bubbles: true,
          composed: true,
          detail: { count: this._count, type: "vanilla" },
        }),
      );
    });

    wrapper.appendChild(numEl);
    wrapper.appendChild(lbl);
    wrapper.appendChild(btn);
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — LIT COUNTER (la misma funcionalidad con Lit)
// ─────────────────────────────────────────────────────────────────────────────

class LitCounter extends LitElement {
  // ① Una línea declara la propiedad como reactiva
  static properties = { count: { type: Number } };

  // ② css`` encapsula estilos en el Shadow DOM automáticamente
  static styles = css`
    :host {
      display: block;
    }
    .wrapper {
      text-align: center;
      padding: 1.5rem 1rem;
      border-radius: var(--radius);
      background: var(--clr-bg-3);
    }
    .num {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: var(--clr-primary-light);
      margin-bottom: 0.5rem;
    }
    .lbl {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      color: var(--clr-text-disabled);
      margin: 0 0 0.75rem;
    }
    .btn {
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-family: var(--font-sans);
      background: var(--clr-bg-2);
      border: 1px solid var(--clr-border);
      color: var(--clr-text);
      display: block;
      width: 100%;
      margin-top: 0.25rem;
    }
    .btn:hover {
      filter: brightness(1.1);
    }
  `;

  constructor() {
    super();
    this.count = 0;
  }

  // ③ render() declara el resultado — Lit se encarga de actualizar el DOM
  render() {
    return html`
      <div class="wrapper">
        <span class="num">${this.count}</span>
        <p class="lbl">lit</p>
        <button class="btn" @click=${this._handleClick}>+1 click</button>
      </div>
    `;
  }

  _handleClick() {
    this.count++; // ← Lit detecta el cambio y re-renderiza solo el ${this.count}
    this.dispatchEvent(
      new CustomEvent("counter-click", {
        bubbles: true,
        composed: true,
        detail: { count: this.count, type: "lit" },
      }),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — LIT PROFILE (propiedades reactivas)
// ─────────────────────────────────────────────────────────────────────────────

class LitProfile extends LitElement {
  static properties = {
    name: { type: String },
    score: { type: Number },
    // reflect: true escribe el valor de vuelta al atributo HTML cuando cambia
    status: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
    }
    :host([status="inactive"]) .card {
      opacity: 0.45;
    }
    .card {
      padding: 1.25rem;
      border-radius: var(--radius);
      background: var(--clr-bg-2);
      border: 1px solid var(--clr-border);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: opacity 0.2s;
    }
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--clr-bg-3);
      border: 2px solid var(--clr-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .info {
      flex: 1;
    }
    .name {
      font-weight: 700;
      font-size: 1rem;
      margin: 0 0 0.375rem;
      color: var(--clr-text);
    }
    .score-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--clr-primary-bg);
      color: var(--clr-primary-light);
      border: 1px solid var(--clr-primary-border);
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }
    .status-row {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      font-family: var(--font-mono);
      color: var(--clr-text-muted);
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--clr-text-disabled);
    }
    .dot--active {
      background: #10b981;
    }
  `;

  constructor() {
    super();
    this.name = "Alumno Frontend";
    this.score = 0;
    this.status = "active";
  }

  render() {
    const isActive = this.status === "active";
    return html`
      <div class="card">
        <div class="avatar">👤</div>
        <div class="info">
          <p class="name">${this.name}</p>
          <span class="score-badge">${this.score} pts</span>
          <div class="status-row">
            <span class=${isActive ? "dot dot--active" : "dot"}></span>
            ${isActive ? "Activo" : "Inactivo"}
          </div>
        </div>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — LIT TEMPLATE DEMO (los cuatro tipos de binding)
// ─────────────────────────────────────────────────────────────────────────────

class LitTemplateDemo extends LitElement {
  static properties = {
    inputName: { type: String },
    greeting: { type: String },
    enabled: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
    }
    .demo {
      padding: 1.25rem;
      border-radius: var(--radius);
      background: var(--clr-bg-2);
      border: 1px solid var(--clr-border);
    }
    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.875rem;
    }
    .row:last-child {
      margin-bottom: 0;
    }
    .tag {
      font-size: 0.6875rem;
      font-family: var(--font-mono);
      color: var(--clr-primary-light);
      background: var(--clr-primary-bg);
      border: 1px solid var(--clr-primary-border);
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-sm);
      min-width: 120px;
      text-align: center;
      flex-shrink: 0;
    }
    .input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--clr-border);
      background: var(--clr-bg-3);
      color: var(--clr-text);
      font-family: var(--font-sans);
      font-size: 0.875rem;
    }
    .input:focus {
      outline: none;
      border-color: var(--clr-primary);
    }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-family: var(--font-sans);
      background: var(--clr-primary-bg);
      border: 1px solid var(--clr-primary-border);
      color: var(--clr-primary-light);
    }
    .btn[disabled] {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .btn:not([disabled]):hover {
      filter: brightness(1.15);
    }
    .btn--sec {
      background: var(--clr-bg-3);
      border-color: var(--clr-border);
      color: var(--clr-text-muted);
    }
    .result {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      color: var(--clr-primary-light);
    }
  `;

  constructor() {
    super();
    this.inputName = "";
    this.greeting = "—";
    this.enabled = true;
  }

  render() {
    return html`
      <div class="demo">
        <div class="row">
          <span class="tag">.value @input</span>
          <input
            class="input"
            .value=${this.inputName}
            @input=${(e) => {
              this.inputName = e.target.value;
            }}
            placeholder="Escribe tu nombre…"
          />
        </div>
        <div class="row">
          <span class="tag">@click ?disabled</span>
          <button class="btn" ?disabled=${!this.enabled} @click=${this._greet}>
            Saludar
          </button>
          <button
            class="btn btn--sec"
            @click=${() => {
              this.enabled = !this.enabled;
            }}
          >
            ${this.enabled ? "Deshabilitar" : "Habilitar"}
          </button>
        </div>
        <div class="row">
          <span class="tag">\${expresión}</span>
          <span class="result">${this.greeting}</span>
        </div>
      </div>
    `;
  }

  _greet() {
    this.greeting = "Hola, " + (this.inputName || "Anónimo") + "!";
    this.dispatchEvent(
      new CustomEvent("greeting-sent", {
        bubbles: true,
        composed: true,
        detail: { name: this.inputName, greeting: this.greeting },
      }),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// customElements.define — después de todas las clases y helpers
// ─────────────────────────────────────────────────────────────────────────────

customElements.define("vanilla-counter", VanillaCounter);
customElements.define("lit-counter", LitCounter);
customElements.define("lit-profile", LitProfile);
customElements.define("lit-template-demo", LitTemplateDemo);

// ─────────────────────────────────────────────────────────────────────────────
// Referencias
// ─────────────────────────────────────────────────────────────────────────────

const vanillaCounter = document.getElementById("vanilla-counter");
const litCounter = document.getElementById("lit-counter");
const litProfile = document.getElementById("lit-profile");
const templateDemo = document.getElementById("template-demo");

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — listeners y líneas de comparación
// ─────────────────────────────────────────────────────────────────────────────

document.getElementById("vanilla-lines").textContent = "~38 líneas";
document.getElementById("lit-lines").textContent = "~22 líneas";

document.addEventListener("counter-click", function (e) {
  const isLit = e.detail.type === "lit";
  log(
    "out-s1",
    e.detail.type +
      "-counter: " +
      e.detail.count +
      " clicks\n\n" +
      (isLit
        ? "this.count++ disparó el re-render automático.\n" +
          "Lit actualiza solo el ${this.count} del template.\n\n" +
          "Prueba en consola:\n" +
          "  window.litCounter.count = 99     → re-render inmediato\n" +
          "  window.vanillaCounter._count = 99 → el DOM NO se actualiza"
        : "this._count++ más actualización manual: this._numEl.textContent = this._count\n" +
          "Sin esa línea el número en pantalla no cambiaría.\n\n" +
          "Prueba en consola:\n" +
          "  window.vanillaCounter._count = 99 → el DOM NO se actualiza\n" +
          "  window.litCounter.count = 99      → sí se actualiza (reactivo)"),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — funciones de los botones
// ─────────────────────────────────────────────────────────────────────────────

const names = [
  "Ana García",
  "Luis Martínez",
  "Sara Pérez",
  "Carlos López",
  "Marta Ruiz",
];
let nameIdx = 0;

function changeName() {
  nameIdx = (nameIdx + 1) % names.length;
  litProfile.name = names[nameIdx];
  log(
    "out-s2",
    'litProfile.name = "' +
      litProfile.name +
      '"\n\n' +
      'Lit detectó el cambio en la propiedad "name"\n' +
      "y re-renderizó el ${this.name} del template.\n\n" +
      "No se usó querySelector. No se tocó el DOM.",
  );
}

function addScore() {
  litProfile.score += 10;
  log(
    "out-s2",
    "litProfile.score = " +
      litProfile.score +
      "\n\n" +
      "Prueba en consola:\n" +
      "  window.litProfile.score += 50",
  );
}

function toggleStatus() {
  litProfile.status = litProfile.status === "active" ? "inactive" : "active";
  log(
    "out-s2",
    'litProfile.status = "' +
      litProfile.status +
      '"\n\n' +
      "reflect: true → el atributo HTML también se actualiza.\n\n" +
      "Comprueba en consola:\n" +
      '  window.litProfile.getAttribute("status")  →  "' +
      litProfile.status +
      '"\n\n' +
      'El selector CSS :host([status="inactive"]) reacciona al atributo.',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — listener del evento de saludo
// ─────────────────────────────────────────────────────────────────────────────

templateDemo.addEventListener("greeting-sent", function (e) {
  log(
    "out-s3",
    'Evento "greeting-sent" recibido (composed: true)\n\n' +
      'e.detail.name:     "' +
      e.detail.name +
      '"\n' +
      'e.detail.greeting: "' +
      e.detail.greeting +
      '"\n\n' +
      "Prueba desde consola:\n" +
      "  window.templateDemo.enabled = false\n" +
      '  window.templateDemo.inputName = "Desde consola"\n' +
      '  window.templateDemo.greeting = "Hola desde la consola!"',
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.vanillaCounter = vanillaCounter; // ._count = 99  → DOM no se actualiza
window.litCounter = litCounter; // .count = 99   → re-render inmediato
window.litProfile = litProfile; // .name / .score / .status
window.templateDemo = templateDemo; // .enabled / .inputName / .greeting

// Funciones de los botones — necesario en módulos ES: onclick busca en window
window.changeName = changeName;
window.addScore = addScore;
window.toggleStatus = toggleStatus;
