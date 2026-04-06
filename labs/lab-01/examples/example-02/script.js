// ── Funciones mock — simulan llamadas a una API real ──────────────

const MOCK_USER = { id: 42, name: "Ana García" };
const MOCK_PROFILE = { role: "admin", department: "Ingeniería" };
const MOCK_PERMISSIONS = ["read", "write", "delete"];
const MOCK_PREFS = { theme: "dark", lang: "es" };

function loginUser(credentials) {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_USER), 500));
}

function loadProfile(userId) {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PROFILE), 400));
}

function loadPermissions(role) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_PERMISSIONS), 300),
  );
}

function loadPreferences(permissions) {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PREFS), 200));
}

function renderDashboard(profile, permissions, prefs) {
  log(`✅ Dashboard listo`);
  log(`   Perfil: ${profile.role} · ${profile.department}`);
  log(`   Permisos: [${permissions.join(", ")}]`);
  log(`   Tema: ${prefs.theme} · Idioma: ${prefs.lang}`);
}

function showError(message) {
  log(`❌ Error: ${message}`);
}

function hideLoader() {
  log(`🔄 Loader ocultado`);
}

// ── Utilidad de output ────────────────────────────────────────────

function log(text) {
  const out = document.getElementById("output-evolution");
  if (!out) return;
  const line = document.createElement("div");
  line.textContent = text;
  line.style.cssText =
    "font-family:var(--font-mono);font-size:.8125rem;color:#a5b4fc;margin-bottom:.25rem";
  out.appendChild(line);
}

function clearOutput() {
  const out = document.getElementById("output-evolution");
  if (out) out.innerHTML = "";
}

// ── Versión 1: Callbacks ──────────────────────────────────────────

function runCallbacks() {
  clearOutput();
  log("⏳ Iniciando con callbacks...");

  loginUser(
    { user: "ana", pass: "1234" },
    function (user) {
      log(`→ loginUser: ${user.name}`);
      loadProfile(
        user.id,
        function (profile) {
          log(`→ loadProfile: ${profile.role}`);
          loadPermissions(
            profile.role,
            function (permissions) {
              log(`→ loadPermissions: [${permissions.join(", ")}]`);
              loadPreferences(
                user.id,
                function (prefs) {
                  log(`→ loadPreferences: tema ${prefs.theme}`);
                  renderDashboard(profile, permissions, prefs);
                },
                (err) => showError(err.message),
              );
            },
            (err) => showError(err.message),
          );
        },
        (err) => showError(err.message),
      );
    },
    (err) => showError(err.message),
  );
}

// Versión de loginUser que acepta callbacks (para la demo)
function loginUser(credentials, onSuccess, onError) {
  if (onSuccess) {
    setTimeout(() => onSuccess(MOCK_USER), 500);
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_USER), 500));
  }
}

function loadProfile(userId, onSuccess, onError) {
  if (onSuccess) {
    setTimeout(() => onSuccess(MOCK_PROFILE), 400);
  } else {
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_PROFILE), 400),
    );
  }
}

function loadPermissions(role, onSuccess, onError) {
  if (onSuccess) {
    setTimeout(() => onSuccess(MOCK_PERMISSIONS), 300);
  } else {
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_PERMISSIONS), 300),
    );
  }
}

function loadPreferences(userId, onSuccess, onError) {
  if (onSuccess) {
    setTimeout(() => onSuccess(MOCK_PREFS), 200);
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PREFS), 200));
  }
}

// ── Versión 2: Promises ───────────────────────────────────────────

function runPromises() {
  clearOutput();
  log("⏳ Iniciando con promises...");

  loginUser({ user: "ana", pass: "1234" })
    .then((user) => {
      log(`→ loginUser: ${user.name}`);
      return loadProfile(user.id);
    })
    .then((profile) => {
      log(`→ loadProfile: ${profile.role}`);
      return loadPermissions(profile.role);
    })
    .then((permissions) => {
      log(`→ loadPermissions: [${permissions}]`);
      return loadPreferences(permissions);
    })
    .then((prefs) => {
      log(`→ loadPreferences: tema ${prefs.theme}`);
      renderDashboard(MOCK_PROFILE, MOCK_PERMISSIONS, prefs);
    })
    .catch((error) => showError(error.message))
    .finally(() => hideLoader());
}

// ── Versión 3: Async/Await ────────────────────────────────────────

async function runAsync() {
  clearOutput();
  log("⏳ Iniciando con async/await...");

  try {
    const user = await loginUser({ user: "ana", pass: "1234" });
    log(`→ loginUser: ${user.name}`);

    const profile = await loadProfile(user.id);
    log(`→ loadProfile: ${profile.role}`);

    const permissions = await loadPermissions(profile.role);
    log(`→ loadPermissions: [${permissions.join(", ")}]`);

    const prefs = await loadPreferences(permissions);
    log(`→ loadPreferences: tema ${prefs.theme}`);

    renderDashboard(profile, permissions, prefs);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}

// ── Tabs ──────────────────────────────────────────────────────────

function showTab(name, btn) {
  document
    .querySelectorAll(".code-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(`panel-${name}`).classList.add("active");
  btn.classList.add("active");
}

// ── Sección 2: fetch + render al DOM ─────────────────────────────

const transactions = [
  { id: 1, desc: "Nómina abril", amount: 2400, type: "income" },
  { id: 2, desc: "Alquiler", amount: 800, type: "expense" },
  { id: 3, desc: "Proyecto extra", amount: 600, type: "income" },
  { id: 4, desc: "Supermercado", amount: 120, type: "expense" },
];

function fakeFetch(data, delay = 900) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

function renderItem(t) {
  const item = document.createElement("div");
  item.classList.add("transaction", `transaction--${t.type}`);

  const desc = document.createElement("span");
  desc.textContent = t.desc;

  const amount = document.createElement("span");
  amount.textContent = `${t.type === "expense" ? "-" : "+"}${t.amount} €`;

  item.appendChild(desc);
  item.appendChild(amount);
  return item;
}

async function loadTransactions() {
  const loader = document.getElementById("loader");
  const list = document.getElementById("list");

  list.innerHTML = "";
  loader.classList.remove("hidden");

  try {
    const data = await fakeFetch(transactions);
    data.forEach((t) => list.appendChild(renderItem(t)));
  } finally {
    loader.classList.add("hidden");
  }
}

document.getElementById("btn-load").addEventListener("click", loadTransactions);
