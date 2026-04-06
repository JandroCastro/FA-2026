# Lab 01 · JavaScript Avanzado I

## Introducción

El 80% de los bugs más difíciles de reproducir en frontend están relacionados
con la asincronía: datos que llegan en el orden equivocado, estados que no se
actualizan cuando deberían, o funciones que se ejecutan antes de que una
petición termine.

Este lab te da las herramientas para entender qué pasa realmente cuando
JavaScript ejecuta tu código. No como recetas, sino desde la base. Cuando
entiendas el Event Loop, dejarás de adivinar y empezarás a razonar.

---

## 1. Callbacks

Un callback es una función que pasas como argumento a otra función para que
sea ejecutada en el momento adecuado, normalmente cuando una operación
termina.

### ¿Por qué existen?

JavaScript es single-threaded: solo puede hacer una cosa a la vez. Para
operaciones que tardan tiempo (una petición HTTP, un temporizador, un evento
de usuario) necesita un mecanismo para decir _"cuando esto termine, ejecuta
esto"_ sin quedarse bloqueado esperando.

### Ejemplo 1 · El callback más básico

```js
// Los métodos de array son el ejemplo más cotidiano de callback
const products = [
  { id: 1, name: "Monitor", price: 350 },
  { id: 2, name: "Teclado", price: 80 },
  { id: 3, name: "Ratón", price: 45 },
];

// forEach recibe un callback y lo ejecuta por cada elemento
products.forEach((product) => {
  console.log(`${product.name}: ${product.price}€`);
});

// filter devuelve los elementos para los que el callback retorna true
const affordable = products.filter((p) => p.price < 100);
// [{ id: 2, name: 'Teclado', price: 80 }, { id: 3, name: 'Ratón', price: 45 }]
```

### Ejemplo 2 · Callback en operación asíncrona

```js
// Simula una llamada a una API de autenticación
function authenticateUser(credentials, onSuccess, onError) {
  setTimeout(() => {
    if (credentials.password.length >= 8) {
      onSuccess({ id: 1, name: credentials.username, role: "admin" });
    } else {
      onError(new Error("La contraseña debe tener al menos 8 caracteres"));
    }
  }, 1000); // simula latencia de red
}

authenticateUser(
  { username: "ana@empresa.com", password: "segura123" },
  (user) => console.log("Sesión iniciada:", user),
  (error) => console.error("Error:", error.message),
);
```

### El problema: Callback Hell

Cuando encadenas operaciones asíncronas, el código se convierte en una pirámide que nadie quiere mantener:

```js
// Login → cargar perfil → cargar permisos → cargar preferencias
loginUser(
  credentials,
  function (user) {
    loadProfile(
      user.id,
      function (profile) {
        loadPermissions(
          profile.role,
          function (permissions) {
            loadPreferences(
              user.id,
              function (prefs) {
                renderDashboard(profile, permissions, prefs);
                // 4 niveles. Añade gestión de errores y explota.
              },
              onError,
            );
          },
          onError,
        );
      },
      onError,
    );
  },
  onError,
);
```

Este es exactamente el problema que Promises y async/await resuelven.

## 2. Event Loop

Este es el concepto más importante del lab. Entenderlo cambia cómo lees, escribes y depuras cualquier código JavaScript.

http://latentflip.com/loupe/?code=JC5vbignYnV0dG9uJywgJ2NsaWNrJywgZnVuY3Rpb24gb25DbGljaygpIHsKICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZXIoKSB7CiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBjbGlja2VkIHRoZSBidXR0b24hJyk7ICAgIAogICAgfSwgMjAwMCk7Cn0pOwoKY29uc29sZS5sb2coIkhpISIpOwoKc2V0VGltZW91dChmdW5jdGlvbiB0aW1lb3V0KCkgewogICAgY29uc29sZS5sb2coIkNsaWNrIHRoZSBidXR0b24hIik7Cn0sIDUwMDApOwoKY29uc29sZS5sb2coIldlbGNvbWUgdG8gbG91cGUuIik7!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D

