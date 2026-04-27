# Lab 04 — Web Components

## Fundamentos, demostraciones y por qué todo esto importa

---

## Antes de empezar: el problema que resuelven

Imagina que llevas seis meses en un proyecto. La interfaz tiene botones,
tarjetas, modales y desplegables. Cada vez que el diseñador cambia algo,
tienes que buscar ese componente en quince archivos distintos y actualizarlo
quince veces.

Los web components existen para resolver ese problema: **define el componente
una vez, úsalo en cualquier sitio**.

Pero hay algo más importante que la reutilización. Los tres pilares que vas
a aprender en este lab —Custom Elements, Shadow DOM y HTML Templates— son
la **base técnica sobre la que React, Vue y Angular construyen su sistema de
componentes**. No son alternativas a esos frameworks: son la capa que los
frameworks envuelven. Entender la base hace que cualquier framework sea más
intuitivo y que seas capaz de diagnosticar problemas que los frameworks
abstraen pero no eliminan.

---

## 1 · Custom Elements — "el navegador puede aprender tags nuevas"

### El concepto

El navegador tiene un registro interno que asocia cada tag HTML con una clase
JavaScript. `<button>` tiene la suya, `<video>` tiene la suya. Con
`customElements.define()` escribes una fila nueva en ese registro.

```js
class MiComponente extends HTMLElement {
  connectedCallback() {
    this.textContent = "Hola desde mi propio elemento HTML";
  }
}
customElements.define("mi-componente", MiComponente);
```

A partir de ese momento, `<mi-componente>` funciona en cualquier HTML de la
página igual que `<div>` o `<span>`.

### Pruébalo — registro y exploración

Con el **ejemplo 01** abierto, ejecuta esto en la consola paso a paso.
Observa el resultado de cada línea antes de pasar a la siguiente:

```js
// 1. La clase registrada está en el registry global
customElements.get("hello-world");
// → HelloWorld (la clase constructora)

// 2. El elemento del DOM es una instancia de esa clase
window.helloEl instanceof HelloWorld; // true
window.helloEl instanceof HTMLElement; // true
// Herencia en acción: es las dos cosas a la vez

// 3. this dentro de la clase ES el nodo del DOM
window.helloEl === document.querySelector("hello-world"); // true
// No es una referencia abstracta: es el elemento que ves en DevTools

// 4. Operación inversa: de clase a nombre de tag
customElements.getName(HelloWorld); // "hello-world"

// 5. El upgrade ocurre en el momento de definir
// mystery-element ya estaba en el DOM cuando la página cargó.
// Pulsa "⚡ Definir mystery-element" y observa cómo el elemento
// existente se transforma sin recargar la página.
// Luego comprueba:
customElements.get("mystery-element"); // MysteryElement
window.mysteryEl.constructor.name; // "MysteryElement" (antes era "HTMLElement")

// 6. Registrar un nuevo componente desde consola
class SaludoPersonal extends HTMLElement {
  connectedCallback() {
    const nombre = this.getAttribute("nombre") || "mundo";
    this.innerHTML =
      '<strong style="color:#a5b4fc">Hola, ' + nombre + "</strong>";
  }
}
customElements.define("saludo-personal", SaludoPersonal);
document.body.insertAdjacentHTML(
  "beforeend",
  '<saludo-personal nombre="Frontend"></saludo-personal>',
);
// El componente aparece en la página con su propio comportamiento
```

### Por qué importa más allá de este lab

Cuando en React escribes `<MiBoton onClick={...}>`, React está creando un
elemento DOM bajo el capó. Cuando en Vue defines un componente con
`defineComponent()`, estás haciendo lo mismo que `customElements.define()`
pero con la capa de reactividad de Vue encima. **El concepto es idéntico:
asociar un nombre con un comportamiento.**

Entender `customElements.define()` hace que la primera vez que veas
`React.createElement()` o el compilador de Vue no te resulte magia: es el
mismo patrón, con más funcionalidades encima.

---

## 2 · Ciclo de vida — "un componente no está en el DOM todo el tiempo"

### El concepto

Un custom element pasa por momentos distintos. Cada momento tiene su
callback. El error más caro es ignorar esta distinción.

