//labs/lab-02/examples/example-03/script.js`

// ─── Contador de instancias (scope del módulo) ───────────────────────────────
let _notifCount = 0;

// ─── Clase base ──────────────────────────────────────────────────────────────

class Notification {
  constructor(message) {
    this.id = ++_notifCount;
    this.message = message;
    this.createdAt = new Date();
  }

  get timeLabel() {
    return this.createdAt.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  // Método base: crea el elemento DOM con las partes comunes a todas las notificaciones
  render() {
    const el = document.createElement("div");
    el.className = "notif";
    el.dataset.id = this.id;
    el.innerHTML = `
    <span class="notif__time">${this.timeLabel}</span>
    <span class="notif__message">${this.message}</span>
  `;
    return el;
  }
}

// ─── Subclases ───────────────────────────────────────────────────────────────

class SuccessNotification extends Notification {
  constructor(message, actionLabel = null) {
    super(message); // llama al constructor de Notification
    this.actionLabel = actionLabel;
  }

  render() {
    const el = super.render(); // reutiliza el render base, no lo duplica
    el.classList.add("notif--success");
    if (this.actionLabel) {
      const btn = document.createElement("button");
      btn.className = "notif__action";
      btn.textContent = this.actionLabel;
      btn.onclick = () => el.classList.add("notif--acted");
      el.appendChild(btn);
    }
    return el;
  }
}

class ErrorNotification extends Notification {
  constructor(message, errorCode) {
    super(message);
    this.errorCode = errorCode;
  }

  render() {
    const el = super.render();
    el.classList.add("notif--error");
    if (this.errorCode) {
      const code = document.createElement("code");
      code.className = "notif__code";
      code.textContent = this.errorCode;
      el.appendChild(code);
    }
    return el;
  }
}

class WarningNotification extends Notification {
  constructor(message) {
    super(message);
  }

  render() {
    const el = super.render();
    el.classList.add("notif--warning");
    const closeBtn = document.createElement("button");
    closeBtn.className = "notif__close";
    closeBtn.textContent = "×";
    closeBtn.onclick = () => el.remove();
    el.appendChild(closeBtn);
    return el;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addToPanel(notification) {
  const panel = document.getElementById("notification-panel");
  const empty = panel.querySelector(".empty-state");
  if (empty) empty.remove();
  panel.appendChild(notification.render());
}

function demoSuccess() {
  addToPanel(
    new SuccessNotification(
      "Pedido #4821 enviado correctamente.",
      "Ver pedido",
    ),
  );
}

function demoError() {
  addToPanel(
    new ErrorNotification("No se pudo procesar el pago.", "PAYMENT_DECLINED"),
  );
}

function demoWarning() {
  addToPanel(new WarningNotification("Tu sesión expirará en 5 minutos."));
}

function clearPanel() {
  document.getElementById("notification-panel").innerHTML =
    '<p class="empty-state">Pulsa los botones para añadir notificaciones.</p>';
}

// ─── Demo instanceof ─────────────────────────────────────────────────────────

function demoInstanceof() {
  const success = new SuccessNotification("Perfil actualizado.");
  const error = new ErrorNotification("Error de red.", "NET_ERR");
  const warning = new WarningNotification("Espacio en disco bajo.");

  const output = document.getElementById("output-instanceof");
  output.style.display = "block";
  output.textContent = [
    "// Cada instancia es de su propia clase…",
    `success instanceof SuccessNotification  →  ${success instanceof SuccessNotification}`,
    `error   instanceof ErrorNotification    →  ${error instanceof ErrorNotification}`,
    `success instanceof ErrorNotification    →  ${success instanceof ErrorNotification}`,

    "",
    "// …y también de la clase base:",
    `success instanceof Notification  →  ${success instanceof Notification}`,
    `error   instanceof Notification  →  ${error instanceof Notification}`,
    `warning instanceof Notification  →  ${warning instanceof Notification}`,
    "",
    "// Útil para gestionar listas mixtas:",
    "// notifications.forEach(n => {",
    "//   if (n instanceof ErrorNotification) reportToMonitoring(n);",
    "// });",
  ].join("\n");

  window.sampleSuccess = success;
  window.sampleError = error;
}