### La premisa

JavaScript tiene un único hilo de ejecución. Solo puede procesar una instrucción a la vez. Sin embargo, puede hacer peticiones a servidores, gestionar temporizadores y responder a eventos de usuario sin bloquearse. ¿Cómo?

### Los tres componentes

Call Stack — La pila de ejecución

Aquí se ejecuta el código. Funciona como una pila LIFO (última en entrar, primera en salir). Cuando llamas a una función, entra al stack. Cuando termina, sale.

```js
function formatPrice(amount) {
  return `${amount.toFixed(2)} €`;
}

function renderProduct(product) {
  const price = formatPrice(product.price); // formatPrice entra al stack
  console.log(`${product.name}: ${price}`); // formatPrice ya salió
}

renderProduct({ name: "Monitor", price: 349.99 });
// Stack: renderProduct → formatPrice → [vacío]
```

### Web APIs — El entorno del navegador

El navegador (no JavaScript) gestiona operaciones costosas fuera del hilo principal: temporizadores, fetch, eventos DOM. Cuando terminan, mandan el resultado a la cola.

### Callback Queue — La cola de espera

Las funciones pendientes esperan aquí. El Event Loop las mueve al Call Stack solo cuando este está completamente vacío.

El Event Loop en acción

```js
console.log("1 · Petición enviada");

fetch("/api/config")
  .then((r) => r.json())
  .then((config) => {
    console.log("3 · Config recibida:", config);
    // Esto se ejecuta DESPUÉS de que el stack esté vacío
  });

console.log("2 · Renderizando interfaz...");

// Output garantizado:
// 1 · Petición enviada
// 2 · Renderizando interfaz...
// 3 · Config recibida: { ... }
```

El código síncrono siempre termina antes de que llegue cualquier respuesta asíncrona, sin importar cuánto tarde.

### El bug del bucle y var

```js
// ❌ Bug clásico: ¿qué imprime este bucle?
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 100);
}
// Imprime: 3, 3, 3 — no 0, 1, 2
// var no tiene block scope: cuando los callbacks se ejecutan,
// el bucle ya terminó y i vale 3.

// ✅ Con let (block scope):
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log("let:", i), 100);
}
// Imprime: 0, 1, 2
```

### Microtasks vs Macrotasks

Las Promesas tienen su propia cola (microtask queue) con mayor prioridad que la cola de callbacks (macrotask queue). La microtask queue se vacía completamente antes de procesar la siguiente macrotask.

```js
console.log("1 · sync");

setTimeout(() => console.log("5 · macrotask"), 0);

Promise.resolve()
  .then(() => console.log("3 · microtask"))
  .then(() => console.log("4 · microtask"));

console.log("2 · sync");

// Output: 1, 2, 3, 4, 5
```

¿Por qué importa esto?
Si alguna vez ves que el estado de tu aplicación no se actualiza en el orden que esperas, lo más probable es que estés confundiendo macrotasks con microtasks.

## 3. Closures

Una closure es una función que recuerda el entorno léxico en el que fue creada, manteniendo acceso a las variables de ese scope aunque la función exterior haya terminado de ejecutarse.

Ejemplo 1 · Estado privado

```js
// El problema sin closure: el estado es global y mutable por cualquiera
let sessionCount = 0;

// Con closure: el estado es privado y solo modificable a través de la API
function createSessionTracker() {
  let count = 0; // Variable privada al closure

  return {
    start() {
      count++;
    },
    end() {
      count = Math.max(0, count - 1);
    },
    getCount() {
      return count;
    },
  };
}

const tracker = createSessionTracker();
tracker.start();
tracker.start();
tracker.end();

console.log(tracker.getCount()); // 1
console.log(tracker.count); // undefined — no es accesible desde fuera
```

### Ejemplo 2 · Factory de funciones

