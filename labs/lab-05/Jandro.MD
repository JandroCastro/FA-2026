# Guía del instructor — Lab 05: Eventos y Lit

---

## Antes de empezar

### Lo que el alumno trae a este lab

El alumno llega con Web Components nativos (Lab 04): sabe crear custom
elements, adjuntar shadow DOM, usar templates y slots. Sabe que el Shadow DOM
encapsula estilos. Lo que **no** sabe aún es:

- Que el Shadow DOM también encapsula eventos (no solo estilos).
- Cómo comunicar componentes que no son padre-hijo.
- Que existe una librería (Lit) que reduce el boilerplate a un tercio sin
  cambiar lo que hace el navegador.

Tu trabajo en este lab es conectar esos tres puntos en una narrativa coherente:
primero entender cómo fluyen los eventos, después entender dónde se rompen,
después aprender a repararlos y, finalmente, ver cómo Lit simplifica todo lo
anterior.

### Preparación mínima

- Abre los 5 ejemplos en pestañas separadas antes de clase.
- Ten la pestaña Elements de DevTools visible para los ejemplos 02 y 05
  (los atributos HTML en tiempo real son parte central de la demo).
- Para los ejemplos 04 y 05, los scripts son `type="module"`. Si el alumno
  abre el HTML directamente con `file://`, el import de Lit fallará por
  política CORS. Necesita un servidor local (Live Server o similar).
- Prepara un snippet de consola para cada ejemplo. No pierdas tiempo tecleando.

---

## El hilo conductor del lab

Los 5 ejemplos cuentan **una sola historia** en 5 actos. Si la pierdes,
cada ejemplo parece un tema diferente.

| Acto | Ejemplo | La pregunta que responde                            |
| ---- | ------- | --------------------------------------------------- |
| 1    | ex-01   | ¿Cómo se mueven los eventos por el DOM?             |
| 2    | ex-02   | ¿Por qué los eventos se rompen en el Shadow DOM?    |
| 3    | ex-03   | ¿Cómo comunico componentes que no son padre-hijo?   |
| 4    | ex-04   | ¿Por qué Lit existe y qué problema resuelve?        |
| 5    | ex-05   | ¿Cómo configuro y controlo el ciclo de vida en Lit? |

Enuncia la pregunta en voz alta antes de cada ejemplo. No la respondas tú:
deja que el alumno la descubra en la demo.

---

## Ejemplo 01 · Bubbling y delegación en el Light DOM

**Tiempo estimado:** 20-25 min

### Objetivo pedagógico

Que el alumno internalice que los eventos no se quedan donde ocurren: suben.
Y que `target` y `currentTarget` son cosas distintas. Sin esto, los ejemplos
02 y 03 no tienen sentido.

### Pregunta de apertura

Señala cualquier botón anidado en la página del ejemplo y pregunta:

> "Hay tres `div` anidados, cada uno con un listener. Hago click en el más
> profundo. ¿Cuántos listeners se disparan?"

La mayoría dirá uno. Muéstralo en el output: se disparan tres. Ese momento
de sorpresa es el gancho hacia el bubbling.

Si quieres hacerlo ejecutable antes de abrir el ejemplo:

```js
// En cualquier pestaña del navegador:
const parent = document.createElement("div");
const child = document.createElement("button");
parent.appendChild(child);
document.body.appendChild(parent);

parent.addEventListener("click", () => console.log("parent recibió el evento"));
child.click();
// → parent recibió el evento
// El padre recibió el evento aunque el click fue en el hijo
```

### Cómo explicar target vs currentTarget

Es la confusión más frecuente del ejemplo. La analogía que funciona mejor:

> "Imagina que envías una carta. `target` es el remitente (quien la escribió,
> no cambia). `currentTarget` es quién la está leyendo ahora mismo. La carta
> pasa por varias manos antes de llegar al destinatario final."

Muéstralo en el output del ejemplo: la primera columna (`target`) siempre
es `#inner` aunque el evento esté siendo procesado por `#outer`. Eso es
exactamente lo que describe la analogía.

### Demo 2. Cuándo usar stopPropagation — y cuándo no

**Casos legítimos** — hay tres patrones donde stopPropagation es la herramienta correcta:

1. **Dropdown / menú que no debe cerrarse al hacer click dentro.**
   El documento tiene un listener `click` que cierra el menú cuando detecta un
   click fuera. Sin `stopPropagation` en el propio menú, un click en una opción
   cerraría el menú antes de procesar la opción.

2. **Modal con fondo oscuro.**
   Click en el fondo → cerrar modal. Click en el contenido del modal → no cerrar.
   `stopPropagation` en el contenido evita que el click llegue al fondo.

3. **Elemento interactivo anidado dentro de otro.**
   Un botón "Eliminar" dentro de una card navegable. Click en eliminar no debería
   también disparar la navegación de la card.

**Cuándo es un síntoma, no una solución**

Si alguien usa `stopPropagation` para "arreglar" que un listener del padre recibe
clicks que no debería, el problema real casi siempre es que el listener del padre
no comprueba `event.target`. La corrección correcta:

```js
// ❌ Parar la propagación para que el padre no reaccione
boton.addEventListener("click", (e) => {
  e.stopPropagation();
  eliminar();
});

// ✅ El padre comprueba si el click fue en él o en un hijo que no le interesa
card.addEventListener("click", (e) => {
  if (e.target.closest(".btn-eliminar")) return;
  navegar();
});
```

La segunda versión no rompe nada. La primera sí puede.

**Consecuencias reales de parar la propagación sin cuidado**

Esto es lo que más sorprende al alumno y lo más importante de transmitir:

- **Rompe listeners de terceros que no conoces.** Las herramientas de analytics
  (Google Analytics, Hotjar, Mixpanel) escuchan clicks en `document` para registrar
  interacciones. Si paras la propagación, esos clicks nunca se registran.
  El cliente llama dos semanas después porque sus métricas están rotas.

- **Rompe herramientas de testing.** Cypress, Playwright y Selenium a veces
  escuchan eventos a nivel de documento para detectar interacciones. Un
  `stopPropagation` en el sitio equivocado puede hacer que los tests fallen
  de forma imposible de depurar.

- **Rompe la accesibilidad.** Algunos lectores de pantalla y herramientas de
  asistencia se enganchan a eventos del documento. Parar la propagación puede
  hacer que dejen de funcionar en ese componente.

- **Hace el código frágil.** Quien añada en el futuro un listener en un elemento
  padre no recibirá el evento y no sabrá por qué. `stopPropagation` es invisible
  desde fuera.

**La pregunta de clase**

Antes de mostrar esto, pregunta:

> "Si paro la propagación en un click, ¿qué otros listeners se ven afectados
> además de los que yo he escrito?"

La respuesta honesta es: no lo sabes. Y esa incertidumbre es exactamente
el problema.

**La regla para llevarse a casa**

> Usa `stopPropagation` cuando necesitas controlar el comportamiento de un
> patrón de UI específico (modal, dropdown, elemento interactivo anidado).
> No lo uses para protegerte de que un listener del padre reciba algo que
> no debería — ese es un problema de lógica en el listener del padre,
> no un problema de propagación.

### La demo de delegación

Antes de mostrar el código, pregunta:

> "Tengo una lista con 500 ítems. Si pongo un `addEventListener` en cada uno,
> ¿qué pasa cuando añado un ítem nuevo dinámicamente?"

El nuevo ítem no tiene listener. El alumno lo sabe. Eso abre la pregunta:
"¿hay una forma mejor?"

Luego muestra la sección 3: un solo listener en el `<ul>`. Añade ítems
con el botón y confirma en consola que funcionan:

```js
addTask();
addTask();
// Haz click en los nuevos ítems
window.lastDelegatedEvent.currentTarget.tagName; // 'UL' — siempre el ul
```

### Lo que más cuesta: stopPropagation

Los alumnos confunden `stopPropagation()` con "cancelar el evento".
La distinción:

- `stopPropagation()` → el evento no sube más. Los listeners en los padres
  no se enteran.
- `preventDefault()` → el comportamiento por defecto del navegador no ocurre
  (ej: el formulario no se envía). El evento sigue subiendo normalmente.

Son ortogonales. Uno no implica el otro.

### Frase de cierre

> "Los eventos no se quedan donde ocurren: suben buscando quién los escuche.
> `target` es el origen, `currentTarget` es quién procesa ahora. Delegación
> es poner un listener en el padre para gestionar todos los hijos, incluso
> los que todavía no existen."

