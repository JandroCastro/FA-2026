# Lab 02 · JavaScript Avanzado II

## Introducción

Cuando escribes `usuario.getNombre()`, JavaScript no busca ese método
directamente en el objeto `usuario`. Lo busca en una cadena de objetos
enlazados. Cuando usas `class`, estás usando una sintaxis más legible
para definir esa cadena. Cuando un método de clase lanza un error
inesperado, saber que ese método vive en el prototipo —no en la
instancia— te dice exactamente dónde mirar.

Este lab cubre cómo JavaScript organiza los objetos internamente, cómo
funciona la memoria y las herramientas del ecosistema que encontrarás
en cualquier proyecto profesional.

---

## 1. Prototipos y herencia prototipal

A diferencia de otros lenguajes, JavaScript no tiene herencia basada en
clases en sentido estricto. Tiene herencia **basada en prototipos**: los
objetos heredan directamente de otros objetos.

### La cadena de prototipos

Cada objeto tiene una propiedad interna `[[Prototype]]` que apunta a
otro objeto. Cuando accedes a una propiedad que no existe en el objeto,
JavaScript la busca en ese prototipo, luego en el prototipo del
prototipo, y así hasta llegar a `null`.

```js
const producto = { nombre: "Monitor", precio: 549 };

// toString() no está en `producto`,
// pero JS lo encuentra en Object.prototype
console.log(producto.toString()); // "[object Object]"

// Cadena: producto → Object.prototype → null
```

### Object.prototype

Es el objeto del que heredan todos los objetos en JavaScript.
Contiene métodos disponibles en cualquier objeto:

| Método                 | Qué hace                                         |
| ---------------------- | ------------------------------------------------ |
| `hasOwnProperty(prop)` | `true` si la propiedad es propia (no heredada)   |
| `toString()`           | Representación en texto del objeto               |
| `valueOf()`            | Valor primitivo del objeto                       |
| `isPrototypeOf(obj)`   | `true` si este objeto está en la cadena de `obj` |

```js
const config = { theme: "dark", lang: "es" };

config.hasOwnProperty("theme"); // true  — propiedad propia
config.hasOwnProperty("toString"); // false — heredada de Object.prototype

// for…in recorre propiedades propias Y heredadas enumerables
for (const key in config) {
  if (config.hasOwnProperty(key)) {
    console.log(`propia: ${key}`); // theme, lang
  }
}
```

---

## 2. Funciones constructoras

Una función constructora es una función normal que, al llamarse con
`new`, crea un objeto y enlaza su prototipo automáticamente.

```js
function UserProfile(name, email, role) {
  // Propiedades propias: únicas por instancia
  this.name = name;
  this.email = email;
  this.role = role;
}

// Métodos en el prototipo: una sola copia compartida por todas las instancias
UserProfile.prototype.getDisplayName = function () {
  return `${this.name} (${this.role})`;
};

UserProfile.prototype.isAdmin = function () {
  return this.role === "admin";
};

const ana = new UserProfile("Ana García", "ana@empresa.com", "admin");
const marcos = new UserProfile("Marcos López", "marcos@empresa.com", "editor");

ana.getDisplayName(); // "Ana García (admin)"
ana.getDisplayName === marcos.getDisplayName; // true — misma referencia en memoria
```

Qué ocurre cuando usas `new`:

1. Se crea un objeto vacío
2. Su `[[Prototype]]` apunta a `UserProfile.prototype`
3. `this` dentro de la función apunta al nuevo objeto
4. Se ejecuta el cuerpo de la función
5. Se devuelve el nuevo objeto

---

## 3. Clases

La palabra clave `class`, introducida en ES6, es **sugar syntax** sobre
el sistema de prototipos. No cambia el mecanismo: hace el código más
legible.

```js
class UserProfile {
  constructor(name, email, role) {
    this.name = name;
    this.email = email;
    this.role = role;
  }

  // Los métodos definidos aquí van al prototipo, no a la instancia
  getDisplayName() {
    return `${this.name} (${this.role})`;
  }

  isAdmin() {
    return this.role === "admin";
  }

  // Getter: propiedad calculada, se accede sin paréntesis
  get initials() {
    return this.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
}

const user = new UserProfile("Sara Martínez", "sara@empresa.com", "editor");

user.initials; // "SM"
user.initials(); // TypeError: user.initials is not a function
```

### Una clase sigue siendo una función

```js
typeof UserProfile; // "function" — no "class"

// El método NO está en la instancia:
user.hasOwnProperty("getDisplayName"); // false

// Pero SÍ es accesible a través de la cadena:
"getDisplayName" in user; // true
```

### Métodos estáticos

Los métodos `static` pertenecen a la clase, no a las instancias. Se
usan para factories o utilidades relacionadas con la clase.

```js
class UserProfile {
  constructor(name, email, role) {
    /* … */
  }

  static fromApiResponse(apiUser) {
    return new UserProfile(
      apiUser.full_name,
      apiUser.email_address,
      apiUser.user_role,
    );
  }
}

// Se llama en la clase, no en una instancia
const user = UserProfile.fromApiResponse({
  full_name: "Ana García",
  email_address: "ana@empresa.com",
  user_role: "admin",
});
```