```js
// Crea validadores configurables sin repetir lógica
function createValidator(min, max, fieldName) {
  // min, max y fieldName quedan "atrapados" en el closure
  return function validate(value) {
    if (value < min || value > max) {
      return {
        valid: false,
        message: `${fieldName} debe estar entre ${min} y ${max}`,
      };
    }
    return { valid: true };
  };
}

const validateAge = createValidator(18, 99, "Edad");
const validateRating = createValidator(1, 5, "Valoración");
const validateQuantity = createValidator(1, 100, "Cantidad");

console.log(validateAge(25)); // { valid: true }
console.log(validateAge(15)); // { valid: false, message: 'Edad debe estar entre 18 y 99' }
console.log(validateRating(6)); // { valid: false, message: 'Valoración debe estar entre 1 y 5' }
```

## Ejemplo 3 · Closures en event handlers

```js
// Registrar acciones sobre elementos dinámicos
// El closure captura cada item de forma independiente en cada iteración
function setupNotificationHandlers(notifications) {
  notifications.forEach((notification) => {
    const element = createNotificationElement(notification);

    // Cada handler recuerda su propio `notification`
    element.querySelector(".btn-dismiss").addEventListener("click", () => {
      dismissNotification(notification.id);
      element.remove();
    });

    element.querySelector(".btn-action").addEventListener("click", () => {
      navigateTo(notification.actionUrl);
      markAsRead(notification.id);
    });

    document.getElementById("notification-panel").appendChild(element);
  });
}
```

### Reflexión

Si una función accede a una variable que está fuera de su scope inmediato, estás usando un closure, aunque no seas consciente de ello. Los callbacks de addEventListener, las arrow functions en .then() y los métodos de módulos son closures en el código de todos los días.

## 4. Gestión de errores

### try / catch / finally

```js
async function loadUserData(userId) {
  showLoader();

  try {
    const response = await fetch(`/api/users/${userId}`);

    // fetch no lanza error en respuestas 4xx/5xx, hay que comprobarlo
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    // error.name    → tipo ('TypeError', 'SyntaxError', etc.)
    // error.message → descripción legible
    console.error(`No se pudo cargar el usuario ${userId}:`, error.message);
    showErrorMessage("No se pudo cargar el perfil. Inténtalo de nuevo.");
    return null;
  } finally {
    // Se ejecuta siempre: éxito o error
    hideLoader();
  }
}
```

### Errores personalizados

Crear clases de error propias permite reaccionar de forma diferente según el tipo de problema:

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