---

## Ejemplo 02 · Eventos en el Shadow DOM

**Tiempo estimado:** 25-30 min

### Objetivo pedagógico

Que el alumno entienda que el Shadow DOM no es solo una barrera para estilos:
también es una barrera para eventos. Y que `composed: true` abre una puerta
en esa barrera, pero con retargeting como precio.

### Pregunta de

### Antes de la demo: bubbles y composed no son lo mismo

Lo que hemos visto, pero en el shadow!

Explícalo verbalmente antes de abrir el ejemplo. Dos frases:

> **`bubbles`** — ¿el evento sube por el árbol o se queda donde nació?
> `bubbles: false` → se queda en el target, no llega ni al padre.
> `bubbles: true` → sube nodo a nodo hacia la raíz de su árbol.

> **`composed`** — ¿puede cruzar la frontera entre el shadow DOM y el light DOM?
> `composed: false` → aunque burbujee, se detiene en la raíz del shadow DOM.
> `composed: true` → cruza la frontera y sigue subiendo en el light DOM.

Son independientes. `bubbles` describe el movimiento dentro de un árbol.
`composed` decide si el evento puede saltar de un árbol a otro.

Para sustituir la pizarra, abre DevTools → Elements con el ejemplo cargado
y señala físicamente la estructura mientras hablas:

```
▼ body
▼ shadow-signal       ← light DOM, aquí para el evento si composed: false
    #shadow-root
      ▼ div.wrapper
           button     ← el evento nace aquí
```

> "Con `bubbles: true` sube hasta el shadow-root. Con `composed: false`
> ahí se para. Para que llegue al `body` o al `document` necesita
> `composed: true`."

En este ejemplo solo trabajamos con `bubbles: true`. La variable que
cambia entre las demos es únicamente `composed`.

Ejecuta esto en la consola antes de abrir el ejemplo:

```js
// Crear un shadow root en un div normal
const host = document.createElement("div");
document.body.appendChild(host);
const shadow = host.attachShadow({ mode: "open" });

const btn = document.createElement("button");
shadow.appendChild(btn);

document.addEventListener("demo-event", () =>
  console.log("✅ document lo recibió"),
);

// Sin composed: false por defecto — no cruza la frontera
btn.dispatchEvent(new CustomEvent("demo-event", { bubbles: true }));
// → silencio. Nada en la consola.

// Con composed: true — sí cruza
btn.dispatchEvent(
  new CustomEvent("demo-event", { bubbles: true, composed: true }),
);
// → ✅ document lo recibió
```

Pregunta: _"El botón existe. Hicimos click. ¿Por qué el document no lo vio?"_

La respuesta que quieres: existe una frontera entre el shadow DOM y el
documento. El evento no cruzó.

### Cómo explicar composed: true

Dibuja o describe verbalmente dos árboles separados por una línea:

```
LIGHT DOM                    SHADOW DOM
─────────────────────────────│─────────────────
document                     │ shadow-root
 └─ body                    │   └─ div.wrapper
      └─ shadow-signal ←────┤       └─ button
                            │
  El evento nace aquí ──────┘
  ¿Cruza la línea?
```

Sin `composed`: no. Con `composed: true`: sí, y el evento continúa
subiendo por el Light DOM hasta `document`.

### La demo más importante: retargeting

Este es el momento pedagógico central del ejemplo. Ejecuta la sección 2
(sig-3) y muestra las tres líneas del output:

```
① shadow root:   e.target → button.btn     ← el botón real
② host (sig-3):  e.target → shadow-signal  ← target cambió
③ document:      e.target → shadow-signal  ← target cambió
```

Pregunta: _"¿Por qué `e.target` cambió al pasar de ① a ②?"_

La respuesta: el navegador protege la encapsulación. Los observadores del
Light DOM no deberían ver los internos del Shadow DOM. El retargeting es
el mecanismo de esa protección.

Luego muestra que `composedPath()` rompe esa protección intencionadamente:

```js
window.lastComposedPath[0]; // el botón real
// vs
window.lastDocEvent.target; // el host (retargeteado)
```

> "Si necesitas el elemento original y tienes acceso al shadow root, usa
> `composedPath()[0]`. Si solo necesitas saber qué componente lo originó,
> `event.target` es suficiente y más seguro."

