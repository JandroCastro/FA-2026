//labs/lab-02/examples/example-04/script.js`

// ─── Sección 1 · Event listeners acumulados ────────────────────────────────

let leakyMountCount = 0;
let leakyHandlerFires = 0;
let cleanListener = null;
let cleanFires = 0;

// ── Sin limpiar ────────────────────────────────────────────────────────────

function mountLeaky() {
  leakyMountCount++;

  // Cada llamada añade un listener nuevo sin eliminar el anterior.
  // removeEventListener nunca se llama → los handlers se apilan.
  document.getElementById("btn-test-leaky").addEventListener("click", () => {
    leakyHandlerFires++;
    document.getElementById("leaky-fires").textContent = leakyHandlerFires;
  });

  const n = leakyMountCount;
  document.getElementById("leaky-status").textContent =
    `${n} montaje${n > 1 ? "s" : ""} — ${n} listener${n > 1 ? "s" : ""} apilado${n > 1 ? "s" : ""}`;
}

// ── Con limpieza ───────────────────────────────────────────────────────────

function mountClean() {
  const btn = document.getElementById("btn-test-clean");

  // Elimina el listener anterior antes de registrar el nuevo.
  // removeEventListener necesita la misma referencia de función: por eso se guarda.
  if (cleanListener) {
    btn.removeEventListener("click", cleanListener);
  }

  cleanListener = () => {
    cleanFires++;
    document.getElementById("clean-fires").textContent = cleanFires;
  };

  btn.addEventListener("click", cleanListener);
  document.getElementById("clean-status").textContent =
    "Remontado — siempre 1 listener activo";
}

// ─── Sección 2 · Intervals acumulados ─────────────────────────────────────

let leakyIntervalCount = 0;
let cleanIntervalId = null;
let priceLeaky = 100;
let priceClean = 100;

// ── Sin limpiar ────────────────────────────────────────────────────────────

function startIntervalLeaky() {
  leakyIntervalCount++;

  // Sin guardar la referencia no hay forma de cancelar este interval.
  // Cada llamada añade uno nuevo: se acumulan y el ticker se acelera.
  setInterval(() => {
    priceLeaky += (Math.random() - 0.5) * 1.5;
    document.getElementById("price-leaky").textContent =
      priceLeaky.toFixed(2) + " €";
  }, 600);

  const n = leakyIntervalCount;
  document.getElementById("interval-leaky-status").textContent =
    `${n} interval${n > 1 ? "s" : ""} activo${n > 1 ? "s" : ""} — velocidad ${n}×`;
}

//Funcion nueva cada vez vs referencia interna guardad

// ── Con limpieza ───────────────────────────────────────────────────────────

function startIntervalClean() {
  // Cancela el interval anterior antes de crear uno nuevo

  console.log(cleanIntervalId);
  if (cleanIntervalId !== null) {
    clearInterval(cleanIntervalId);
  }

  cleanIntervalId = setInterval(() => {
    priceClean += (Math.random() - 0.5) * 1.5;
    document.getElementById("price-clean").textContent =
      priceClean.toFixed(2) + " €";
  }, 600);
}

function stopIntervalClean() {
  if (cleanIntervalId !== null) {
    clearInterval(cleanIntervalId);
    cleanIntervalId = null;
    document.getElementById("price-clean").textContent = "detenido";
  }
}