---

## 4. Herencia con `extends` y `super`

`extends` establece la cadena de prototipos entre dos clases.
`super` da acceso al constructor y a los métodos de la clase padre.

```js
class Notification {
  constructor(message) {
    this.message = message;
    this.createdAt = new Date();
  }

  render() {
    const el = document.createElement("div");
    el.className = "notification";
    el.textContent = this.message;
    return el;
  }
}

class ErrorNotification extends Notification {
  constructor(message, errorCode) {
    super(message); // obligatorio antes de usar this
    this.errorCode = errorCode;
  }

  render() {
    const el = super.render(); // reutiliza el render base
    el.classList.add("notification--error");
    const code = document.createElement("code");
    code.textContent = this.errorCode;
    el.appendChild(code);
    return el;
  }
}
```

### Reglas de `super`

```js
class SubClass extends BaseClass {
  constructor(...args) {
    super(...args); // siempre primero, antes de acceder a this
    this.extra = "valor";
  }

  someMethod() {
    const base = super.someMethod(); // llama al método del padre
    return base;
  }
}
```

### `instanceof` recorre la cadena

```js
const err = new ErrorNotification("Pago fallido", "PAYMENT_DECLINED");

err instanceof ErrorNotification; // true
err instanceof Notification; // true — hereda de ella
err instanceof Object; // true — todos los objetos heredan de Object
```

---

## 5. Memoria y optimización

### El garbage collector

JavaScript gestiona la memoria automáticamente mediante _mark-and-sweep_:
marca los objetos accesibles desde el código y libera los que ya no
tienen ninguna referencia activa.

### Memory leaks

Una fuga ocurre cuando objetos que ya no necesitas siguen teniendo
referencias activas, impidiendo que el garbage collector los libere.
Con el tiempo degradan el rendimiento y pueden bloquear la aplicación.

#### Patrón 1 · Event listeners sin limpiar

```js
// ❌ Cada llamada a mount() apila un listener nuevo. Los anteriores persisten.
function mount(button, handler) {
  button.addEventListener("click", handler);
}

// ✅ Elimina el listener anterior antes de añadir el nuevo
let currentHandler = null;

function mount(button, handler) {
  if (currentHandler) {
    button.removeEventListener("click", currentHandler);
  }
  currentHandler = handler;
  button.addEventListener("click", handler);
}
```

#### Patrón 2 · Intervals sin limpiar

```js
// ❌ La referencia se pierde: el interval corre para siempre
function startPolling(url) {
  setInterval(async () => {
    const data = await fetch(url).then((r) => r.json());
    updateUI(data);
  }, 5000);
}

// ✅ Guarda la referencia y cancela antes de crear uno nuevo
let pollingId = null;

function startPolling(url) {
  if (pollingId !== null) clearInterval(pollingId);

  pollingId = setInterval(async () => {
    const data = await fetch(url).then((r) => r.json());
    updateUI(data);
  }, 5000);
}

function stopPolling() {
  if (pollingId !== null) {
    clearInterval(pollingId);
    pollingId = null;
  }
}
```

#### Patrón 3 · Closures que retienen referencias grandes

```js
// ❌ sendConfirmation no usa `logs`, pero su closure lo retiene en memoria
function processOrder(orderId) {
  const logs = new Array(10000).fill("entry");

  return function sendConfirmation() {
    console.log(`Pedido ${orderId} confirmado`);
  };
}

// ✅ Consume logs antes de retornar para que el closure no lo capture
function processOrder(orderId) {
  const logs = new Array(10000).fill("entry");
  saveLogs(logs);

  return function sendConfirmation() {
    console.log(`Pedido ${orderId} confirmado`);
  };
}
```

### Herramientas de diagnóstico

- **Chrome DevTools → Memory**: snapshots de heap para comparar estados
  e identificar objetos que no se liberan.
- **Chrome DevTools → Performance**: gráfica de consumo de memoria
  durante una sesión grabada.
- **Lighthouse**: auditoría automatizada de rendimiento en aplicaciones
  web.

---

## 6. npm

Node.js incluye **npm** (Node Package Manager), el mayor repositorio
de paquetes de JavaScript. Permite instalar, versionar y gestionar las
dependencias de cualquier proyecto.

### `package.json`

Fichero central de cualquier proyecto npm. Define nombre, versión,
scripts y dependencias.

```bash
# Inicializa un proyecto (genera package.json)
npm init -y
```

```json
{
  "name": "mi-libreria-utilidades",
  "version": "1.0.0",
  "description": "Utilidades de formateo para la plataforma",
  "main": "index.js",
  "scripts": {
    "build": "babel src -d dist",
    "lint": "eslint src"
  },
  "dependencies": {
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/cli": "^7.23.0"
  }
}
```

### Instalar dependencias

```bash
# Dependencia de producción
npm install date-fns

# Dependencia de desarrollo (no se incluye en producción)
npm install --save-dev eslint

# Instalar todo desde un package.json existente
npm install
```

