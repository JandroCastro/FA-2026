// ─────────────────────────────────────────────────────────────────────────────
// LOG DE CICLO DE VIDA — debe definirse antes de customElements.define
// porque connectedCallback se dispara durante el upgrade (al hacer define)
// ─────────────────────────────────────────────────────────────────────────────

var LOG_TYPE = {
  connected: "connected",
  disconnected: "disconnected",
  attr: "attr",
  cart: "cart",
};

function addToLog(msg, type) {
  var logEl = document.getElementById("lifecycle-log");
  if (!logEl) return;

  var empty = document.getElementById("log-empty");
  if (empty) empty.style.display = "none";

  var ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  var entry = document.createElement("div");
  entry.className = "log-entry log-entry--" + (type || "cart");

  var tsEl = document.createElement("span");
  tsEl.className = "log-entry__ts";
  tsEl.textContent = ts;

  var msgEl = document.createElement("span");
  msgEl.className = "log-entry__msg";
  msgEl.textContent = msg;

  entry.appendChild(tsEl);
  entry.appendChild(msgEl);

  // Más reciente arriba
  logEl.insertBefore(entry, logEl.firstChild);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: ProductCard
// Custom Element + Template + Shadow DOM + Slots + Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

class ProductCard extends HTMLElement {
  static get observedAttributes() {
    return ["data-stock"];
  }

  constructor() {
    super();
    this._shadow = null; // se crea en connectedCallback
    this._intervalId = null;
    this._secondsConnected = 0;
  }

  connectedCallback() {
    if (!this._shadow) {
      // Primera conexión: crear Shadow DOM y clonar template
      this._shadow = this.attachShadow({ mode: "open" });
      var tpl = document.getElementById("product-card-tpl");
      this._shadow.appendChild(tpl.content.cloneNode(true));

      // Conectar el botón de carrito (solo la primera vez)
      var self = this;
      this._shadow
        .getElementById("btn-add")
        .addEventListener("click", function () {
          self._onAddToCart();
        });
    }

    // Siempre al conectar: actualizar badge y arrancar timer
    this._updateBadge();
    this._startTimer();

    addToLog(
      "✅ connectedCallback → " +
        (this.id || "product-card") +
        " | isConnected: " +
        this.isConnected,
      LOG_TYPE.connected,
    );
  }

  disconnectedCallback() {
    // ⚠️  Limpiar el intervalo para evitar memory leak
    this._stopTimer();

    addToLog(
      "🔴 disconnectedCallback → " +
        (this.id || "product-card") +
        " | intervalo limpiado",
      LOG_TYPE.disconnected,
    );
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name !== "data-stock") return;
    this._updateBadge();
    addToLog(
      '🟡 attributeChangedCallback → data-stock: "' +
        (oldVal === null ? "null" : oldVal) +
        '" → "' +
        newVal +
        '"',
      LOG_TYPE.attr,
    );
  }

  // ── Métodos privados ──────────────────────────────────

  _updateBadge() {
    if (!this._shadow) return;
    var badge = this._shadow.getElementById("stock-badge");
    if (!badge) return;

    var raw = this.getAttribute("data-stock");
    var stock = parseInt(raw, 10);

    if (raw === null || isNaN(stock) || stock > 5) {
      badge.textContent = "En stock";
      badge.className = "badge badge--ok";
    } else if (stock > 0) {
      badge.textContent = "Últimas " + stock;
      badge.className = "badge badge--warn";
    } else {
      badge.textContent = "Agotado";
      badge.className = "badge badge--sold-out";
    }
  }

  _startTimer() {
    this._stopTimer(); // limpiar cualquier intervalo previo
    this._secondsConnected = 0;
    var self = this;
    this._intervalId = setInterval(function () {
      self._secondsConnected++;
      var timerEl = self._shadow && self._shadow.getElementById("timer");
      if (timerEl) timerEl.textContent = self._secondsConnected;
    }, 1000);
  }

  _stopTimer() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  _onAddToCart() {
    var btn = this._shadow.getElementById("btn-add");
    var stock = parseInt(this.getAttribute("data-stock"), 10);

    if (!isNaN(stock) && stock === 0) {
      btn.textContent = "❌ Agotado";
      setTimeout(function () {
        btn.textContent = "Añadir al carrito";
      }, 1000);
      return;
    }

    var titleEl = this.querySelector('[slot="title"]');
    var title = titleEl ? titleEl.textContent.trim() : "Producto";

    btn.textContent = "✅ Añadido";
    setTimeout(function () {
      btn.textContent = "Añadir al carrito";
    }, 1500);

    addToLog('🛒 "' + title + '" añadido al carrito', LOG_TYPE.cart);
  }
}

