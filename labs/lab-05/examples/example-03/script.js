// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  const el = document.getElementById(outId);
  if (!el) return;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent = "[" + ts + "]\n" + msg;
}

function flash(id, cls, ms) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms || 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTBUS — implementación mínima sobre EventTarget nativo
// ─────────────────────────────────────────────────────────────────────────────

class EventBus extends EventTarget {
  emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { detail: detail || {} }));
  }
  on(eventName, handler) {
    this.addEventListener(eventName, handler);
  }
  off(eventName, handler) {
    this.removeEventListener(eventName, handler);
  }
}

const bus = new EventBus();
window.bus = bus;

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS COMPARTIDOS DEL SHADOW DOM
// Definidos antes de customElements.define: el upgrade es síncrono
// y connectedCallback llama a _buildShadow en ese momento.
// ─────────────────────────────────────────────────────────────────────────────

const SHARED_SHADOW_CSS =
  ":host { display: block; }" +
  " .wrapper { padding: 1.25rem; border-radius: var(--radius);" +
  " background: var(--clr-bg-2); border: 1px solid var(--clr-border); }" +
  " .comp-title { font-size: .75rem; font-family: var(--font-mono);" +
  " color: var(--clr-text-muted); margin: 0 0 .875rem; }" +
  " .flash-comp { outline: 2px solid var(--clr-primary-border);" +
  " outline-offset: 2px; }";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: bus-sender
// ─────────────────────────────────────────────────────────────────────────────

