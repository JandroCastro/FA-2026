function createCounter(initial = 0) {
  let count = initial;

  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    reset() {
      count = 0;
    },
    value() {
      return count;
    },
  };
}

// ── Sección 1: un contador ────────────────────────────────────────
const counter = createCounter(0);
const display = document.getElementById("counter-display");
const note = document.getElementById("counter-note");

function update() {
  display.textContent = counter.value();
  note.textContent = `counter.value() → ${counter.value()}`;
}

document.getElementById("btn-inc").addEventListener("click", () => {
  counter.increment();
  update();
});

document.getElementById("btn-dec").addEventListener("click", () => {
  counter.decrement();
  update();
});

document.getElementById("btn-reset").addEventListener("click", () => {
  counter.reset();
  update();
});

// ── Sección 2: dos instancias independientes ──────────────────────
const counterA = createCounter(0);
const counterB = createCounter(100);

function stepA(n) {
  n > 0 ? counterA.increment() : counterA.decrement();
  document.getElementById("val-a").textContent = counterA.value();
}

function stepB(n) {
  n > 0 ? counterB.increment() : counterB.decrement();
  document.getElementById("val-b").textContent = counterB.value();
}

// Exponer al scope global para inspeccionar desde la consola
window.counter = counter;
window.counterA = counterA;
window.counterB = counterB;