customElements.define("product-card", ProductCard);

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLES — sección 2
// ─────────────────────────────────────────────────────────────────────────────

function setStock(cardId, stock) {
  var card = document.getElementById(cardId);
  if (card) card.setAttribute("data-stock", String(stock));
}

var dynamicCount = 0;

var DYNAMIC_EMOJIS = ["📦", "🖥️", "🖱️", "💾", "🔋", "🎮"];
var DYNAMIC_COLORS = [
  "#1e3a5f",
  "#1a3a2e",
  "#3a1a1a",
  "#2a1a3a",
  "#1a2a3a",
  "#3a2a1a",
];

function addCard() {
  dynamicCount++;

  var card = document.createElement("product-card");
  card.id = "dynamic-card-" + dynamicCount;
  card.setAttribute("data-stock", String(Math.floor(Math.random() * 20) + 1));

  var emoji = DYNAMIC_EMOJIS[(dynamicCount - 1) % DYNAMIC_EMOJIS.length];
  var color = DYNAMIC_COLORS[(dynamicCount - 1) % DYNAMIC_COLORS.length];

  var imgEl = document.createElement("div");
  imgEl.setAttribute("slot", "image");
  imgEl.style.cssText =
    "height:130px;display:flex;align-items:center;" +
    "justify-content:center;font-size:3rem;background:" +
    color +
    ";";
  imgEl.textContent = emoji;

  var titleEl = document.createElement("span");
  titleEl.setAttribute("slot", "title");
  titleEl.textContent = "Producto dinámico #" + dynamicCount;

  var priceEl = document.createElement("span");
  priceEl.setAttribute("slot", "price");
  priceEl.textContent = "€" + (Math.floor(Math.random() * 150) + 20);

  var descEl = document.createElement("span");
  descEl.setAttribute("slot", "description");
  descEl.textContent = "Creado con document.createElement()";

  card.appendChild(imgEl);
  card.appendChild(titleEl);
  card.appendChild(priceEl);
  card.appendChild(descEl);

  document.getElementById("cards-container").appendChild(card);
  window.cards = Array.prototype.slice.call(
    document.querySelectorAll("product-card"),
  );
}

function removeLastCard() {
  var container = document.getElementById("cards-container");
  var cards = container.querySelectorAll("product-card");
  if (cards.length === 0) {
    addToLog("⚠️  No hay cards que eliminar", LOG_TYPE.cart);
    return;
  }
  var last = cards[cards.length - 1];
  container.removeChild(last);
  window.cards = Array.prototype.slice.call(
    document.querySelectorAll("product-card"),
  );
}

function clearLog() {
  var logEl = document.getElementById("lifecycle-log");
  logEl.innerHTML = "";

  var empty = document.createElement("p");
  empty.id = "log-empty";
  empty.style.cssText =
    "color:var(--clr-text-disabled);font-size:0.8125rem;" +
    "text-align:center;padding:1rem;margin:0;font-family:var(--font-mono);";
  empty.textContent = "Los eventos aparecerán aquí…";
  logEl.appendChild(empty);
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.ProductCard = ProductCard;
window.cards = Array.prototype.slice.call(
  document.querySelectorAll("product-card"),
);
// Prueba en consola:
//   window.cards[0].getAttribute('data-stock')
//   window.cards[0].setAttribute('data-stock', '0')
//   window.cards[0].shadowRoot.querySelector('.card')
//   window.cards[0]._intervalId        // el ID del setInterval activo
//   window.cards[0]._secondsConnected  // segundos desde el último connect
//   window.cards[2].shadowRoot.getElementById('stock-badge').textContent