| Momento                      | Callback                     | Qué hacer aquí                          |
| ---------------------------- | ---------------------------- | --------------------------------------- |
| El objeto JS existe, sin DOM | `constructor()`              | Inicializar propiedades JS              |
| Se inserta en el documento   | `connectedCallback()`        | Crear UI, iniciar timers, suscribirse   |
| Se elimina del documento     | `disconnectedCallback()`     | Limpiar timers, cancelar, desuscribirse |
| Cambia un atributo observado | `attributeChangedCallback()` | Actualizar la UI                        |

### Pruébalo — el ciclo completo en vivo

Con el **ejemplo 02** abierto, sigue esta secuencia exacta y lee el log
después de cada paso:

```js
// PASO 1: crear en memoria
// El constructor dispara. El elemento NO está en el DOM todavía.
crearElemento();
window.loggerEl.isConnected; // false
window.loggerEl._intervalId; // null (el timer no ha empezado)

// PASO 2: atributo ANTES de insertar en el DOM
// attributeChangedCallback puede disparar antes de connectedCallback.
// Este es el gotcha más frecuente en web components reales.
window.loggerEl.setAttribute("color", "pink");
// Observa en el log: inDOM: false
// El callback disparó aunque el elemento no estaba en el DOM.

// PASO 3: insertar en el DOM
anadirDOM();
window.loggerEl.isConnected; // true
window.loggerEl._intervalId; // número (el timer está corriendo)

// PASO 4: el coste de NO limpiar
// Quita el elemento del DOM. Si disconnectedCallback no limpiara el timer,
// este seguiría corriendo en memoria aunque no haya nada visible.
quitarDOM();
window.loggerEl._intervalId; // null → limpiado correctamente
window.loggerEl.isConnected; // false

// PASO 5: reconectar → connectedCallback dispara de nuevo
anadirDOM();
window.loggerEl.connectedCount; // 2 (segunda vez que se conecta)
// El timer se reinició desde 0

// PASO 6: atributo NO observado → callback no dispara
window.loggerEl.setAttribute("data-cualquier-cosa", "xyz");
// El atributo existe en el DOM...
window.loggerEl.getAttribute("data-cualquier-cosa"); // 'xyz'
// ...pero NO aparece nada nuevo en el log de attributeChangedCallback
// porque 'data-cualquier-cosa' no está en observedAttributes
```

### Por qué importa más allá de este lab

`useEffect` de React con su función de cleanup es exactamente
`connectedCallback` + `disconnectedCallback` en una sola función:

```jsx
useEffect(() => {
  // connectedCallback: inicia el timer
  const id = setInterval(tick, 1000);

  return () => {
    // disconnectedCallback: limpia el timer
    clearInterval(id);
  };
}, []);
```

`onMounted` / `onUnmounted` de Vue y `ngOnInit` / `ngOnDestroy` de Angular
son exactamente el mismo patrón.

El patrón "iniciar al montar, limpiar al desmontar" es universal en el
desarrollo frontend moderno porque los componentes se crean y destruyen
constantemente: rutas que se navegan, listas que se filtran, modales que se
abren y cierran. Sin limpieza, cada creación deja basura en memoria.

---

## 3 · `<template>` y `<slot>` — "HTML reutilizable y personalizable"

### El concepto

`<template>` resuelve el problema de tener HTML que se instancia múltiples
veces sin strings de JavaScript ni copias manuales. `<slot>` convierte un
componente de caja cerrada en una caja con ventanas: el consumidor decide qué
poner en cada ventana. Si no pone nada, el componente tiene un contenido
por defecto (el fallback).

### Pruébalo — template, clones y slots

Con el **ejemplo 03** abierto:

```js
// 1. La template está en el DOM pero no renderiza nada
const tpl = document.getElementById("card-plantilla");
tpl.isConnected; // true → está en el DOM
tpl; // HTMLTemplateElement (visible en DevTools → Elements)
tpl.content; // DocumentFragment con el HTML dentro

// 2. Cada clon es un fragmento independiente
// Pulsa "Clonar e insertar" tres veces.
// Ahora modifica uno y confirma que los demás no cambian:
const clones = document.querySelectorAll(".clone-card__num");
clones[0].textContent = "★";
// Solo ha cambiado el primero. Los otros siguen con '#2', '#3'
// La template original tampoco ha cambiado:
tpl.content.querySelector(".clone-card__num").textContent; // '' (vacío, intacto)

// 3. El contenido de los slots vive en el LIGHT DOM
// No está dentro del Shadow DOM: es accesible con querySelector normal
document.querySelector('info-card [slot="title"]'); // el span → accesible ✅
document.querySelector('info-card slot[name="title"]'); // null → está en shadow ❌

// 4. Añadir contenido a un slot vacío desde JavaScript
// La card-3 no tiene slots definidos y muestra el fallback del componente.
const card3 = document.getElementById("card-3");
const nuevoTitulo = document.createElement("span");
nuevoTitulo.setAttribute("slot", "title");
nuevoTitulo.textContent = "Añadido dinámicamente";
card3.appendChild(nuevoTitulo);
// El fallback desaparece. El Shadow DOM ha proyectado el nuevo contenido.

// 5. Ver qué nodos están asignados a cada slot
card3.shadowRoot.querySelector('slot[name="title"]').assignedNodes(); // [span → "Añadido dinámicamente"]
```

