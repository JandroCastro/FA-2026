//`labs/lab-02/examples/example-01/script.js`

// ─── Entidad ────────────────────────────────────────────────────────────────
// Usamos función constructora :

function Product(name, price, stock) {
  // Propiedades propias: únicas por instancia
  this.name = name;
  this.price = price;
  this.stock = stock;
  //inventado
}

// Métodos en el prototipo: una sola copia, compartida por todas las instancias
Product.prototype.isAvailable = function () {
  return this.stock > 0;
};

Product.prototype.formatPrice = function () {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(this.price);
};

// ─── Demo 1 · Propiedades propias vs heredadas ──────────────────────────────

function demoOwnProps() {
  const product = new Product("Monitor 4K", 549, 12);

  const container = document.getElementById("output-own");
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "prop-grid";

  // for…in recorre propiedades propias Y heredadas enumerables
  for (const key in product) {
    const isOwn = product.hasOwnProperty(key);
    const badge = document.createElement("span");
    badge.className = `prop-badge prop-badge--${isOwn ? "own" : "inherited"}`;
    badge.textContent = isOwn
      ? `${key}: ${JSON.stringify(product[key])}`
      : `${key}()  ← prototipo`;
    grid.appendChild(badge);
  }

  container.appendChild(grid);
  document.getElementById("legend-own").style.display = "flex";

  window.product = product;
}

// ─── Demo 2 · Visualizar la cadena de prototipos ────────────────────────────

function demoChain() {
  const product = new Product("Teclado mecánico", 129, 7);

  const container = document.getElementById("output-chain");
  container.innerHTML = "";

  const nodes = [
    {
      cls: "chain-node--instance",
      label: "product (instancia)",
      content: `name: "${product.name}"  ·  price: ${product.price}  ·  stock: ${product.stock}`,
    },
    {
      cls: "chain-node--proto",
      label: "Product.prototype",
      content: "isAvailable()  ·  formatPrice()",
    },
    {
      cls: "chain-node--object",
      label: "Object.prototype",
      content:
        "hasOwnProperty()  ·  toString()  ·  valueOf()  ·  isPrototypeOf()  · …",
    },
    {
      cls: "chain-node--null",
      label: "null",
      content: "Final de la cadena. Propiedad no encontrada → undefined.",
    },
  ];

  const diagram = document.createElement("div");
  diagram.className = "chain-diagram";

  nodes.forEach((item, i) => {
    const node = document.createElement("div");
    node.className = `chain-node ${item.cls}`;
    node.innerHTML = `<div class="chain-node__label">${item.label}</div>${item.content}`;
    diagram.appendChild(node);

    if (i < nodes.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "chain-arrow";
      arrow.textContent = "↓  [[Prototype]]";
      diagram.appendChild(arrow);
    }
  });

  container.appendChild(diagram);
  window.chainProduct = product;

  // chainProduct.__proto__                    // Product.prototype
  // chainProduct.__proto__.__proto__          // Object.prototype
  // chainProduct.__proto__.__proto__.__proto__ // null
}

// ─── Demo 3 · Métodos compartidos ───────────────────────────────────────────

function demoShared() {
  const p1 = new Product("Monitor", 549, 3);
  const p2 = new Product("Teclado", 89, 0);
  const p3 = new Product("Ratón", 45, 15);

  const output = document.getElementById("output-shared");
  output.style.display = "block";
  output.textContent = [
    "// ¿Las instancias comparten el mismo método (misma referencia en memoria)?",
    `p1.formatPrice === p2.formatPrice  →  ${p1.formatPrice === p2.formatPrice}`,
    `p2.formatPrice == p3.formatPrice  →  ${p2.formatPrice === p3.formatPrice}`,
    "",
    "// Cada instancia ejecuta el método con sus propios datos:",
    `p1.formatPrice()   →  ${p1.formatPrice()}`,
    `p2.isAvailable()   →  ${p2.isAvailable()}  (stock: ${p2.stock})`,
    `p3.isAvailable()   →  ${p3.isAvailable()}  (stock: ${p3.stock})`,
    "",
    "// Prueba en consola: p1.__proto__ === Product.prototype",
  ].join("\n");

  console.log(p1.name === p2.name);

  window.p1 = p1;
  window.p2 = p2;
  window.p3 = p3;
}