### Lo que más cuesta: cuándo usar composed

Los alumnos preguntan: "¿entonces siempre pongo `composed: true`?"

La regla práctica:

- **Eventos de interacción** que el consumidor del componente necesita escuchar
  (`timer-play`, `form-submit`, `selection-changed`): sí, `composed: true`.
- **Eventos internos** entre partes del mismo componente: no. Mantenerlos
  dentro del shadow DOM es parte de la encapsulación.

### Frase de cierre

> "El Shadow DOM es una frontera para los eventos igual que para los estilos.
> `composed: true` abre una puerta en esa frontera para que el evento llegue
> al Light DOM. El precio es el retargeting: los observadores externos no
> ven los internos del shadow. `composedPath()` muestra la ruta completa,
> pero solo dentro del handler."

---

## Ejemplo 03 · Patrones de comunicación entre componentes

**Tiempo estimado:** 20-25 min

### Objetivo pedagógico

Que el alumno entienda que `composed: true` resuelve "notificar hacia arriba",
pero no resuelve "hablar con un componente en otra rama del árbol". Que el
EventBus es la solución y que `disconnectedCallback` es obligatorio cuando se
usa.

### Pregunta de apertura

Dibuja en la pizarra (o describe) este árbol:

```
      app
     /   \
filtros  resultados
```

Pregunta: _"Si `filtros` emite un evento con `composed: true` y `bubbles: true`,
¿lo recibe `resultados`?"_

Pista: los eventos solo suben. `app` lo recibiría. ¿Y `resultados`?

La respuesta: no. Los eventos no bajan por otras ramas. `app` tendría que
escuchar el evento y reenviarle información a `resultados`. Eso se llama
"prop drilling" y se complica rápidamente.

> "Cuando los componentes no son padre-hijo, necesitamos un intermediario.
> Ese intermediario es el EventBus."

### Cómo explicar el EventBus

No empieces por el código. Empieza por la analogía:

> "El EventBus es como un tablón de anuncios. Quien quiera publicar un mensaje
> lo pega en el tablón. Quien quiera enterarse de algo se suscribe al tablón.
> Los emisores no saben quién lee. Los lectores no saben quién escribe."

Luego muestra que la implementación son exactamente ocho líneas sobre
`EventTarget` — la misma clase base de `window` y cualquier nodo del DOM:

```js
class EventBus extends EventTarget {
  emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
  on(name, handler) {
    this.addEventListener(name, handler);
  }
  off(name, handler) {
    this.removeEventListener(name, handler);
  }
}
```

### Cómo explicar el EventBus

Muestra el código y señala línea a línea lo que hace cada método:

```js
class EventBus extends EventTarget {
  // ← hereda de EventTarget, igual que window o document
  emit(name, detail) {
    this.dispatchEvent(
      // ← dispatchEvent nativo de EventTarget
      new CustomEvent(name, { detail }),
    );
  }
  on(name, handler) {
    this.addEventListener(name, handler); // ← addEventListener nativo
  }
  off(name, handler) {
    this.removeEventListener(name, handler); // ← removeEventListener nativo
  }
}

const bus = new EventBus(); // ← un objeto JS en memoria, no está en el DOM
```

`emit`, `on` y `off` no hacen nada nuevo. Son alias con nombres más cortos
sobre los tres métodos que los alumnos ya conocen. El bus entero son ocho líneas
porque no necesita más.

Pregunta: _"¿Habéis usado `window.addEventListener` alguna vez?"_

Sí. Pues `window` ES un `EventTarget` — tiene exactamente los mismos métodos.
La diferencia es que `window` está ligado al árbol del DOM y al navegador.
El bus es un `EventTarget` limpio, sin árbol, sin DOM, sin efectos secundarios.
Cualquier código que tenga la referencia `bus` puede emitir y escuchar.

---

### La demo de cleanup (sección 3)

Sigue esta secuencia **en este orden exacto** y no avances hasta que el alumno
vea cada resultado:

**Paso 1** — Receiver conectado. Envía un mensaje desde la sección 2.
El receiver lo muestra. El log de sección 2 también. Todo esperado.

**Paso 2** — Pulsa "Desconectar receiver". El receiver desaparece visualmente.

**Paso 3** — Envía otro mensaje desde la sección 2.
El log de sección 2 sigue registrando el mensaje.
El receiver, que no está en el DOM, no muestra nada.

