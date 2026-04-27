// ─── SCSS por defecto: mixin con parámetros ───────────────────────────────────
const SCSS_DEFAULT = `
@mixin tarjeta($acento: #6366f1, $padding: 1rem) {
padding:       $padding;
border-radius: 8px;
background:    #1e293b;
border-left:   3px solid $acento;
color:         #f1f5f9;
font-size:     0.875rem;
}

// Tres componentes distintos usan el mismo mixin.
// ¿Cuántas veces aparece el bloque en el CSS final?

.tarjeta-pedido {
@include tarjeta(#6366f1, 1.25rem);
}

.tarjeta-producto {
@include tarjeta(#10b981, 1rem);
}

.tarjeta-usuario {
@include tarjeta(#f59e0b, 0.75rem);
}`;

// ─── Propiedades "firma" del mixin para contar repeticiones ──────────────────
// Son propiedades que el mixin siempre genera: si aparecen N veces → N @include
const FIRMA_MIXIN = [
  "border-radius: 8px",
  "background:    #1e293b",
  "border-left:",
];

// ─── Inyector de CSS ──────────────────────────────────────────────────────────
let estiloTag = null;
function injectCSS(css) {
  if (!estiloTag) {
    estiloTag = document.createElement("style");
    estiloTag.id = "lab03-ex03-compiled";
    document.head.appendChild(estiloTag);
  }
  estiloTag.textContent = css;
}

// ─── Contar cuántas veces se expandió el mixin ───────────────────────────────
function contarExpansiones(css) {
  // Contamos occurrencias de 'border-radius: 8px' como proxy del mixin
  // (cada @include genera un bloque con esta propiedad)
  const matches = css.match(/border-radius:\s*8px/g);
  return matches ? matches.length : 0;
}

// ─── Calcular bytes ──────────────────────────────────────────────────────────
function calcBytes(str) {
  return new Blob([str]).size;
}

// ─── Renderizar estadísticas ──────────────────────────────────────────────────
function renderEstadisticas(css, expansiones) {
  const seccion = document.getElementById("copy-section");
  const stats = document.getElementById("copy-stats");
  const output = document.getElementById("output-copias");

  seccion.style.display = "block";

  // Versión alternativa con clase compartida (mismo resultado visual, menos CSS)
  const cssConClase = `.tarjeta {
padding: 1rem;
border-radius: 8px;
background: #1e293b;
color: #f1f5f9;
font-size: 0.875rem;
}
.tarjeta--pedido   { border-left: 3px solid #6366f1; padding: 1.25rem; }
.tarjeta--producto { border-left: 3px solid #10b981; }
.tarjeta--usuario  { border-left: 3px solid #f59e0b; padding: .75rem; }`;

  const bytesMixin = calcBytes(css);
  const bytesClase = calcBytes(cssConClase);

  stats.innerHTML = `
  <div class="stat-card">
    <div class="stat-card__value">${expansiones}</div>
    <div class="stat-card__label">veces que se copió el bloque del mixin</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__value">${bytesMixin}B</div>
    <div class="stat-card__label">bytes con mixin (3× @include)</div>
  </div>
  <div class="stat-card">
    <div class="stat-card__value">${bytesClase}B</div>
    <div class="stat-card__label">bytes con clase compartida</div>
  </div>`;

  output.textContent = [
    "// El mixin expande su bloque en cada @include.",
    `// Con 3 @include → el bloque aparece ${expansiones} veces en el CSS.`,
    "",
    "// ¿Cuándo usar mixin vs clase compartida?",
    "//",
    "// Mixin: cuando el código generado VARÍA según los parámetros.",
    "//   → Cada @include produce un bloque diferente.",
    "//",
    "// Clase compartida: cuando el código es idéntico para todos.",
    "//   → Un solo bloque, todos los elementos lo heredan.",
    "//",
    "// Este mixin genera bloques diferentes (padding y color-left distintos)",
    "// → Aquí el mixin tiene sentido.",
    "//",
    "// Si todos los @include usaran los mismos parámetros,",
    "// una clase .tarjeta sería más eficiente.",
  ].join("\n");

  // Expone en window
  window.mixinStats = { expansiones, bytesMixin, bytesClase };
}

// ─── Compilar ─────────────────────────────────────────────────────────────────
function compilarSCSS() {
  const scssInput = document.getElementById("scss-editor").value;
  const cssOutput = document.getElementById("css-output");
  const status = document.getElementById("compile-status");

  status.textContent = "Compilando…";
  status.style.color = "var(--clr-text-muted)";

  Sass.compile(scssInput, function (result) {
    if (result.status === 0) {
      cssOutput.textContent = result.text;
      cssOutput.style.color = "#86efac";
      status.textContent = "✓ Compilado";
      status.style.color = "var(--clr-success)";
      injectCSS(result.text);
      renderEstadisticas(result.text, contarExpansiones(result.text));
      window.lastCompiledCSS = result.text;
    } else {
      cssOutput.textContent = "⚠ Error:\n\n" + result.message;
      cssOutput.style.color = "#fca5a5";
      status.textContent = "✗ Error";
      status.style.color = "var(--clr-danger)";
      document.getElementById("copy-section").style.display = "none";
    }
  });
}

// ─── Restablecer ─────────────────────────────────────────────────────────────
function resetEditor() {
  document.getElementById("scss-editor").value = SCSS_DEFAULT;
  document.getElementById("css-output").textContent =
    'Pulsa "Compilar" para ver el resultado.';
  document.getElementById("css-output").style.color = "#86efac";
  document.getElementById("compile-status").textContent = "";
  document.getElementById("copy-section").style.display = "none";
  if (estiloTag) estiloTag.textContent = "";
  window.lastCompiledCSS = null;
  window.mixinStats = null;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.getElementById("scss-editor").value = SCSS_DEFAULT;

// Consola:
// window.mixinStats       → { expansiones, bytesMixin, bytesClase }
// window.lastCompiledCSS  → CSS compilado completo
