// ─── Breakpoints ─────────────────────────────────────────────────────────────
const BREAKPOINTS = [
  { id: "xs", label: "< 400px", min: 0, max: 399, cols: 1, color: "#94a3b8" },
  {
    id: "sm",
    label: "400–599px",
    min: 400,
    max: 599,
    cols: 2,
    color: "#6366f1",
  },
  {
    id: "lg",
    label: "600–799px",
    min: 600,
    max: 799,
    cols: 3,
    color: "#10b981",
  },
  {
    id: "xl",
    label: "800px+",
    min: 800,
    max: Infinity,
    cols: 4,
    color: "#f59e0b",
  },
];

// ─── Productos de ejemplo ─────────────────────────────────────────────────────
const PRODUCTS = [
  { emoji: "💻", name: "MacBook Pro", price: "€2.499" },
  { emoji: "📱", name: "iPhone 15", price: "€1.199" },
  { emoji: "🎧", name: "AirPods Pro", price: "€279" },
  { emoji: "⌚", name: "Apple Watch", price: "€429" },
  { emoji: "🖥", name: 'iMac 24"', price: "€1.699" },
  { emoji: "📷", name: "Sony A7 IV", price: "€2.799" },
  { emoji: "🕹", name: "PlayStation 5", price: "€549" },
  { emoji: "📺", name: 'LG OLED 55"', price: "€1.299" },
];

// ─── Estado global ────────────────────────────────────────────────────────────
window.demoWidth = 340;
window.currentBreakpoint = () => getBP(window.demoWidth).id;
window.onBreakpointChange = null; // hook: window.onBreakpointChange = (bp) => console.log(bp)

// ─── Obtener breakpoint para un ancho ────────────────────────────────────────
function getBP(width) {
  return (
    BREAKPOINTS.find((bp) => width >= bp.min && width <= bp.max) ||
    BREAKPOINTS[0]
  );
}

// ─── Renderizar producto cards ────────────────────────────────────────────────
function renderProductos() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = PRODUCTS.map(
    (p) => `
  <div class="product-card">
    <div class="product-card__img">${p.emoji}</div>
    <div class="product-card__body">
      <div class="product-card__name">${p.name}</div>
      <div class="product-card__price">${p.price}</div>
    </div>
  </div>`,
  ).join("");
}

// ─── Renderizar pills de breakpoints ─────────────────────────────────────────
function renderBPScale(activoId) {
  document.getElementById("bp-scale").innerHTML = BREAKPOINTS.map(
    (bp) => `
  <span class="bp-pill ${bp.id === activoId ? "active" : ""}" title="${bp.label}">
    ${bp.id} · ${bp.label}
  </span>`,
  ).join("");
}

// ─── Actualizar demo según ancho del slider ───────────────────────────────────
function actualizarDemo(width) {
  const bp = getBP(width);
  const viewport = document.getElementById("demo-viewport");
  const bpBadge = document.getElementById("bp-badge");
  const widthLbl = document.getElementById("width-label");
  const prevBP = window.currentBreakpoint();

  window.demoWidth = width;

  // Aplica ancho y clase de breakpoint al viewport simulado
  viewport.style.maxWidth = width + "px";
  viewport.className = "demo-viewport bp-" + bp.id;

  bpBadge.textContent = bp.id;
  bpBadge.style.color = bp.color;
  widthLbl.textContent = width + "px";

  renderBPScale(bp.id);
  renderCodigoComparacion(bp.id);

  // Dispara el hook si el breakpoint cambió
  if (bp.id !== prevBP && typeof window.onBreakpointChange === "function") {
    window.onBreakpointChange(bp.id);
  }
}

// ─── Renderizar paneles de código con regla activa resaltada ─────────────────
function renderCodigoComparacion(bpActivo) {
  // Reglas mobile first
  const mobileFirst = [
    {
      bp: "xs",
      code: ".grid { grid-template-columns: 1fr; }                  /* base: movil */",
    },
    {
      bp: "sm",
      code: "@media (min-width: 576px)  {\n  .grid { grid-template-columns: 1fr 1fr; }\n}",
    },
    {
      bp: "lg",
      code: "@media (min-width: 992px)  {\n  .grid { grid-template-columns: 1fr 1fr 1fr; }\n}",
    },
    {
      bp: "xl",
      code: "@media (min-width: 1200px) {\n  .grid { grid-template-columns: 1fr 1fr 1fr 1fr; }\n}",
    },
  ];

  const desktopFirst = [
    {
      bp: "xl",
      code: ".grid { grid-template-columns: 1fr 1fr 1fr 1fr; }     /* base: desktop */",
    },
    {
      bp: "lg",
      code: "@media (max-width: 1199px) {\n  .grid { grid-template-columns: 1fr 1fr 1fr; }\n}",
    },
    {
      bp: "sm",
      code: "@media (max-width: 991px)  {\n  .grid { grid-template-columns: 1fr 1fr; }\n}",
    },
    {
      bp: "xs",
      code: "@media (max-width: 575px)  {\n  .grid { grid-template-columns: 1fr; }\n}",
    },
  ];

  function renderPanel(reglas, elId) {
    document.getElementById(elId).innerHTML = reglas
      .map((r) => {
        const esActiva = r.bp === bpActivo;
        const cls = esActiva ? "rule-active" : "rule-dim";
        return `<span class="${cls}">${escHtml(r.code)}</span>`;
      })
      .join("\n\n");
  }

  renderPanel(mobileFirst, "code-mobile-first");
  renderPanel(desktopFirst, "code-desktop-first");
}

function escHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Slider event ─────────────────────────────────────────────────────────────
document.getElementById("width-slider").addEventListener("input", function () {
  actualizarDemo(parseInt(this.value, 10));
});

// ─── Init ─────────────────────────────────────────────────────────────────────
renderProductos();
actualizarDemo(340);

window.currentBreakpoint();
window.demoWidth;
window.onBreakpointChange = (bp) => console.log("Cambió a:", bp);