// El catch distingue qué tipo de error es y actúa en consecuencia
try {
  await submitPayment(paymentData);
} catch (error) {
  if (error instanceof ValidationError) {
    highlightField(error.field, error.message);
  } else if (error instanceof ApiError && error.statusCode === 402) {
    showModal("Fondos insuficientes");
  } else {
    reportToMonitoring(error);
    showToast("Error inesperado. Contacta con soporte.");
  }
}
```

## 5. Promesas y Async/Await

### Promesas: los tres estados

Una Promise representa un valor que estará disponible en el futuro.

Estado Descripción Handler
pending operación en curso —
fulfilled completada con éxito .then()
rejected ha fallado .catch()

```js
function fetchOrderStatus(orderId) {
  return new Promise((resolve, reject) => {
    fetch(`/api/orders/${orderId}/status`)
      .then((response) => {
        if (!response.ok) {
          reject(new ApiError(response.status, "Pedido no encontrado"));
          return;
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

fetchOrderStatus(1042)
  .then((status) => updateOrderUI(status))
  .catch((error) => showError(error.message))
  .finally(() => hideLoader());
```

### Async / Await

async/await es sintaxis que simplifica el trabajo con promesas. Una función async siempre devuelve una promesa.

await pausa la ejecución de esa función hasta que la promesa se resuelve.

```js
// Con .then() encadenado — funciona pero escala mal
function loadOrderDetails(orderId) {
  return fetch(`/api/orders/${orderId}`)
    .then((r) => r.json())
    .then((order) => fetch(`/api/products/${order.productId}`))
    .then((r) => r.json())
    .then((product) => ({ ...order, product }));
}

// Con async/await — mismo resultado, legibilidad muy superior
async function loadOrderDetails(orderId) {
  try {
    const orderRes = await fetch(`/api/orders/${orderId}`);
    const order = await orderRes.json();

    const productRes = await fetch(`/api/products/${order.productId}`);
    const product = await productRes.json();

    return { ...order, product };
  } catch (error) {
    console.error("Error cargando pedido:", error.message);
    throw error; // re-lanzar para que el llamador pueda manejarlo
  }
}
```

### Operaciones en paralelo

```js
// ❌ En serie: espera a cada petición antes de lanzar la siguiente
const profile = await fetchProfile(userId);
const orders = await fetchOrders(userId);
const notifications = await fetchNotifications(userId);
// Tiempo total: t(profile) + t(orders) + t(notifications)

// ✅ En paralelo: las tres se lanzan a la vez
const [profile, orders, notifications] = await Promise.all([
  fetchProfile(userId),
  fetchOrders(userId),
  fetchNotifications(userId),
]);
// Tiempo total: max(t(profile), t(orders), t(notifications))
```

Cuándo usar cada método de Promise

```js
// Promise.all → necesitas TODOS los resultados, fallas si uno falla
const [user, config] = await Promise.all([getUser(id), getConfig()]);

// Promise.allSettled → necesitas TODOS pero no quieres que uno cancele el resto
const results = await Promise.allSettled([
  loadPlugin("analytics"),
  loadPlugin("chat"),
  loadPlugin("maps"),
]);
results.forEach((r) => {
  if (r.status === "fulfilled") r.value.init();
  else console.warn("Plugin no disponible:", r.reason.message);
});

// Promise.race → timeout pattern
const data = await Promise.race([
  fetchData(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000),
  ),
]);
```

## 6. This

this es una referencia al objeto en cuyo contexto se ejecuta una función. Su valor no depende de dónde se escribe la función, sino de cómo y dónde se llama.

### Las cuatro reglas

```js
// 1. Método de objeto → this es el objeto propietario
const apiClient = {
  baseUrl: "https://api.empresa.com",
  get(endpoint) {
    // this.baseUrl funciona porque get() es llamada como método de apiClient
    return fetch(`${this.baseUrl}${endpoint}`);
  },
};
apiClient.get("/users"); // ✅

// 2. Función regular (modo estricto) → this es undefined
function standalone() {
  "use strict";
  console.log(this); // undefined
}

// 3. Arrow function → hereda this del scope exterior
class PollingService {
  constructor(url) {
    this.url = url;
    this.interval = null;
  }

  start() {
    // Arrow function: this es la instancia de PollingService
    this.interval = setInterval(() => {
      fetch(this.url)
        .then((r) => r.json())
        .then((data) => this.onData(data));
    }, 3000);
  }

  stop() {
    clearInterval(this.interval);
  }
}

// 4. Constructor / clase → this es la nueva instancia
class Store {
  constructor(name) {
    this.name = name;
    this.items = [];
  }
}
```

El bug más frecuente

```js
class EventLogger {
  constructor() {
    this.logs = [];
  }

  // ❌ Problema: this en la función pasada al listener no es la instancia
  attachWithRegularFunction(button) {
    button.addEventListener("click", function (event) {
      this.logs.push(event.type); // TypeError: this es el botón, no EventLogger
    });
  }

  // ✅ Solución 1: arrow function
  attachWithArrow(button) {
    button.addEventListener("click", (event) => {
      this.logs.push(event.type); // ✅ this es la instancia de EventLogger
    });
  }

  // ✅ Solución 2: bind
  attachWithBind(button) {
    button.addEventListener(
      "click",
      function (event) {
        this.logs.push(event.type);
      }.bind(this),
    );
  }
}
```

call, apply, bind

```js
const formatter = {
  locale: "es-ES",
  format(amount, currency) {
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency,
    }).format(amount);
  },
};

// call → ejecuta inmediatamente, argumentos separados por comas
formatter.format.call({ locale: "en-US" }, 1000, "USD"); // "$1,000.00"

// apply → ejecuta inmediatamente, argumentos en array
formatter.format.apply({ locale: "de-DE" }, [1000, "EUR"]); // "1.000,00 €"

// bind → devuelve nueva función con this fijo, no ejecuta
const formatUK = formatter.format.bind({ locale: "en-GB" });
formatUK(500, "GBP"); // "£500.00" — siempre con locale en-GB
```

## 7. Módulos

Modularizar significa dividir el código en unidades con scope propio, exportando solo lo que otros necesitan. Evita colisiones de nombres, facilita el testing y hace el código mantenible a escala.

ESM (ES Modules) — el estándar

```js
// utils/http.js — exportaciones nombradas
export async function get(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function post(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Export default: un valor principal por fichero
export default { get, post };
js;
// services/users.js — importa y usa el módulo http
import { get, post } from "../utils/http.js";

export async function getUser(id) {
  return get(`/api/users/${id}`);
}
export async function createUser(userData) {
  return post("/api/users", userData);
}
js;
// app.js — importa desde el servicio
import { getUser, createUser } from "./services/users.js";

const user = await getUser(1);
```

CommonJS — Node.js y código legacy

```js
// utils/format.js
function formatDate(date) {
return new Intl.DateTimeFormat('es-ES').format(new Date(date));
}

module.exports = { formatDate };

// app.js
const { formatDate } = require('./utils/format');

IIFE — encapsulación sin sistema de módulos
js
// Patrón anterior a ESM. Aún presente en scripts sin bundler.
const AuthService = (function() {
let token = null; // privado

return {
login(credentials) { /_ ... _/ },
logout() { token = null; },
isAuthenticated() { return token !== null; },
};
})();
```

AMD y UMD: sistemas de módulos previos a ESM, diseñados para el navegador (AMD) o para funcionar en cualquier entorno (UMD). Los encontrarás en librerías antiguas. No es necesario usarlos, pero conviene reconocerlos.

## Buenas prácticas

-Usa async/await sobre .then() para código nuevo: es más legible y más fácil de depurar.

-Gestiona siempre los errores.

-Sin try/catch los errores asíncronos desaparecen silenciosamente.

-Lanza operaciones independientes en paralelo con Promise.all. Nunca hagas await en serie si no hay dependencia entre las peticiones.

-Usa arrow functions en callbacks para evitar perder el contexto de this.

-Exporta con nombres descriptivos. Un módulo con export default de una función anónima es imposible de buscar en un proyecto grande.

-Limpia los efectos secundarios: clearInterval, removeEventListener, cerrar conexiones. Las closures que guardan referencias impiden que el garbage collector libere memoria.

## Errores comunes

```js
// ❌ Olvidar await: user es una Promise, no el objeto
const user = fetchUser(id);
console.log(user.name); // undefined

// ❌ try/catch sin await no captura el error asíncrono
try {
  loadData(); // la promise se lanza y el try/catch ya terminó
} catch (e) {
  /_ nunca llega aquí _/;
}

// ❌ async dentro de forEach: no espera a que acaben
items.forEach(async (item) => {
  await processItem(item); // el forEach no await esto
});
// ✅ Correcto:
await Promise.all(items.map((item) => processItem(item)));

// ❌ This perdido al pasar un método como referencia
class App {
  handleClick() {
    console.log(this);
  }
  init() {
    document.querySelector("#btn").addEventListener("click", this.handleClick);
    // ↑ this dentro de handleClick será el botón, no la instancia de App
  }
}
// ✅ Correcto:
document
  .querySelector("#btn")
  .addEventListener("click", () => this.handleClick());
```