Pregunta aquí: _"¿Por qué el log de sección 2 sigue funcionando?"_

→ Porque ese listener es del script principal, no del receiver. El bus no sabe
nada del receiver. El bus solo sabe que tenía un handler registrado, y ese
handler se eliminó en `disconnectedCallback`.

**Paso 4** — Plantea el escenario sin cleanup. Abre el código y señala estas
dos líneas enfrentadas:

```js
// connectedCallback — se ejecuta al entrar en el DOM
this._handler = (e) => this._onMessage(e); // referencia guardada
bus.on("bus-message", this._handler); // suscripción

// disconnectedCallback — se ejecuta al salir del DOM
bus.off("bus-message", this._handler); // misma referencia → se elimina exactamente
this._handler = null;
```

> "Si `disconnectedCallback` no llamase a `bus.off()`, el bus retendría
> la referencia a `this._handler`. Eso mantiene vivo al receiver en memoria
> aunque no esté en el DOM. Cada reconexión añade un handler nuevo sin
> eliminar el anterior. Tras diez reconexiones, el mismo mensaje lo procesa
> diez veces."

Esto conecta con Lab 02 (memory leaks) y Lab 04 (disconnectedCallback).

---

### Lo que más cuesta: la referencia guardada

El error ocurre porque los alumnos piensan que dos funciones con el mismo
código son la misma función. No lo son.

```js
const a = () => console.log("hola");
const b = () => console.log("hola");
a === b; // false — mismo código, objetos distintos en memoria
```

`removeEventListener` compara referencias, no código. Si no guardas la misma
referencia que usaste en `addEventListener`, no eliminas nada.

```js
// ❌ Cada llamada crea una función nueva — son objetos distintos
connectedCallback() {
bus.on('evento', e => this._onEvent(e));      // función A
}
disconnectedCallback() {
bus.off('evento', e => this._onEvent(e));     // función B ← no es A, no elimina nada
}

// ✅ Se guarda la referencia para usar la misma en on y en off
connectedCallback() {
this._handler = (e) => this._onEvent(e);  // se crea UNA función y se guarda
bus.on('evento', this._handler);          // se registra esa función
}
disconnectedCallback() {
bus.off('evento', this._handler);         // se elimina exactamente esa función
}
```

La razón de que se cree un handler nuevo en cada `connectedCallback` (en lugar
de crearlo una sola vez en el constructor) es que

---

## Ejemplo 04 · Introducción a Lit

**Tiempo estimado:** 25-30 min

### Objetivo pedagógico

Que el alumno entienda que Lit no es un framework alternativo: es una capa
fina sobre los Web Components nativos que reduce el boilerplate. Que
`static properties` reemplaza a `observedAttributes` + `attributeChangedCallback`

- actualización manual del DOM. Que `html\`\`` es solo un tagged template literal.

### Pregunta de apertura

Antes de mostrar nada de Lit, recuerda Lab 04:

> "En el Lab 04, para hacer que un componente actualizara su texto cuando
> cambiaba una propiedad JS, ¿cuántos pasos había que hacer?"

La respuesta correcta: tres. Declarar `observedAttributes`, implementar
`attributeChangedCallback` para detectar el cambio, y actualizar el DOM
manualmente con `querySelector` o referencia guardada.

> "¿Y si la propiedad era un número que venía de un atributo string? ¿Dónde
> hacíais el `parseInt`?"

Silencio incómodo. Ese silencio es exactamente el problema que Lit resuelve.

### La demo de la sección 1: lado a lado

Esta es la demo más impactante del ejemplo. Muestra ambos contadores
funcionando y luego ejecuta en consola:

```js
// Vanilla: cambiar la propiedad interna NO actualiza el DOM
window.vanillaCounter._count = 99;
// El número en pantalla no cambió

// Lit: cambiar la propiedad SÍ actualiza el DOM
window.litCounter.count = 99;
// El número en pantalla cambió
```

Pregunta: _"¿Por qué el vanilla no cambió?"_

Respuesta esperada: porque nadie llamó a `this._numEl.textContent = 99`.
Habría que añadir esa línea manualmente.

> "Con Lit, declarar una propiedad en `static properties` hace que el
> framework sepa que cuando esa propiedad cambia hay que re-renderizar.
> La actualización del DOM es automática."

