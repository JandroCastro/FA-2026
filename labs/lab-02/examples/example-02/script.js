// ─── Versión 1: Función constructora (ES5) ──────────────────────────────────

function UserV1(name, email, role) {
  this.name = name;
  this.email = email;
  this.role = role;
  this.createdAt = new Date();
}

UserV1.prototype.getDisplayName = function () {
  return `${this.name} (${this.role})`;
};

UserV1.prototype.isAdmin = function () {
  return this.role === "admin";
};

// ─── Versión 2: Clase (ES6+) ────────────────────────────────────────────────

class UserV2 {
  constructor(name, email, role) {
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = new Date();
  }

  getDisplayName() {
    return `${this.name} (${this.role})`;
  }

  isAdmin() {
    return this.role === "admin";
  }

  get initials() {
    return this.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
}

// ─── Demo 1 · Comparación visual ────────────────────────────────────────────

function demoComparison() {
  const u1 = new UserV1("Ana García", "ana@empresa.com", "admin");
  const u2 = new UserV2("Marcos López", "marcos@empresa.com", "editor");

  const container = document.getElementById("output-comparison");
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "comparison";
  grid.appendChild(buildUserCard("UserV1 — función constructora", u1));
  grid.appendChild(buildUserCard("UserV2 — clase", u2));
  container.appendChild(grid);

  window.u1 = u1;
  window.u2 = u2;

  console.log(typeof UserV1, typeof UserV2);
}

function buildUserCard(label, user) {
  const col = document.createElement("div");
  col.className = "comparison-col";

  const lbl = document.createElement("div");
  lbl.className = "comparison-col__label";
  lbl.textContent = label;

  const card = document.createElement("div");
  card.className = "user-card";
  card.innerHTML = `
  <div class="user-card__name">${user.getDisplayName()}</div>
  <div class="user-card__email">${user.email}</div>
  <div class="user-card__meta">
    <span class="role-badge role--${user.role}">${user.role}</span>
    ${
      user.isAdmin()
        ? '<span style="font-size:.75rem;color:var(--clr-text-muted)">· acceso total</span>'
        : ""
    }
  </div>
`;

  col.appendChild(lbl);
  col.appendChild(card);
  return col;
}

// ─── Demo 2 · Bajo el capó ───────────────────────────────────────────────────

function demoUnderHood() {
  const instance = new UserV2("test", "test@t.com", "viewer");

  const output = document.getElementById("output-hood");
  output.style.display = "block";
  output.textContent = [
    "// Una clase sigue siendo una función:",
    `typeof UserV1  →  "${typeof UserV1}"`,
    `typeof UserV2  →  "${typeof UserV2}"`,
    "",
    "// El método NO está en la instancia:",
    `instance.hasOwnProperty('getDisplayName')  →  ${instance.hasOwnProperty("getDisplayName")}`,
    "",
    '// Pero SÍ es accesible a través de la cadena (operador "in"):',
    `'getDisplayName' in instance  →  ${"getDisplayName" in instance}`,
    "",
    "// instanceof funciona igual en ambas versiones:",
    `new UserV1('x','x','viewer') instanceof UserV1  →  ${new UserV1("x", "x", "viewer") instanceof UserV1}`,
    `new UserV2('x','x','viewer') instanceof UserV2  →  ${new UserV2("x", "x", "viewer") instanceof UserV2}`,
    "",
    "// Prueba en consola: u2.__proto__ === UserV2.prototype",
  ].join("\n");
}

// ─── Demo 3 · Getters ────────────────────────────────────────────────────────

function demoGetters() {
  const users = [
    new UserV2("Ana García", "ana@empresa.com", "admin"),
    new UserV2("Marcos López", "marcos@empresa.com", "editor"),
    new UserV2("Sara Martínez", "sara@empresa.com", "viewer"),
  ];

  const output = document.getElementById("output-getters");
  output.style.display = "block";
  output.textContent = [
    "// Getter: se accede como propiedad, sin paréntesis",
    "",
    ...users.map(
      (u) =>
        `${u.name.padEnd(18)}  initials: "${u.initials}"   isAdmin: ${String(u.isAdmin()).padEnd(5)}`,
    ),
    // ...users.map(
    //   (u) =>
    //     `${u.name.padEnd(18)}  initials: "${u.initials()}"   isAdmin: ${String(u.isAdmin()).padEnd(5)}`,
    // ),
    "",
    "// user.initials    ← correcto",
    "// user.initials()  ← TypeError: user.initials is not a function",
  ].join("\n");

  window.users = users;
}

// ─── Consola · Preguntas del instructor ─────────────────────────────────────

const _instance = new UserV2("test", "test@t.com", "viewer");

console.group('📌 Pregunta 1 — ¿typeof devuelve "function" o "class"?');
console.log("typeof UserV1 →", typeof UserV1);
console.log("typeof UserV2 →", typeof UserV2);
console.groupEnd();

console.group("📌 Pregunta 2 — ¿El método está en la instancia?");
console.log(
  "_instance.hasOwnProperty('getDisplayName') →",
  _instance.hasOwnProperty("getDisplayName"),
);
console.log(
  "'getDisplayName' in _instance              →",
  "getDisplayName" in _instance,
);
console.groupEnd();

console.group("📌 Pregunta 3 — ¿instanceof funciona igual en ambas versiones?");
console.log(
  "new UserV1(...) instanceof UserV1 →",
  new UserV1("x", "x", "viewer") instanceof UserV1,
);
console.log(
  "new UserV2(...) instanceof UserV2 →",
  new UserV2("x", "x", "viewer") instanceof UserV2,
);
console.groupEnd();

console.group("📌 Pregunta 4 — ¿La instancia apunta a UserV2.prototype?");
console.log(
  "_instance.__proto__ === UserV2.prototype →",
  _instance.__proto__ === UserV2.prototype,
);
console.groupEnd();
