// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: InfoCard — template + shadow DOM + slots
// ─────────────────────────────────────────────────────────────────────────────

class InfoCard extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;

    // Adjuntamos el Shadow DOM y clonamos la template en él.
    // Shadow DOM se explica en profundidad en el ejemplo 04.
    var shadow = this.attachShadow({ mode: "open" });
    var tpl = document.getElementById("info-card-tpl");
    shadow.appendChild(tpl.content.cloneNode(true));
  }
}

customElements.define("info-card", InfoCard);

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

function log(outId, msg) {
  var el = document.getElementById(outId);
  if (!el) return;
  var ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
  el.textContent = "[" + ts + "]\n" + msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — template: clonar, inspeccionar, limpiar
// ─────────────────────────────────────────────────────────────────────────────

var clonesCount = 0;

function clonarTemplate() {
  var tpl = document.getElementById("card-plantilla");
  var clone = tpl.content.cloneNode(true); // true = copia profunda

  clonesCount++;

  // Rellenamos los huecos dinámicos del clon
  var numEl = clone.querySelector(".clone-card__num");
  var tsEl = clone.querySelector(".clone-ts-value");
  if (numEl) numEl.textContent = "#" + clonesCount;
  if (tsEl)
    tsEl.textContent = new Date().toLocaleTimeString("es-ES", {
      hour12: false,
    });

  // Ocultar placeholder en el primer clon
  var ph = document.getElementById("clones-placeholder");
  if (ph) ph.style.display = "none";

  document.getElementById("clones-area").appendChild(clone);

  log(
    "out-s1",
    "tpl.content.cloneNode(true) → DocumentFragment independiente\n\n" +
      "Clon #" +
      clonesCount +
      " insertado en el DOM.\n" +
      "La template original permanece intacta:\n" +
      '  document.getElementById("card-plantilla").content.children.length\n' +
      "  → " +
      document.getElementById("card-plantilla").content.children.length +
      "\n\n" +
      "Cada clon es un nodo nuevo — modificar uno no afecta a los demás.",
  );
}

function inspectarTemplate() {
  var tpl = document.getElementById("card-plantilla");

  log(
    "out-s1",
    'document.getElementById("card-plantilla")\n\n' +
      "  tagName                      → " +
      tpl.tagName +
      "\n" +
      '  id                           → "' +
      tpl.id +
      '"\n' +
      "  isConnected                  → " +
      tpl.isConnected +
      "  ✅ está en el DOM\n" +
      "  content                      → " +
      tpl.content.constructor.name +
      "\n" +
      "  content.children.length      → " +
      tpl.content.children.length +
      "\n" +
      "  content.firstElementChild    → " +
      tpl.content.firstElementChild.className +
      "\n\n" +
      'document.querySelector("template") devuelve el elemento porque\n' +
      "está en el DOM, aunque no renderice nada visible.\n\n" +
      'Compruébalo en DevTools → Elements → busca <template id="card-plantilla">',
  );
}

function limpiarClones() {
  var area = document.getElementById("clones-area");
  area.innerHTML = "";

  var ph = document.createElement("p");
  ph.id = "clones-placeholder";
  ph.style.cssText =
    "color:var(--clr-text-disabled);font-size:0.8125rem;" +
    "text-align:center;padding:1.5rem 0;margin:0;" +
    "font-family:var(--font-mono);";
  ph.textContent = 'Ningún clon todavía — pulsa "Clonar"';
  area.appendChild(ph);

  clonesCount = 0;

  log(
    "out-s1",
    "Clones eliminados del DOM.\n\n" +
      "La template original no se modifica — sigue disponible:\n" +
      '  document.getElementById("card-plantilla").content → ' +
      document.getElementById("card-plantilla").content.constructor.name,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — slots: inspeccionar assignedNodes y Light DOM
// ─────────────────────────────────────────────────────────────────────────────

function inspeccionarSlots() {
  var cards = document.querySelectorAll("info-card");
  var msg = "";

  cards.forEach(function (card, i) {
    var cardId = card.id || "card[" + i + "]";
    msg += "── " + cardId + " ──\n";

    // Light DOM: los elementos con slot="X" viven AQUÍ, fuera del shadow
    var lightChildren = Array.prototype.slice.call(card.children);
    if (lightChildren.length === 0) {
      msg += "  Light DOM: (vacío — todos los slots usan fallback)\n";
    } else {
      lightChildren.forEach(function (child) {
        var slotName = child.getAttribute("slot") || "(default)";
        msg +=
          '  Light DOM [slot="' +
          slotName +
          '"]: ' +
          child.tagName.toLowerCase() +
          ' → "' +
          child.textContent.trim().substring(0, 28) +
          (child.textContent.trim().length > 28 ? "…" : "") +
          '"\n';
      });
    }

    // Shadow DOM: los <slot> con su assignedNodes
    var shadow = card.shadowRoot;
    if (shadow) {
      var slots = shadow.querySelectorAll("slot");
      slots.forEach(function (slot) {
        var name = slot.getAttribute("name") || "(default)";
        var assigned = slot.assignedNodes();
        var status =
          assigned.length > 0
            ? assigned.length + " nodo(s) asignado(s)"
            : "0 asignados → muestra fallback";
        msg +=
          '  Shadow [slot="' + name + '"].assignedNodes() → ' + status + "\n";
      });
    }
    msg += "\n";
  });

  msg +=
    "Clave: el contenido de los slots vive en el Light DOM.\n" +
    "document.querySelector('info-card [slot=\"title\"]') lo devuelve ✅\n" +
    "El Shadow DOM solo decide DÓNDE se proyecta ese contenido.";

  log("out-s2", msg);
}

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW EXPORTS — para explorar en DevTools
// ─────────────────────────────────────────────────────────────────────────────

window.InfoCard = InfoCard;
window.card1 = document.getElementById("card-1");
window.card2 = document.getElementById("card-2");
window.card3 = document.getElementById("card-3");
// Prueba en consola:
//   window.card1.shadowRoot.querySelectorAll('slot')
//   window.card1.shadowRoot.querySelector('slot[name="title"]').assignedNodes()
//   window.card1.querySelector('[slot="title"]')  ← Light DOM, accesible normal
//   document.getElementById('card-plantilla').content