`node_modules/` contiene todos los paquetes instalados. **Nunca se
sube al repositorio** — añade `node_modules` al `.gitignore`.

### Usar un paquete instalado

```js
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const fecha = format(parseISO("2025-03-15"), "d 'de' MMMM 'de' yyyy", {
  locale: es,
});
// "15 de marzo de 2025"
```

### Publicar un paquete

```bash
npm login              # autenticarse con cuenta de npmjs.com
npm publish            # primera publicación

npm version patch      # 1.0.0 → 1.0.1
npm publish            # actualización
```

---

## 7. Transpiladores

Un transpilador convierte código moderno (ES6+) a una versión que
navegadores más antiguos entienden (ES5). El más utilizado es **Babel**.

### Configuración básica

```bash
npm install --save-dev @babel/core @babel/cli @babel/preset-env
```

`.babelrc`:

```json
{
  "presets": ["@babel/preset-env"]
}
```

`package.json`:

```json
{
"scripts": {
  "build": "babel src -d dist"
}
}
bash
npm run build   # transpila src/ → dist/
```

### Antes y después

```js
// ANTES — src/utils.js (ES6+)
export const greet = (name) => `Hola, ${name}`;

export class UserService {
  async getUser(id) {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
}
js;
// DESPUÉS — dist/utils.js (ES5 generado por Babel)
("use strict");

Object.defineProperty(exports, "__esModule", { value: true });
exports.greet = void 0;

var greet = function greet(name) {
  return "Hola, " + name;
};
exports.greet = greet;

// UserService compilada a función constructora
// con polyfills para async/await
```

---

## 8. RxJS

RxJS es una biblioteca para **programación reactiva** con observables.
Facilita trabajar con flujos de datos asíncronos o basados en eventos
de forma declarativa.

### Conceptos clave

| Concepto         | Qué es                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| **Observable**   | Fuente de datos que emite valores a lo largo del tiempo. Como una promesa, pero puede emitir múltiples valores. |
| **Observer**     | El consumidor: objeto con callbacks `next`, `error` y `complete`.                                               |
| **Subscription** | Lo que obtienes al suscribirte. Permite cancelar.                                                               |
| **Operators**    | Funciones puras que transforman observables: `map`, `filter`, `merge`…                                          |
| **Subject**      | Actúa como observable y observer a la vez. Permite multicast.                                                   |

### Ejemplo mínimo

```js
import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

const precios$ = new Observable((subscriber) => {
  const id = setInterval(() => {
    subscriber.next(+(Math.random() * 100).toFixed(2));
  }, 1000);

  return () => clearInterval(id);
});

const subscription = precios$
  .pipe(
    filter((precio) => precio > 50),
    map((precio) => `${precio.toFixed(2)} €`),
  )
  .subscribe({
    next: (valor) => console.log("Precio:", valor),
    error: (err) => console.error(err),
    complete: () => console.log("Cerrado"),
  });

setTimeout(() => subscription.unsubscribe(), 10000);
```

> RxJS se usa ampliamente con Angular y en situaciones donde necesitas
> coordinar múltiples streams de eventos: WebSockets, inputs en tiempo
> real, polling. Documentación oficial: [rxjs.dev](https://rxjs.dev)

---

## Buenas prácticas

- **Usa `class` en código nuevo.** Las funciones constructoras siguen
  siendo válidas pero `class` es más legible y es el estándar actual.
- **`super()` siempre en la primera línea** del constructor de una
  subclase, antes de acceder a `this`. Si no, `ReferenceError`.
- **Limpia siempre los efectos secundarios**: `removeEventListener`,
  `clearInterval`, `clearTimeout`. Especialmente en componentes que
  se montan y desmontan.
- **No captures referencias innecesarias en closures.** Si un closure
  retiene un objeto grande que no usa, ese objeto no puede ser liberado.
- **`node_modules` al `.gitignore`, siempre.** El `package.json` es
  suficiente para reconstruir las dependencias en cualquier máquina.
- **Separa `dependencies` de `devDependencies`.** Las herramientas de
  build y linting no deben acabar en producción.

---

## Errores comunes

```js
// ❌ Olvidar super() antes de usar this en una subclase
class Admin extends UserProfile {
constructor(name, email) {
  this.permissions = []; // ReferenceError: Must call super constructor
  super(name, email, 'admin');
}
}
// ✅
class Admin extends UserProfile {
constructor(name, email) {
  super(name, email, 'admin'); // primero
  this.permissions = [];       // después
}
}

// ❌ Acceder a un getter con paréntesis
user.initials() // TypeError: user.initials is not a function
// ✅
user.initials   // sin paréntesis

// ❌ Montar un componente varias veces sin limpiar el listener anterior
button.addEventListener('click', handler); // se apilan indefinidamente

// ❌ Olvidar cancelar una suscripción de RxJS
const sub = stream$.subscribe(handler);
// componente destruido sin sub.unsubscribe() → memory leak

// ❌ Confundir herencia con composición
class UserWithCart extends ShoppingCart {} // un usuario no "es" un carrito
// ✅ composición
class User {
constructor() {
  this.cart = new ShoppingCart();
}
}
`
```