class BusSender extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;
    this._shadow = this.attachShadow({ mode: "open" });
    this._buildShadow();
  }

  _buildShadow() {
    const style = document.createElement("style");
    style.textContent =
      SHARED_SHADOW_CSS +
      " .input { width: 100%; box-sizing: border-box; padding: .5rem .75rem;" +
      " border-radius: 6px; border: 1px solid var(--clr-border);" +
      " background: var(--clr-bg-3); color: var(--clr-text);" +
      " font-family: var(--font-sans); font-size: .875rem;" +
      " margin-bottom: .625rem; display: block; }" +
      " .input:focus { outline: none; border-color: var(--clr-primary); }" +
      " .btn { padding: .5rem 1.25rem; border-radius: 6px; cursor: pointer;" +
      " font-size: .875rem; font-family: var(--font-sans);" +
      " background: var(--clr-primary-bg);" +
      " border: 1px solid var(--clr-primary-border);" +
      " color: var(--clr-primary-light); }" +
      " .btn:hover { filter: brightness(1.15); }";

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const title = document.createElement("p");
    title.className = "comp-title";
    title.textContent = "bus-sender  →  emite al bus";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "input";
    input.placeholder = "Escribe un mensaje…";
    this._input = input;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Enviar";

    btn.addEventListener("click", () => this._send());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this._send();
    });

    wrapper.appendChild(title);
    wrapper.appendChild(input);
    wrapper.appendChild(btn);
    this._shadow.appendChild(style);
    this._shadow.appendChild(wrapper);
  }

  _send() {
    const text = this._input.value.trim();
    if (!text) return;

    bus.emit("bus-message", { text: text, source: this.id });
    this._input.value = "";
    this._input.focus();

    const w = this._shadow.querySelector(".wrapper");
    if (w) {
      w.classList.add("flash-comp");
      setTimeout(() => w.classList.remove("flash-comp"), 350);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: bus-receiver
// ─────────────────────────────────────────────────────────────────────────────

class BusReceiver extends HTMLElement {
  connectedCallback() {
    if (!this._shadow) {
      this._shadow = this.attachShadow({ mode: "open" });
      this._buildShadow();
    }
    // Nueva referencia en cada conexión para que off() funcione exactamente
    this._handler = (e) => this._onMessage(e);
    bus.on("bus-message", this._handler);
    this._updateStatus(true);
  }

  disconnectedCallback() {
    // Sin esta llamada, el bus seguiría invocando el handler aunque
    // el elemento no esté en el DOM. Cada reconexión acumularía un handler más.

    bus.off("bus-message", this._handler);
    this._handler = null;
    this._updateStatus(false);
  }

  _buildShadow() {
    const style = document.createElement("style");
    style.textContent =
      SHARED_SHADOW_CSS +
      " .status { font-size: .75rem; font-family: var(--font-mono); margin: 0 0 .625rem; }" +
      " .status--on  { color: #10b981; }" +
      " .status--off { color: #ef4444; }" +
      " .msg-list { list-style: none; margin: 0; padding: 0; }" +
      " .msg-item { padding: .375rem .625rem; border-radius: 4px; font-size: .8125rem;" +
      " font-family: var(--font-mono); background: var(--clr-bg-3);" +
      " margin-bottom: .375rem; color: var(--clr-text); }" +
      " .empty { font-size: .8125rem; color: var(--clr-text-muted);" +
      " font-family: var(--font-mono); margin: 0; }";

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const title = document.createElement("p");
    title.className = "comp-title";
    title.textContent = "bus-receiver  ←  escucha al bus";

    const statusEl = document.createElement("p");
    statusEl.className = "status status--on";
    statusEl.textContent = "● suscrito";
    this._statusEl = statusEl;

    const emptyEl = document.createElement("p");
    emptyEl.className = "empty";
    emptyEl.textContent = "Sin mensajes todavía…";
    this._emptyEl = emptyEl;

    const list = document.createElement("ul");
    list.className = "msg-list";
    this._list = list;

    wrapper.appendChild(title);
    wrapper.appendChild(statusEl);
    wrapper.appendChild(emptyEl);
    wrapper.appendChild(list);
    this._shadow.appendChild(style);
    this._shadow.appendChild(wrapper);
  }

  _onMessage(e) {
    const { text, source } = e.detail;

    this._emptyEl.style.display = "none";

    const li = document.createElement("li");
    li.className = "msg-item";
    li.textContent = text + "  [" + source + "]";
    this._list.insertBefore(li, this._list.firstChild);

    if (this._list.children.length > 4) {
      this._list.removeChild(this._list.lastChild);
    }

    const w = this._shadow.querySelector(".wrapper");
    if (w) {
      w.classList.add("flash-comp");
      setTimeout(() => w.classList.remove("flash-comp"), 350);
    }
  }

  _updateStatus(connected) {
    if (!this._statusEl) return;
    this._statusEl.className =
      "status " + (connected ? "status--on" : "status--off");
    this._statusEl.textContent = connected ? "● suscrito" : "○ desuscrito";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// customElements.define — DESPUÉS de todas las clases y helpers
// ─────────────────────────────────────────────────────────────────────────────

customElements.define("bus-sender", BusSender);
customElements.define("bus-receiver", BusReceiver);

// ─────────────────────────────────────────────────────────────────────────────
// Referencias
// ─────────────────────────────────────────────────────────────────────────────

const sender = document.getElementById("sender");
const receiver = document.getElementById("receiver");

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — mostrar el código del bus + botones de prueba
// ─────────────────────────────────────────────────────────────────────────────

const busCodeLines = [
  "class EventBus extends EventTarget {",
  "  emit(eventName, detail) {",
  "    this.dispatchEvent(new CustomEvent(eventName, { detail }));",
  "  }",
  "  on(eventName, handler)  { this.addEventListener(eventName, handler); }",
  "  off(eventName, handler) { this.removeEventListener(eventName, handler); }",
  "}",
  "const bus = new EventBus();",
];
document.getElementById("bus-code-display").textContent =
  busCodeLines.join("\n");

// Flag para detectar si el handler de bus-test disparó antes de que
// testBusEmit() llegue a su propio log(). bus.emit() es síncrono:
// el handler se ejecuta dentro de la llamada a emit, antes de que
// testBusEmit() continúe. Sin el flag, testBusEmit sobreescribiría
// el mensaje del handler.
let s1HandlerFired = false;

function testBusOn() {
  s1HandlerFired = false;
  bus.on("bus-test", function onceHandler(e) {
    bus.off("bus-test", onceHandler);
    s1HandlerFired = true;
    log(
      "out-s1",
      'Handler recibió "bus-test":\n' +
        '  e.detail.msg → "' +
        e.detail.msg +
        '"\n\n' +
        "on()  = addEventListener sobre el bus\n" +
        "off() = removeEventListener sobre el bus\n" +
        "emit() = dispatchEvent con CustomEvent\n\n" +
        "Prueba desde la consola:\n" +
        "  window.bus.on('bus-test', e => console.log('recibido:', e.detail.msg))\n" +
        "  window.bus.emit('bus-test', { msg: 'desde la consola' })\n\n" +
        "Cualquier código con acceso al bus puede emitir o escuchar.\n" +
        "Los componentes no necesitan conocerse entre sí.",
    );
  });
  log(
    "out-s1",
    'Listener añadido para "bus-test".\n\n' +
      'Ahora pulsa "⚡ Emitir al bus" para dispararlo.\n' +
      "El handler se elimina automáticamente tras la primera recepción.",
  );
}

function testBusEmit() {
  s1HandlerFired = false;
  bus.emit("bus-test", { msg: "mensaje de prueba" });

  // Si el handler disparó durante emit(), s1HandlerFired ya es true aquí.
  // No sobreescribimos su mensaje.
  if (!s1HandlerFired) {
    log(
      "out-s1",
      'bus.emit("bus-test", { msg: "mensaje de prueba" })\n\n' +
        "No había ningún listener activo: el evento se perdió silenciosamente.\n\n" +
        'Suscríbete primero con "👂 Suscribirse al bus" y vuelve a emitir.',
    );
  }
  s1HandlerFired = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — observer del bus para el log de tráfico
// ─────────────────────────────────────────────────────────────────────────────

let msgCount = 0;

bus.on("bus-message", function (e) {
  msgCount++;
  flash("bus-node", "flash-bus", 350);

  const out = document.getElementById("out-s2");
  if (!out) return;
  const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  out.textContent +=
    "[" +
    ts +
    "] #" +
    msgCount +
    '  "' +
    e.detail.text +
    '"' +
    "  origen: " +
    e.detail.source +
    "\n";
});

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — disconnect / reconnect
// ─────────────────────────────────────────────────────────────────────────────

let receiverParent = null;

function removeReceiver() {
  if (!receiver.isConnected) {
    log("out-s3", "El receiver ya está desconectado.");
    return;
  }
  receiverParent = receiver.parentElement;
  receiverParent.removeChild(receiver);

  log(
    "out-s3",
    "Receiver eliminado del DOM.\n\n" +
      "disconnectedCallback() disparó:\n" +
      '  bus.off("bus-message", handler)  ← suscripción eliminada\n\n' +
      "Envía mensajes desde la sección 2.\n" +
      "El bus los distribuye al log, pero este receiver no los recibe.\n\n" +
      "Prueba desde consola:\n" +
      '  window.bus.emit("bus-message", { text: "test", source: "consola" })',
  );
}

function restoreReceiver() {
  if (receiver.isConnected) {
    log("out-s3", "El receiver ya está conectado.");
    return;
  }
  if (!receiverParent) return;

  receiverParent.appendChild(receiver);

  log(
    "out-s3",
    "Receiver reconectado al DOM.\n\n" +
      "connectedCallback() disparó:\n" +
      '  bus.on("bus-message", nuevoHandler)  ← nueva suscripción\n\n' +
      "Los mensajes vuelven a llegar.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.sender = sender;
window.receiver = receiver;
// window.bus ya exportado al crear la instancia
// Prueba: window.bus.emit("bus-message", { text: "hola", source: "consola" })
