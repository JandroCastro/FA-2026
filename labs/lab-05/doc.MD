# Lab 05 — Eventos y Lit

## Comunicación entre componentes y desarrollo declarativo con LitElement

---

## Antes de empezar: el problema que resuelven

Tienes dos componentes en una página. Uno es un panel de filtros; el otro es
una lista de resultados. No tienen relación padre-hijo. Cuando el usuario
cambia un filtro, la lista tiene que actualizarse.

¿Cómo se comunican?

En el Lab 04 aprendiste a construir componentes con Shadow DOM. Pero Shadow DOM
introduce una frontera: los eventos no la cruzan por defecto, los selectores CSS
no la atraviesan, y `document.querySelector` no ve el interior. En cuanto
empiezas a componer componentes reales, estas fronteras se convierten en
obstáculos concretos.

Este lab resuelve esos obstáculos en dos partes:

**Parte 1 — Comunicación:** cómo fluyen los eventos por el DOM (bubbling),
por qué se detienen en el Shadow DOM y cómo cruzar esa frontera con
`composed: true`. Y cuándo los eventos no son suficientes y necesitas un
patrón como el EventBus.

**Parte 2 — Lit:** una librería de seis años de historia (usada en producción
por Google, Adobe, Salesforce y otros) que reduce el boilerplate de los Web
Components nativos a un tercio sin cambiar lo que hace el navegador.

---

## 1 · Bubbling y delegación en el Light DOM

### El concepto

Cuando haces click en un elemento, el navegador no solo notifica a ese
elemento. El evento sube por el árbol DOM de dentro hacia fuera, disparando
todos los listeners que encuentre en el camino. Esto se llama **bubbling**.

```js
inner.addEventListener("click", (e) => {
  e.target; // el elemento que originó el click
  e.currentTarget; // el elemento que está procesando el evento ahora
});
```

`target` siempre apunta al origen. `currentTarget` apunta a quién está
procesando el evento en ese instante. Cuando ambos son iguales, estás en el
origen del click.

`stopPropagation()` detiene el recorrido en el listener que lo llama. Los
elementos más exteriores nunca recibirán el evento.

La **delegación** aprovecha el bubbling: en lugar de poner un listener en cada
hijo, pones uno en el padre. Todos los clicks de los hijos subirán hasta él.
Los elementos creados dinámicamente también funcionan, porque el listener
existía antes de que se crearan.

```js
// Sin delegación: un listener por cada li (frágil, caro)
document.querySelectorAll("li").forEach((li) => {
  li.addEventListener("click", handler);
});

// Con delegación: un listener en el ul (robusto, eficiente)
document.querySelector("ul").addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (!item) return;
  // item es el li clicado, independientemente de si existe ahora o en el futuro
});
```

### Pruébalo — ejemplo 01

Con el **ejemplo 01** abierto, ejecuta esto en la consola paso a paso:

```js
// 1. Dispara un click programático en el recuadro más profundo
// y observa el recorrido en el output
document.getElementById("inner").click();

// 2. El objeto de evento persiste en window.lastClickEvent
window.lastClickEvent.target.id; // 'inner' — origen
window.lastClickEvent.currentTarget; // null — el dispatch ya terminó

// 3. target y currentTarget son el mismo en el origen
// Para ver la diferencia, el log del output los muestra durante el dispatch:
// ⬆ inner  │ target: #inner  │ currentTarget: #inner  ← origen
// ⬆ middle │ target: #inner  │ currentTarget: #middle
// ⬆ outer  │ target: #inner  │ currentTarget: #outer

// 4. Activar stopPropagation desde la consola
window.stopPropagationEnabled = true;
document.getElementById("stop-toggle").checked = true;
document.getElementById("stop-toggle").dispatchEvent(new Event("change"));
// Ahora haz click en #inner2 y observa que #outer nunca recibe el evento

// 5. La delegación funciona en ítems que aún no existían
window.taskList.children.length; // 3 — ítems iniciales
addTask(); // añade un cuarto
window.taskList.children.length; // 4
// Haz click en el nuevo ítem — funciona aunque no tenía listener

// 6. Verificar que el ul tiene exactamente un listener (no se puede desde JS)
// Pero sí podemos confirmar que los li no tienen ninguno:
window.lastDelegatedEvent.currentTarget.tagName; // 'UL' — siempre el ul
window.lastDelegatedEvent.target.tagName; // 'LI' o 'SPAN' (el hijo)
```

### Por qué importa más allá de este lab

La delegación de eventos es la base del rendimiento en listas largas en
cualquier framework:

- **React** usa un único listener en el `root` del documento para todos los
  eventos sintéticos. Tu `onClick={handler}` no añade un listener real al
  elemento; React lo gestiona mediante delegación.
- **Vue** hace lo mismo en el nivel del componente raíz.
- **Angular** delega eventos a través del `EventManager`.

Entender `target` vs `currentTarget` es esencial para depurar handlers que
reciben eventos inesperados en apps con componentes anidados.

---

## 2 · Eventos en el Shadow DOM

### El concepto

El Shadow DOM crea una frontera para los estilos (Lab 04) pero también para
los eventos. Un `CustomEvent` disparado dentro del Shadow DOM no cruza esa
frontera por defecto:

```js
// Dentro del shadow DOM — NO cruza la frontera
btn.dispatchEvent(new CustomEvent("mi-evento", { bubbles: true }));

// Dentro del shadow DOM — SÍ cruza la frontera
btn.dispatchEvent(
  new CustomEvent("mi-evento", {
    bubbles: true,
    composed: true, // ← esta es la clave
  }),
);
```

Cuando un evento con `composed: true` cruza la frontera, el navegador
aplica **retargeting**: los listeners que están fuera del Shadow DOM ven
`event.target` como el elemento host (el custom element), no como el elemento
interno que originó el evento. Esto protege la encapsulación.

`event.composedPath()` rompe esa protección intencionadamente: devuelve el
array completo de nodos que el evento atravesó, incluyendo los del Shadow DOM.
Solo es válido **dentro del event handler** — después del dispatch, se vacía.

### Pruébalo — ejemplo 02

```js
// SECCIÓN 1 — el evento que no cruza

// Haz click en el botón de sig-1 (composed: false)
// El output muestra que el shadow root lo recibió, el document no.
// Verificar:
window.sig1.shadowRoot.addEventListener("basic-event", (e) => {
  console.log("shadow root lo vio:", e.target);
});
// (ya hay uno registrado — solo para confirmar el concepto)

// Haz click en el botón de sig-2 (composed: true)
window.lastDocEvent.composed; // true
window.lastDocEvent.target; // sig-2 (el host, no el botón)
window.lastDocEvent.target === window.sig2; // true — retargeting

// SECCIÓN 2 — retargeting con tres listeners

// Haz click en sig-3 y observa las tres líneas del output:
// ① shadow root: e.target → button.btn  (el botón real)
// ② host sig-3:  e.target → shadow-signal#sig-3  (retargeting)
// ③ document:    e.target → shadow-signal#sig-3  (retargeting)

// El botón real sigue siendo accesible:
window.sig3.shadowRoot.querySelector(".btn"); // el botón

// SECCIÓN 3 — composedPath

// Haz click en sig-4 y observa el path en el output.
// El array se vacía después del dispatch:
window.lastDocEvent.composedPath(); // [] ← vacío fuera del handler

// Pero guardamos una copia dentro del handler:
window.lastComposedPath; // [button.btn, div.wrapper, ShadowRoot, ...]
window.lastComposedPath[0]; // el botón que se clickó
window.lastComposedPath[0] === window.sig4.shadowRoot.querySelector(".btn"); // true

// Encontrar dónde está la frontera shadow en el path:
window.lastComposedPath.findIndex((n) => n instanceof ShadowRoot);
// el índice donde el árbol shadow termina y el light DOM comienza
```

### Por qué importa más allá de este lab

El `composed: true` es **obligatorio** en el proyecto del timer. El enunciado
dice: "se debe emitir un evento que sobrepase el Shadow DOM y pueda ser
escuchado desde un listener global." Sin `composed: true`, esos eventos
(`timer-play`, `timer-pause`, `timer-reset`, `timer-finish`) nunca llegarán
al documento.

En producción con Lit, la convención es:

```js
// Dentro de un componente Lit: emitir eventos que crucen la frontera
this.dispatchEvent(new CustomEvent('mi-evento', {
bubbles: true,
composed: true,
detail: { ... }
}));
```

**React, Vue y Angular** no necesitan esto porque no usan Shadow DOM (usan
emulación de scoping o CSS Modules). Pero si alguna vez integras un Web
Component nativo en un proyecto React, `composed: true` es lo que hace que
los eventos del componente sean escuchables desde React.

---

## 3 · Patrones de comunicación entre componentes

### El concepto

`composed: true` resuelve "notificar hacia arriba". Pero no resuelve
"componente A necesita que componente B reaccione" cuando no son
padre-hijo.

El patrón **EventBus** es un objeto intermediario. Nadie habla con nadie
directamente: todos hablan con el bus.

