// ─── Tokens expuestos en window ──────────────────────────────────────────────
window.tokens = { primary: "#6366f1", danger: "#e11d48" };

// ─── Estado ──────────────────────────────────────────────────────────────────
let temaActivo = "indigo";
let estiloTag = null;

// ─── SCSS por defecto ────────────────────────────────────────────────────────
const SCSS_DEFAULT = `
$primary:  #6366f1;
$radius:   8px;
$spacing:  1rem;
$fs-title: 1.125rem;

.demo-card {
background:    $primary;
border-radius: $radius;
padding:       $spacing;
color:         #fff;

  .demo-card__title {
    font-size:   $fs-title;
    font-weight: 600;
  }

  .demo-card__body {
    font-size:  0.875rem;
    opacity:    0.85;
    margin-top: 0.5rem;
  }
}`;

// ─── Inyectar CSS compilado ──────────────────────────────────────────────────
function injectCSS(css) {
  if (!estiloTag) {
    estiloTag = document.createElement("style");
    estiloTag.id = "lab03-ex01-compiled";
    document.head.appendChild(estiloTag);
  }
  estiloTag.textContent = css;
}

// ─── Compilar SCSS ───────────────────────────────────────────────────────────
function compilarSCSS() {
  const scssInput = document.getElementById("scss-editor").value;
  const cssOutput = document.getElementById("css-output");
  const status = document.getElementById("compile-status");
  const preview = document.getElementById("preview-area");

  status.textContent = "Compilando…";
  status.style.color = "var(--clr-text-muted)";

  Sass.compile(scssInput, function (result) {
    if (result.status === 0) {
      cssOutput.textContent = result.text;
      cssOutput.style.color = "#86efac";
      status.textContent = "✓ Compilado";
      status.style.color = "var(--clr-success)";
      injectCSS(result.text);
      preview.innerHTML = `
      <div class="demo-card">
        <div class="demo-card__title">Pedido #4821</div>
        <div class="demo-card__body">
          Estos estilos vienen del CSS compilado.
          Las variables SCSS ya no existen en este archivo.
        </div>
      </div>`;
      window.lastCompiledCSS = result.text;
    } else {
      cssOutput.textContent = "⚠ Error:\n\n" + result.message;
      cssOutput.style.color = "#fca5a5";
      status.textContent = "✗ Error de compilación";
      status.style.color = "var(--clr-danger)";
    }
  });
}

// ─── Restablecer editor ──────────────────────────────────────────────────────
function resetEditor() {
  document.getElementById("scss-editor").value = SCSS_DEFAULT;
  document.getElementById("css-output").textContent =
    'Pulsa "Compilar" para ver el resultado.';
  document.getElementById("css-output").style.color = "#86efac";
  document.getElementById("compile-status").textContent = "";
  document.getElementById("preview-area").innerHTML =
    '<div class="demo-card">Previsualización: compila para ver los estilos aplicados.</div>';
  if (estiloTag) estiloTag.textContent = "";
  window.lastCompiledCSS = null;
}

// ─── Toggle de tema con CSS custom property ──────────────────────────────────
function toggleTheme() {
  temaActivo = temaActivo === "indigo" ? "red" : "indigo";
  const color =
    temaActivo === "red" ? window.tokens.danger : window.tokens.primary;

  document.documentElement.style.setProperty("--demo-primary", color);
  document.getElementById("label-css").textContent = `--demo-primary: ${color}`;

  const output = document.getElementById("output-theme");
  output.style.display = "block";
  output.textContent = [
    "// JS modifica la custom property en tiempo real:",
    `document.documentElement.style.setProperty('--demo-primary', '${color}')`,
    "",
    "// Todos los elementos que usen var(--demo-primary) se actualizan.",
    "// Verificar en consola:",
    `getComputedStyle(document.documentElement).getPropertyValue('--demo-primary')`,
    `// → " ${color}"`,
  ].join("\n");

  window.tokens.currentTheme = color;
}

// ─── Demostrar que $variable no existe en runtime ────────────────────────────
function intentarCambiarSCSS() {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(
    "$primary",
  );
  const output = document.getElementById("output-theme");
  output.style.display = "block";
  output.textContent = [
    "// Intentamos leer la variable SCSS desde JavaScript:",
    `getComputedStyle(document.documentElement).getPropertyValue('$primary')`,
    `// → "${valor}" (vacío — $primary no existe en el navegador)`,
    "",
    "// El compilador ya sustituyó $primary por #6366f1 antes de enviar el CSS.",
    "// El swatch izquierdo tiene esto hardcoded:",
    "//   background: #6366f1;  ← valor estático, inaccesible desde JS",
    "",
    "// Para un dark mode toggle necesitas custom properties, no variables SCSS.",
  ].join("\n");
}

// ─── Patrón profesional (estático) ───────────────────────────────────────────
function renderPatron() {
  document.getElementById("output-pattern").textContent = [
    "// 1. Define valores base en SCSS:",
    "$brand:       #6366f1;",
    "$brand-hover: #4f46e5;",
    "",
    "// 2. Expónlos como custom properties (#{} interpola el valor):",
    ":root {",
    "  --color-primary:       #{$brand};",
    "  --color-primary-hover: #{$brand-hover};",
    "}",
    "",
    "// 3. Los componentes usan custom properties, nunca variables SCSS:",
    ".btn {",
    "  background: var(--color-primary);",
    "  &:hover { background: var(--color-primary-hover); }",
    "}",
    "",
    "// 4. JavaScript controla el tema en runtime:",
    "// document.documentElement.style.setProperty('--color-primary', '#e11d48');",
  ].join("\n");
}

// ─── Init ────────────────────────────────────────────────────────────────────
document.getElementById("scss-editor").value = SCSS_DEFAULT;
renderPatron();

// Consola: window.tokens, window.lastCompiledCSS
// getComputedStyle(document.documentElement).getPropertyValue("--demo-primary");
// getComputedStyle(document.documentElement).getPropertyValue("$primary"); // → ''