### Por qué importa más allá de este lab

El prop `children` de React es un slot. `<slot>` de Vue es un slot.
`<ng-content>` de Angular es un slot. Los tres permiten lo mismo: que el
componente defina estructura y el consumidor aporte contenido.

```jsx
// React: el children prop ES un slot implícito
<Modal>
<h1>Confirmación</h1>
<p>¿Seguro que quieres borrar esto?</p>
</Modal>

// Web component nativo: equivalente exacto
<mi-modal>
<h1 slot="titulo">Confirmación</h1>
<p slot="cuerpo">¿Seguro que quieres borrar esto?</p>
</mi-modal>
```

Los named slots de los web components son los **named slots de Vue** o los
**render props de React**: composición con múltiples puntos de inserción
controlados. Entender el modelo de slots hace que cuando llegues a cualquier
framework reconozcas el patrón inmediatamente.

---

## 4 · Shadow DOM — "la burbuja de estilos"

### El concepto

El Shadow DOM crea una frontera bidireccional: los selectores CSS del
documento no pueden entrar, y los estilos del componente no pueden salir.
`document.querySelector()` tampoco puede cruzarla. El componente vive en
su propio universo visual.

### Pruébalo — la frontera en acción

Con el **ejemplo 04** abierto:

```js
// 1. Intentar aplicar CSS externo al botón en Shadow DOM
// Pulsa "⚡ Aplicar estilo global" y observa:
// → El botón 1 (Light DOM) cambia a crimson
// → Los botones 2 y 3 (Shadow DOM) NO cambian
// La regla existe en el DOM pero no puede cruzar la frontera.

// 2. querySelector no cruza la frontera
document.querySelector("shadow-button button"); // null ❌
// El botón existe, pero el selector no puede verlo desde fuera

// 3. La única forma correcta de acceder: a través del shadowRoot
document.querySelector("shadow-button").shadowRoot.querySelector("button"); // ✅

// 4. mode: 'open' vs mode: 'closed'
document.getElementById("host-open").shadowRoot; // ShadowRoot → accesible
document.getElementById("host-closed").shadowRoot; // null → bloqueado

// 5. 'closed' no significa 'inaccesible para quien lo creó'
// window.closedShadow fue guardado en el script que creó el shadow root.
// El componente puede usarlo internamente, pero nadie desde fuera puede obtenerlo.
window.closedShadow.querySelector("button"); // ✅ el botón está ahí y funciona

// 6. Inyectar un estilo directamente en el shadow root (solo con 'open')
const host = document.getElementById("host-open");
const style = document.createElement("style");
style.textContent = "button { background: hotpink !important; }";
host.shadowRoot.appendChild(style);
// Solo afecta al interior de ese shadow root, no sale al exterior
```

### Por qué importa más allá de este lab

¿Por qué existe CSS Modules? Para que los estilos de un componente no
contaminen el resto. ¿Por qué existe `styled-components`? Por lo mismo.
¿Por qué Vue tiene `<style scoped>`?

Todos estos mecanismos resuelven exactamente el mismo problema que el Shadow
DOM: el CSS global es peligroso en aplicaciones grandes porque cualquier regla
puede afectar a cualquier elemento de la página.

La diferencia es que Shadow DOM es **nativo** (sin build, sin postprocesador)
y los frameworks añaden una capa de herramienta para simular ese aislamiento
en el Light DOM. Entender Shadow DOM te permite entender **por qué existen**
esas herramientas y qué resuelven exactamente.

Un detalle que raramente se menciona: `<input type="date">`, `<video controls>`
y `<details>` tienen su propia UI implementada **con Shadow DOM**. Cuando
intentas estilizar el calendario de un `<input type="date">` y no puedes,
es Shadow DOM lo que te lo impide.