```js
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

// Componente A — emite, no sabe quién escucha
bus.emit("filtro-cambiado", { categoria: "frontend" });

// Componente B — escucha, no sabe quién emite
bus.on("filtro-cambiado", (e) => {
  actualizarLista(e.detail.categoria);
});
```

La clave de implementación: el handler debe almacenarse en una variable
para poder desuscribirse exactamente. Una función anónima en `on()` no
puede quitarse después.

```js
class MiComponente extends HTMLElement {
  connectedCallback() {
    this._handler = (e) => this._onBusEvent(e); // referencia guardada
    bus.on("evento", this._handler);
  }

  disconnectedCallback() {
    bus.off("evento", this._handler); // misma referencia → se elimina exactamente
    this._handler = null;
  }
}
```

### Pruébalo — ejemplo 03

```js
// 1. El bus es un EventTarget — funciona como cualquier nodo del DOM
window.bus instanceof EventTarget; // true

// 2. Suscribirse y emitir desde la consola
window.bus.on("test", (e) => console.log("recibido:", e.detail));
window.bus.emit("test", { msg: "hola desde la consola" });
// → recibido: { msg: 'hola desde la consola' }

// 3. El bus-receiver de la sección 2 también escucha 'bus-message'
// Desde consola podemos enviarte un mensaje directo:
window.bus.emit("bus-message", {
  text: "Mensaje desde la consola",
  source: "DevTools",
});
// Observa que el receiver muestra el mensaje y el log de sección 2 también

// 4. Desconectar el receiver (sección 3) y probar que ya no recibe
removeReceiver();
window.bus.emit("bus-message", {
  text: "Nadie me escucha",
  source: "DevTools",
});
// El log de sección 2 muestra el mensaje. El receiver, desconectado, no.

// 5. Reconectar y comprobar que la suscripción se restaura
restoreReceiver();
window.bus.emit("bus-message", {
  text: "Ahora sí me escucha",
  source: "DevTools",
});
// El receiver vuelve a mostrar mensajes

// 6. Sin cleanup, cada reconexión añadiría un listener acumulativo
// Con el código actual (off en disconnectedCallback), solo hay uno activo.
```

### Por qué importa más allá de este lab

El EventBus es el **patrón de comunicación global** del ecosistema frontend:

- **Redux / Zustand (React):** el store es un EventBus sofisticado. Cuando
  haces `dispatch(action)`, estás haciendo `bus.emit`. Cuando usas
  `useSelector`, estás haciendo `bus.on`.
- **Vuex / Pinia (Vue):** mismo patrón. Las acciones y mutaciones son eventos
  con nombre.
- **NgRx (Angular):** igual.
- **mitt, EventEmitter3:** librerías de EventBus puros, populares en proyectos
  que no quieren un store completo.

La diferencia entre un EventBus bien implementado y uno con memory leaks es
exactamente lo que hemos visto: `off()` en `disconnectedCallback`.

---

## 4 · Introducción a Lit

### El concepto

Lit es una capa fina sobre los Web Components nativos. No cambia qué hace
el navegador; reduce cuánto código escribes para decírselo.

```js
// Vanilla — crear un componente contador: ~38 líneas
class VanillaCounter extends HTMLElement {
  constructor() {
    super();
    this._count = 0;
  }
  connectedCallback() {
    if (this._init) return;
    this._init = true;
    const shadow = this.attachShadow({ mode: "open" });
    // ... crear style, wrapper, span, button manualmente
    // ... addEventListener con actualización manual del DOM
    // this._numEl.textContent = this._count; // ← obligatorio en cada click
  }
}

// Lit — el mismo componente: ~22 líneas
class LitCounter extends LitElement {
  static properties = { count: { type: Number } };
  static styles = css`
    /* ... */
  `;

  constructor() {
    super();
    this.count = 0;
  }

  render() {
    return html`
      <span>${this.count}</span>
      <button @click=${() => this.count++}>+1</button>
    `;
  }
}
```

La diferencia central: con Lit, `this.count++` re-renderiza el componente
automáticamente. Con vanilla, hay que actualizar el DOM a mano en cada cambio.

El template `html\`\`` acepta cuatro tipos de binding:

| Sintaxis            | Qué hace                               |
| ------------------- | -------------------------------------- |
| `${expresión}`      | Interpola un valor en el template      |
| `@click=${fn}`      | Añade un event listener                |
| `.value=${val}`     | Asigna una propiedad DOM (no atributo) |
| `?disabled=${bool}` | Añade o elimina un atributo booleano   |

### Pruébalo — ejemplo 04

