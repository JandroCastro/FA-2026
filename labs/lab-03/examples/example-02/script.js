// ─── SCSS por defecto: nesting profundo real ──────────────────────────────────
const SCSS_DEFAULT = `// Componente: menú de navegación
// Cuenta los niveles de nesting antes de compilar.

.main-nav {
background: #1e293b;
padding: 0.5rem 0;

  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;

    .nav-item {

      .nav-link {
        display: block;
        padding: 0.75rem 1rem;
        color: #94a3b8;
        font-size: 0.875rem;
        text-decoration: none;

        &:hover {
          color: #f1f5f9;
          background: rgba(255, 255, 255, 0.05);
        }

        &.is-active {
          color: #6366f1;
          font-weight: 600;
        }
      }
    }
  }
}`;

// ─── Inyector de CSS ──────────────────────────────────────────────────────────
let estiloTag = null;
function injectCSS(css) {
  if (!estiloTag) {
    estiloTag = document.createElement("style");
    estiloTag.id = "lab03-ex02-compiled";
    document.head.appendChild(estiloTag);
  }
  estiloTag.textContent = css;
}

// ─── Extraer selectores del CSS compilado ────────────────────────────────────
function extraerSelectores(css) {
  const resultados = [];
  // Cada regla en CSS compilado de LibSass tiene el selector en su propia línea
  const regex = /^([^{@\n\/][^{\n]*?)\s*\{/gm;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const selector = match[1].trim();
    if (!selector || selector.startsWith("@") || selector.startsWith("/*"))
      continue;
    // Profundidad = número de partes separadas por espacio (heurística)
    const partes = selector.split(/\s+/).filter(Boolean).length;
    resultados.push({ selector, partes });
  }
  return resultados;
}

// ─── Renderizar análisis de selectores ───────────────────────────────────────
function renderAnalisis(selectores) {
  const contenedor = document.getElementById("selector-list");
  const seccion = document.getElementById("selector-analysis");

  if (selectores.length === 0) {
    seccion.style.display = "none";
    return;
  }

  seccion.style.display = "block";
  contenedor.innerHTML = "";

  selectores.forEach(({ selector, partes }) => {
    const depthClass =
      partes <= 2 ? "depth-ok" : partes === 3 ? "depth-warn" : "depth-danger";
    const item = document.createElement("div");
    item.className = `selector-item ${depthClass}`;
    item.innerHTML = `
    <span class="depth-badge">${partes} ${partes === 1 ? "parte" : "partes"}</span>
    <span class="selector-text">${selector}</span>`;
    contenedor.appendChild(item);
  });

  // Expone en window para explorar en consola
  window.compiledSelectors = selectores;
}

// ─── Compilar SCSS ───────────────────────────────────────────────────────────
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
      renderAnalisis(extraerSelectores(result.text));
      window.lastCompiledCSS = result.text;
    } else {
      cssOutput.textContent = "⚠ Error:\n\n" + result.message;
      cssOutput.style.color = "#fca5a5";
      status.textContent = "✗ Error";
      status.style.color = "var(--clr-danger)";
      document.getElementById("selector-analysis").style.display = "none";
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
  document.getElementById("selector-analysis").style.display = "none";
  if (estiloTag) estiloTag.textContent = "";
  window.compiledSelectors = null;
  window.lastCompiledCSS = null;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.getElementById("scss-editor").value = SCSS_DEFAULT;

// Consola:
// window.compiledSelectors  → array de { selector, partes }
// window.lastCompiledCSS    → CSS compilado completo