---

## 5 · El componente completo — "todo junto en un caso real"

### El concepto

Un web component bien construido combina las tres tecnologías con una
responsabilidad clara para cada parte:

```
constructor()              → estado JavaScript (contadores, flags, referencias)
connectedCallback()        → crear UI, iniciar procesos, leer atributos
disconnectedCallback()     → limpiar procesos
attributeChangedCallback() → actualizar UI cuando cambian los datos
<template>                 → estructura HTML y estilos encapsulados
<slot>                     → puntos de personalización para el consumidor
Shadow DOM                 → frontera de aislamiento
```

### Pruébalo — explorar el componente completo

Con el **ejemplo 05** abierto:

```js
// 1. Las tres cards se crearon con el upgrade al definir el custom element.
// Cada una tiene su propio Shadow DOM, su propio timer y su propio estado.
window.cards[0]._intervalId; // ID del setInterval activo
window.cards[0]._secondsConnected; // segundos desde el último connectedCallback

// 2. attributeChangedCallback en vivo
// Una línea desencadena tres cambios visuales simultáneos:
// badge → "Agotado", card → atenuada (vía CSS :host), botón → desactivado
window.cards[0].setAttribute("data-stock", "0");

// Restaurar
window.cards[0].setAttribute("data-stock", "99");

// 3. El Shadow DOM encapsula la UI pero sigue siendo inspeccionable
window.cards[1].shadowRoot.querySelector(".card");
window.cards[1].shadowRoot.getElementById("stock-badge").textContent;
window.cards[1].shadowRoot.getElementById("timer").textContent;

// 4. El contenido (slots) vive en el Light DOM
window.cards[0].querySelector('[slot="title"]').textContent; // "Auriculares Pro X"
window.cards[0].querySelector('[slot="price"]').textContent; // "€129"

// 5. disconnectedCallback limpia el timer
// Observa el timer del tercer card. Pulsa "− Quitar última card".
// El timer de ese card se congela: el intervalo fue limpiado.
// Sin esa limpieza, el setInterval seguiría corriendo en memoria
// aunque no hubiera nada visible ni accesible en el DOM.

// 6. connectedCallback dispara de nuevo al re-añadir
// Pulsa "+ Añadir card dinámica". El timer de la nueva card empieza en 0.
// Si quitaras y volvieras a añadir la misma card, el timer se reiniciaría:
// connectedCallback se ejecuta cada vez que el elemento entra en el DOM.
```

### Por qué importa más allá de este lab

Un componente de React con hooks sigue exactamente esta misma estructura:

```jsx
function ProductCard({ stock, title, price }) {
  // constructor(): estado inicial
  const [seconds, setSeconds] = useState(0);

  // connectedCallback() + disconnectedCallback() en una sola función
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer); // ← disconnectedCallback
  }, []);

  // attributeChangedCallback(): automático cuando stock cambia
  const badge =
    stock === 0 ? "Agotado" : stock <= 5 ? "Últimas " + stock : "En stock";

  return <article>...</article>; // ← <template>
}
```

No es una similitud superficial. React modeló deliberadamente su ciclo de
vida sobre el patrón de los custom elements. Cuando los hooks reemplazaron a
los métodos de clase en React 16.8, el modelo se acercó aún más al nativo:
`useEffect` con cleanup es `connectedCallback` + `disconnectedCallback` en
una sola función.

---

## 6 · CSS Custom Properties como API de theming — "la interfaz pública del componente"

### El concepto

El Shadow DOM bloquea los selectores CSS externos. Pero las CSS Custom
Properties son valores heredables: cruzan la frontera igual que `color` o
`font-family`. Esta característica convierte las Custom Properties en la
**API pública de estilos** de un componente.

```css
/* El componente declara qué acepta (su API de estilos) */
button {
  background: var(--btn-bg, #6366f1); /* parámetro con fallback */
  color: var(--btn-color, white);
}

/* El consumidor usa esa API sin tocar el componente */
mi-boton {
  --btn-bg: crimson;
}
```

### Pruébalo — la diferencia entre selector y propiedad

Con el **ejemplo 06** abierto, sigue la demostración de la sección 1 paso
a paso y después ejecuta esto en consola:

```js
// 1. Un selector externo no llega al shadow DOM (ya lo viste en el ejemplo 04)
// Pulsa "1 · Selector CSS (fallará)" y observa el output.
// La regla existe en document.styleSheets pero el botón no cambió.

// 2. Una custom property sí llega
window.btnProof.style.setProperty("--btn-bg", "hotpink");
window.btnProof.style.setProperty("--btn-color", "black");
// El botón cambió. La propiedad cruzó la frontera.

// 3. Verificar que el valor llegó
getComputedStyle(window.btnProof).getPropertyValue("--btn-bg").trim();
// → "hotpink"

// 4. Eliminar la propiedad → vuelve al fallback del componente
window.btnProof.style.removeProperty("--btn-bg");
window.btnProof.style.removeProperty("--btn-color");
// El botón vuelve a #6366f1 (el fallback de var(--btn-bg, #6366f1))

// 5. Un elemento sin propiedades definidas usa los fallbacks
// El botón #btn-default no tiene ninguna propiedad definida externamente:
getComputedStyle(document.getElementById("btn-default"))
  .getPropertyValue("--btn-bg")
  .trim();
// → '' (vacío) — pero el botón se ve azul porque el componente usa el fallback

// 6. Theming en tiempo real desde JavaScript
// (equivalente a lo que hace el panel de la sección 3)
window.btnLive.style.setProperty("--btn-bg", "#10b981");
window.btnLive.style.setProperty("--btn-radius", "0");
window.btnLive.style.setProperty("--btn-border", "3px solid #065f46");
// Cada cambio se refleja instantáneamente sin re-renderizar el componente

// 7. Las propiedades se heredan por el árbol
// Si defines la variable en el padre, todos los hijos la heredan:
document.querySelector(".themed-grid").style.setProperty("--btn-bg", "#dc2626");
// Los tres botones del grid cambian. Luego limpia:
document.querySelector(".themed-grid").style.removeProperty("--btn-bg");
```

### Por qué importa más allá de este lab

Abre la documentación de cualquier design system moderno y verás este patrón:

- **Bootstrap 5**: toda su personalización son variables CSS
  (`--bs-primary`, `--bs-font-size-base`...)
- **Material Design 3**: `--md-sys-color-primary`, `--md-sys-typescale-*`...
- **shadcn/ui** y **Radix UI**: su sistema de theming completo son custom
  properties definidas en `:root`
- **Tailwind CSS**: la sintaxis `dark:bg-gray-900` usa custom properties
  bajo el capó para cambiar los tokens de color según el tema activo

El patrón no es académico: es el **mecanismo estándar de theming de la
industria**. Saber leer una tabla de custom properties de un design system y
saber definirlas en tus componentes es una habilidad directamente aplicable
en cualquier proyecto profesional desde el primer día.

---

## El panorama completo

Estos son los seis conceptos que has aprendido y cómo aparecen en cada
tecnología del ecosistema:

| Concepto nativo            | React                     | Vue                    | Angular                      | CSS / Herramientas            |
| -------------------------- | ------------------------- | ---------------------- | ---------------------------- | ----------------------------- |
| `customElements.define`    | `function Component()`    | `defineComponent()`    | `@Component`                 | —                             |
| `connectedCallback`        | `useEffect(() => {}, [])` | `onMounted()`          | `ngOnInit()`                 | —                             |
| `disconnectedCallback`     | `return () => cleanup`    | `onUnmounted()`        | `ngOnDestroy()`              | —                             |
| `attributeChangedCallback` | re-render por props/state | watchers / computed    | `ngOnChanges()`              | —                             |
| `<template>` + Shadow DOM  | JSX + CSS Modules         | SFC + `<style scoped>` | template + ViewEncapsulation | styled-components, Tailwind   |
| `<slot>`                   | `children` / render props | `<slot>`               | `<ng-content>`               | —                             |
| CSS Custom Properties      | variables en módulos      | variables en SFC       | variables en :host           | Bootstrap 5, shadcn/ui, Radix |

Los frameworks no reemplazan estas APIs: las envuelven con mejoras de
ergonomía (reactividad declarativa, JSX, compiladores que optimizan el
rendimiento). Pero el modelo mental es el mismo.

Un desarrollador que entiende esta tabla puede:

- Aprender un framework nuevo en días, no semanas, porque reconoce los patrones.
- Depurar problemas de estilos que los frameworks no resuelven automáticamente.
- Elegir cuándo un web component nativo es suficiente y cuándo un framework
  aporta valor real.
- Leer la documentación de cualquier design system moderno sin confusión.
- Entender por qué existen herramientas como CSS Modules o styled-components,
  no solo cómo usarlas.