```js
// SECCIÓN 1 — la diferencia clave entre vanilla y Lit

// Vanilla: cambiar la propiedad interna NO actualiza el DOM
window.vanillaCounter._count = 99;
// El número en pantalla NO cambió (sigue mostrando el último click)
// Habría que también hacer: window.vanillaCounter._numEl.textContent = 99

// Lit: cambiar la propiedad SÍ actualiza el DOM
window.litCounter.count = 99;
// El número en pantalla cambió instantáneamente

// Ambos son instancias de HTMLElement
window.litCounter instanceof HTMLElement; // true
window.litCounter instanceof LitElement; // true (no disponible en consola
// directamente, pero es cierto)

// SECCIÓN 2 — propiedades reactivas en LitProfile

window.litProfile.name = "Nuevo nombre"; // re-render inmediato
window.litProfile.score += 100; // re-render inmediato
window.litProfile.status = "inactive"; // re-render + atributo (reflect: true)

// reflect: true escribe de vuelta al atributo HTML
window.litProfile.getAttribute("status"); // 'inactive'

// SECCIÓN 3 — los cuatro tipos de binding en LitTemplateDemo

window.templateDemo.inputName = "Nombre desde consola";
// El input muestra 'Nombre desde consola' (.value binding)

window.templateDemo.enabled = false;
// El botón "Saludar" aparece deshabilitado (?disabled binding)

window.templateDemo.greeting = "¡Hola desde DevTools!";
// El resultado actualiza instantáneamente (${expresión} binding)

window.templateDemo.enabled = true;
// Botón habilitado de nuevo
```

### Por qué importa más allá de este lab

Lit es la base directa de la actividad de fin de semana (el timer). Pero
el patrón que introduce —propiedades reactivas que disparan re-renders
declarativos— es el patrón de **todos los frameworks modernos**:

- **React:** `useState(0)` y `setCount(count + 1)` = `static properties` y
  `this.count++`. La función de render es `render()` con JSX.
- **Vue:** `ref(0)` y `count.value++` = lo mismo. `<template>` es el `html\`\``.
- **Angular:** `signal(0)` y `count.set(count() + 1)` = lo mismo.

La diferencia es la ergonomía y el ecosistema, no el modelo mental. Cuando
entiendas Lit, cualquier framework te resultará familiar porque el mecanismo
es el mismo: declaras qué datos tiene el componente, declaras cómo debe verse,
y el framework actualiza el DOM cuando los datos cambian.

---

## 5 · Lit: reflect, tipos y ciclo de vida

### El concepto

**reflect** es el puente bidireccional entre propiedad JS y atributo HTML.
Sin `reflect`, cambiar una propiedad desde JS solo actualiza el estado interno
del componente. Con `reflect: true`, también actualiza el atributo en el DOM,
lo que permite usar selectores CSS como `:host([active])`:

```js
static properties = {
title:   { type: String },                 // JS → DOM solo en render
active:  { type: Boolean, reflect: true }, // JS ↔ atributo HTML siempre
variant: { type: String,  reflect: true }  // JS ↔ atributo HTML siempre
};

// En el CSS del componente:
// :host([active]) .card { border-color: green; }      ← funciona con reflect
// :host([variant="danger"]) .card { border-color: red; } ← funciona con reflect
```

**Tipos** — Lit convierte automáticamente el valor del atributo HTML (siempre
un string) al tipo declarado en `static properties`. El caso especial es
`Boolean`:

```js
// type: Boolean usa PRESENCIA del atributo, no su valor
elemento.setAttribute("active", ""); // active = true
elemento.setAttribute("active", "false"); // active = true  ← trampa frecuente
elemento.removeAttribute("active"); // active = false

// Para poner false desde JS:
elemento.active = false; // correcto
elemento.removeAttribute("active"); // correcto
// NO: elemento.setAttribute('active', 'false') ← sigue siendo true
```

**Ciclo de vida** — Lit añade dos hooks sobre el ciclo de vida nativo:

```js
class MiComponente extends LitElement {
  // Dispara UNA SOLA VEZ tras el primer render.
  // Aquí es seguro acceder a this.renderRoot (= el shadow root).
  firstUpdated(changedProperties) {
    this._inputEl = this.renderRoot.querySelector("input");
    this._inputEl.focus();
  }

  // Dispara tras CADA re-render (incluyendo el primero, después de firstUpdated).
  // changedProperties: Map<nombre, valorAnterior>
  updated(changedProperties) {
    if (changedProperties.has("active")) {
      const oldVal = changedProperties.get("active");
      console.log("active cambió de", oldVal, "a", this.active);
    }
  }
}
```

### Pruébalo — ejemplo 05