### Cómo explicar static properties

No empieces por la sintaxis. Empieza por la pregunta:

> "¿Cómo sabe Lit que `this.count` cambió? JavaScript no tiene eventos nativos
> para cambios de propiedad."

La respuesta: Lit transforma cada propiedad declarada en `static properties`
en un par getter/setter. Cuando haces `this.count++`, en realidad estás
llamando al setter de `count`, que internamente llama a `this.requestUpdate()`.

No hace falta entrar en el detalle de la implementación. La conclusión:

> "Lit 'envuelve' la propiedad en un getter/setter. Cuando el setter detecta
> que el valor cambió, schedula un re-render. Tú solo ves `this.count++`."

### Cómo explicar html``

Los alumnos se preguntan si es "HTML en JS" o "JS en HTML". La respuesta
correcta: es JavaScript.

> "`html\`\``es una función de JavaScript que recibe un template literal y
devuelve un objeto que Lit sabe convertir eficientemente a DOM. Las
expresiones`${...}`son JavaScript normal. Los`@event`, `.prop`y`?attr` son convenciones de Lit, no HTML estándar."

Ejecuta en consola para desmitificarlo:

```js
// html`` devuelve un TemplateResult, no HTML
// No es un string, es un objeto que Lit procesa
typeof window.litCounter.render(); // 'object'
```

### Lo que más cuesta: .value vs attribute

La diferencia entre `.value=${x}` (property binding con punto) y
`value=${x}` (attribute binding sin punto) confunde al inicio.

Regla práctica:

- Sin punto: Lit llama a `setAttribute('nombre', valor)`. El valor se convierte
  a string.
- Con punto: Lit asigna directamente la propiedad DOM. El tipo se preserva.

Para `input.value`, siempre hay que usar `.value` porque el atributo `value`
solo establece el valor inicial; la propiedad DOM `value` refleja el estado
actual.

### Frase de cierre

> "Lit no inventa nada: usa Shadow DOM, Custom Elements y Templates, igual
> que el Lab 04. Lo que añade es `static properties` para la reactividad y
> `html\`\`` para el template declarativo. El resultado es el mismo componente
> con un tercio del código."

---

## Ejemplo 05 · Lit: reflect, tipos y ciclo de vida

**Tiempo estimado:** 20-25 min

### Objetivo pedagógico

Conectar los tres conceptos que hacen a Lit apto para componentes
configurables en proyectos reales: `reflect` para que los atributos HTML se
sincronicen con las propiedades, los tipos para que los atributos string
lleguen al tipo correcto, y el ciclo de vida para saber cuándo el DOM
renderizado está disponible.

### Pregunta de apertura

Ejecuta esto con el ejemplo abierto en la consola:

```js
// El litProfile del ejemplo 04 tenía status con reflect: true
// Cambia el status desde JS y comprueba el atributo
window.reflectCard.active = true;
window.reflectCard.getAttribute("active"); // ''

window.reflectCard.title = "Nuevo";
window.reflectCard.getAttribute("title"); // null
```

Pregunta: _"¿Por qué `active` actualizó el atributo y `title` no?"_

La respuesta es exactamente `reflect: true` vs sin reflect. Eso abre la
explicación.

### Cómo explicar reflect

La analogía más clara:

> "Cuando declaras una propiedad con `reflect: true`, estás diciendo a Lit:
> 'cuando esta propiedad cambie en JavaScript, escribe también el atributo
> HTML'. Es un puente bidireccional. Sin `reflect`, el puente solo va en una
> dirección: el atributo HTML llega como propiedad JS, pero los cambios JS
> no vuelven al atributo."

La pregunta que suele surgir: "¿para qué quiero el atributo en el HTML si
la propiedad JS ya tiene el valor?"

La respuesta: **para los selectores CSS**.

```css
:host([active]) .card {
  border-color: green;
}
```

Este selector solo funciona si el atributo `active` existe en el DOM.
Sin `reflect: true`, el CSS nunca sabe que `this.active = true`.

Abre DevTools → Elements mientras ejecutas `toggleActive()` y muestra
en tiempo real cómo el atributo aparece y desaparece en el inspector.

### La trampa de Boolean

Esta es la demo más importante de la sección 2. Ejecuta la secuencia completa:

```js
// Parece que esto pondría enabled en false...
window.typeDemo.setAttribute("enabled", "false");
window.typeDemo.enabled; // true  ← ¡trampa!
```

Pregunta antes de revelar el resultado: _"¿Cuántos creéis que enabled será
true y cuántos false?"_

Normalmente la sala se divide. El resultado (true) sorprende a todos los que
votaron false.

La razón: `type: Boolean` en Lit usa **presencia del atributo**, no su valor.
Es el mismo comportamiento que los atributos nativos (`disabled`, `checked`,
`readonly`). El string `"false"` es ignorado.

> "Esta es una de las confusiones más frecuentes con Web Components. Cada
> vez que veáis `elemento.setAttribute('algo', 'false')` y el componente
> no cambia, sospechad de este comportamiento."

### seccion 3 Cómo explicar firstUpdated vs connectedCallback

Esta distinción es crítica para el proyecto del timer. Dibuja el timeline:

```
EVENTO                VANILLA                  LIT
─────────────────────────────────────────────────────
Elemento en DOM  →  connectedCallback()    connectedCallback() (interno)
                                          schedula render
...microtask...
Render ocurre    →  (no hay hook)       →  firstUpdated()   ← DOM disponible
Propiedad cambia →  attributeChanged... →  updated()
```

La pregunta que resuelve firstUpdated:

> "En `connectedCallback`, ¿podemos hacer
> `this.renderRoot.querySelector('input')`?"

Con Lit: no. El shadow DOM todavía no está renderizado en ese momento.
El lugar correcto es `firstUpdated()`, donde Lit garantiza que el render
ya ocurrió.

En el proyecto del timer, los segundos se cuentan en un intervalo que debe
empezar después del render. El lugar es `firstUpdated()`.

### La demo de updated con changedProperties

Muestra el log de sección 3 después de cambiar el valor varias veces:

```
[timestamp] firstUpdated()
 value: undefined → "inicial"   ← primer render, valor previo = undefined

[timestamp] updated()
 changedProperties: value: "inicial" → "alpha"

[timestamp] updated()
 changedProperties: value: "alpha" → "beta"
```

El punto a enfatizar: `changedProperties.get('propName')` devuelve el
**valor anterior**. El valor actual está en `this.propName`. Esto permite
comparar antes/después dentro del hook.

### Frase de cierre

> "`reflect: true` es el puente de vuelta: propiedad JS → atributo HTML.
> Sin él, los selectores CSS no funcionan. `Boolean` usa presencia del
> atributo, no su valor — el string 'false' no significa false.
> `firstUpdated()` es el momento correcto para acceder al DOM renderizado.
> `updated()` es para reaccionar a cambios específicos de propiedades."

---

## Errores frecuentes de concepto

### "composed: true siempre, para todo"

No. Los eventos internos entre partes del mismo componente deben permanecer
dentro del shadow DOM. `composed: true` es para la API pública del componente,
no para la comunicación interna.

### "El EventBus es global, por lo tanto es un antipatrón"

Es una simplificación. El bus es global en el mismo sentido en que `document`
es global. El problema real no es la globalidad sino la ausencia de cleanup.
Un bus bien usado (con `off` en `disconnectedCallback`) es una herramienta
válida y predecible.

### "static properties reemplaza connectedCallback"

No. `static properties` gestiona la reactividad de propiedades. `connectedCallback`
(o `firstUpdated()` en Lit) sigue siendo necesario para efectos secundarios:
iniciar timers, suscribirse a eventos, conectar al bus. La distinción es:
datos reactivos vs efectos.

### "reflect: true siempre, para todo"

No. `reflect: true` tiene un coste: cada cambio de propiedad escribe también
al DOM (atributo). Para propiedades que cambian muy frecuentemente (contadores
en tiempo real, coordenadas de ratón) el overhead puede ser notable. Usar
`reflect` solo cuando el atributo HTML sea necesario para CSS o para que otros
consumidores puedan leer el estado del componente via `getAttribute`.

### "firstUpdated es como connectedCallback"

El error más caro del lab. En `connectedCallback`, el shadow DOM de Lit NO
está renderizado. `this.renderRoot.querySelector(...)` devolverá `null`.
El lugar correcto para referencias al DOM interno es `firstUpdated`.

---