```js
// SECCIÓN 1 — reflect en acción

// Cambiar una propiedad CON reflect → el atributo se actualiza
window.reflectCard.active = true;
window.reflectCard.getAttribute("active"); // '' (presencia = true)

window.reflectCard.variant = "danger";
window.reflectCard.getAttribute("variant"); // 'danger'
// El CSS :host([variant="danger"]) aplica sin ningún código extra

// Cambiar una propiedad SIN reflect → el atributo no cambia
window.reflectCard.title = "Nuevo título";
window.reflectCard.getAttribute("title"); // null ← no se refleja

// SECCIÓN 2 — tipos y la trampa de Boolean

// Number: el atributo string se convierte a número
window.typeDemo.setAttribute("amount", "42.5");
window.typeDemo.amount; // 42.5 (number)
typeof window.typeDemo.amount; // 'number'

// Boolean trampa: setAttribute con 'false' da true
window.typeDemo.setAttribute("enabled", "false");
window.typeDemo.enabled; // true ← presencia del atributo

// Boolean correcto: removeAttribute da false
window.typeDemo.removeAttribute("enabled");
window.typeDemo.enabled; // false

// SECCIÓN 3 — ciclo de vida

// Cambiar el valor dispara updated()
// El log en out-s3 muestra:
// [timestamp] updated()
//   value: "inicial" → "alpha"   ← changedProperties: valor anterior

window.lifecycleEl.value = "nueva-prueba";
// Observa el log: updated() con el valor anterior y el nuevo

// firstUpdated() disparó al cargarse la página (lo primero en el log)
// Solo aparece una vez, aunque cambies value muchas veces

// changedProperties.get('value') da el valor ANTERIOR (no el actual)
// El valor actual está en this.value
```

### Por qué importa más allá de este lab

**reflect y tipos** aparecen en todo Web Component configurable vía HTML:

```html
<!-- El timer del proyecto usa atributos configurables desde HTML -->
<mi-timer show-days pad-zero show-controls></mi-timer>
```

Sin `type: Boolean`, `show-days` llegaría como string `""` o `undefined`.
Sin `reflect: true` en `status`, el CSS `:host([status="running"])` nunca
aplicaría.

**El ciclo de vida** es el mismo concepto que en todos los frameworks:

| Lit              | React                         | Vue           | Angular             |
| ---------------- | ----------------------------- | ------------- | ------------------- |
| `firstUpdated()` | `useEffect(() => {}, [])`     | `onMounted()` | `ngAfterViewInit()` |
| `updated()`      | `useEffect(() => {}, [deps])` | `watch()`     | `ngOnChanges()`     |

La diferencia clave de `firstUpdated` vs `connectedCallback` (vanilla):
`firstUpdated` garantiza que el shadow DOM está renderizado. `connectedCallback`
solo garantiza que el elemento está en el árbol del documento — el render puede
no haber ocurrido aún.

---

## El panorama completo

Estos son los conceptos del lab y cómo aparecen en el ecosistema:

| Concepto              | Vanilla JS                                  | React                              | Vue                          | Angular                       |
| --------------------- | ------------------------------------------- | ---------------------------------- | ---------------------------- | ----------------------------- |
| Bubbling              | `addEventListener` + `target/currentTarget` | `onClick` con bubbling nativo      | `@click` con bubbling nativo | `(click)` con bubbling nativo |
| Delegación            | `closest()` en el padre                     | Virtual DOM (React delega en root) | Similar                      | Similar                       |
| `composed: true`      | `CustomEvent` con `composed: true`          | No necesario (no usa Shadow DOM)   | No necesario                 | `ViewEncapsulation.ShadowDom` |
| EventBus              | `new EventTarget()`                         | Redux/Zustand dispatch             | Pinia actions                | NgRx Actions                  |
| Propiedades reactivas | `static properties` (Lit)                   | `useState` / `useReducer`          | `ref` / `reactive`           | `signal` / `@Input`           |
| Template declarativo  | `html\`\`` (Lit)                            | JSX                                | `<template>` SFC             | `@Component template`         |
| `reflect`             | `reflect: true` (Lit)                       | Controlado vía props               | `defineProps`                | `@Input` con `@HostBinding`   |
| `firstUpdated`        | `firstUpdated()` (Lit)                      | `useEffect(() => {}, [])`          | `onMounted()`                | `ngAfterViewInit()`           |
| `updated`             | `updated(changedProps)` (Lit)               | `useEffect(() => {}, [dep])`       | `watch()`                    | `ngOnChanges()`               |

Los frameworks no inventan estos mecanismos: los envuelven con mejor
ergonomía. Entender la capa nativa hace que cualquier framework sea más
intuitivo y que puedas depurar los problemas que los frameworks abstraen
pero no eliminan.
