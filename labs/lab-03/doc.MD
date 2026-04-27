# Lab 03 · Maquetación y Preprocesadores

## Introducción

Imagina que llevas seis meses desarrollando el frontend de una plataforma SaaS. Tienes 40 archivos CSS repartidos entre componentes, páginas y temas. El equipo de diseño decide cambiar el color principal de `#6366f1` a `#0ea5e9`. Tú abres el buscador del editor, encuentras 94 ocurrencias, y pasas dos horas cambiando valores uno a uno rezando para no romper nada.

O imagina que un cliente público te pide una auditoría de accesibilidad antes de lanzar el producto. Lighthouse reporta 23 errores críticos. Ninguno es visible a simple vista.

Este lab cubre las herramientas que convierten esas situaciones de dos horas en dos minutos, y esos 23 errores en cero.

---

## 1. Preprocesadores CSS

Un preprocesador añade una capa de lógica sobre CSS: variables con tipos, anidado, reutilización de bloques, funciones, condicionales. Tú escribes en la sintaxis del preprocesador; él genera el CSS que el navegador entiende.

```
styles/
├── tokens.scss        ← valores base
├── components/
│   ├── _button.scss
│   └── _card.scss
└── main.scss          ← punto de entrada
       ↓
 compilador SASS
       ↓
 dist/main.css       ← el navegador recibe esto
```

Los más usados son **SASS/SCSS**, Less, Stylus y PostCSS. Este lab se centra en SCSS porque es el más extendido en el mercado y el que más vas a encontrar en proyectos reales.

### 1.1 Instalación y flujo de trabajo

```bash
# Instalación global
npm install -g sass

# Compilar un archivo
sass input.scss output.css

# Modo watch: recompila en cada cambio
sass --watch scss/:css/

# En un proyecto con package.json
# package.json
{
"scripts": {
  "sass": "sass --watch src/scss:dist/css"
}
}
```

La extensión `.scss` usa llaves y punto y coma (igual que CSS). La extensión `.sass` usa indentación. La primera es más común por ser más familiar.

---

## 2. Variables SCSS y design tokens

### 2.1 Variables SCSS

Las variables SCSS se definen con `$` y se resuelven en tiempo de compilación. En el CSS final no queda rastro de ellas: el compilador las sustituyó por sus valores.

```scss
// Definición
$color-primary: #6366f1;
$color-danger: #ef4444;
$spacing-base: 1rem;
$border-radius: 8px;
$font-weight-bold: 700;

// Uso
.button {
  background: $color-primary;
  padding: $spacing-base * 0.5 $spacing-base;
  border-radius: $border-radius;
  font-weight: $font-weight-bold;
}

.button--danger {
  background: $color-danger;
}
```

El CSS compilado:

```css
.button {
  background: #6366f1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
}

.button--danger {
  background: #ef4444;
}
```

Ahora cambiar el color primario en toda la aplicación es modificar una línea.

### 2.2 CSS Custom Properties

Las CSS custom properties se definen con `--` y **sobreviven al navegador**. JavaScript puede leerlas y modificarlas en tiempo de ejecución.

```css
:root {
--color-primary: #6366f1;
--color-bg:      #0f172a;
}

.button {
background: var(--color-primary);
}
javascript
// Cambiar el tema en runtime
document.documentElement.style.setProperty('--color-primary', '#0ea5e9');

// Leer el valor actual
getComputedStyle(document.documentElement)
.getPropertyValue('--color-primary'); // → " #6366f1"
```

Las variables SCSS no son accesibles desde JavaScript:

```javascript
getComputedStyle(document.documentElement).getPropertyValue("$color-primary"); // → "" (vacío)
```

### 2.3 El patrón profesional: los dos sistemas juntos

La práctica habitual en producción es combinarlos:

```scss
// 1. Valores base en SCSS (para el build)
$brand: #6366f1;
$brand-hover: #4f46e5;
$bg-dark: #0f172a;

// 2. Expuestos como custom properties (para el runtime)
//    La sintaxis #{} interpola el valor de la variable SCSS
:root {
  --color-primary: #{$brand};
  --color-primary-hover: #{$brand-hover};
  --color-bg: #{$bg-dark};
}

// 3. Los componentes usan custom properties, nunca variables SCSS directamente
.button {
  background: var(--color-primary);
  &:hover {
    background: var(--color-primary-hover);
  }
}

// 4. El tema oscuro/claro se controla desde JavaScript o con media queries
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #f8fafc;
  }
}
```

**Regla práctica:** usa variables SCSS para los valores que nunca cambian en runtime (brand colors, tipografía base, breakpoints). Usa custom properties para los valores que el navegador o JavaScript necesitan poder modificar.

---

## 3. Nesting

### 3.1 Por qué existe

En CSS plano, cuando quieres dar estilos a los elementos de un componente repetirás su selector padre una y otra vez:

```css
.product-card { ... }
.product-card .product-card__image { ... }
.product-card .product-card__body { ... }
.product-card .product-card__title { ... }
.product-card .product-card__price { ... }
.product-card:hover { ... }
```

Con SCSS puedes reflejar la jerarquía visual del HTML en tu código:

```scss
.product-card {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #334155;
  transition: transform 0.15s;

  .product-card__image {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }

  .product-card__body {
    padding: 0.75rem;
  }

  .product-card__title {
    font-size: 1rem;
    font-weight: 600;
  }

  .product-card__price {
    color: #6366f1;
    font-size: 1.125rem;
  }

  &:hover {
    transform: translateY(-2px);
  }
}
```

### 3.2 Lo que genera el compilador

El CSS resultante es completamente plano. El nesting desaparece:

```css
.product-card { padding: 1rem; border-radius: 8px; ... }
.product-card .product-card__image { width: 100%; ... }
.product-card .product-card__body { padding: 0.75rem; }
.product-card .product-card__title { font-size: 1rem; ... }
.product-card .product-card__price { color: #6366f1; ... }
.product-card:hover { transform: translateY(-2px); }
```

### 3.3 El coste de la profundidad

Cada nivel de nesting añade un selector al resultado, lo que **incrementa la especificidad**. Un selector con especificidad alta es difícil de sobreescribir más adelante.

```scss
// SCSS con 4 niveles de profundidad
.dashboard {
  .sidebar {
    .nav {
      .nav__link {
        color: #94a3b8;

        &:hover {
          color: #f1f5f9;
        }
      }
    }
  }
}
```

Genera este selector con especificidad `(0, 4, 0)`:

```css
.dashboard .sidebar .nav .nav__link {
  color: #94a3b8;
}
.dashboard .sidebar .nav .nav__link:hover {
  color: #f1f5f9;
}
```

Para sobreescribir ese color en un contexto diferente necesitarías un selector igual de específico o recurrir a `!important`. Cualquiera de las dos opciones es una deuda de CSS que crece con el proyecto.

**Regla práctica: máximo 3 niveles de nesting.**

### 3.4 El operador `&`

`&` representa una referencia al selector padre. Su comportamiento varía según dónde se coloca:

```scss
.btn {
  color: white;

  // Pseudo-clase: genera .btn:hover
  &:hover {
    background: #4f46e5;
  }

  // Modificador BEM: genera .btn--danger
  &--danger {
    background: #ef4444;
  }

  // Estado: genera .btn.is-loading
  &.is-loading {
    opacity: 0.6;
    pointer-events: none;
  }

  // El padre queda al final: genera .dark-theme .btn
  .dark-theme & {
    border-color: white;
  }
}
```

Sin `&`, un selector dentro de un bloque anidado genera un selector descendente:

```scss
.btn {
  // Genera .btn .label (el espacio es el selector descendente)
  .label {
    font-size: 0.875rem;
  }
}
```

---

## 4. Mixins

### 4.1 Definición y uso

Un mixin define un bloque de estilos reutilizable. Al incluirlo con `@include`, el compilador copia ese bloque en el punto de uso.

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-banner {
  @include flex-center;
  height: 400px;
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  gap: 1rem;
}
```

CSS compilado:

```css
.hero-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}
```

El bloque se ha **copiado** dos veces. No se ha creado un selector compartido.

### 4.2 Parámetros

Los mixins aceptan parámetros con valores por defecto:

```scss
@mixin card($padding: 1rem, $radius: 8px, $border-color: #334155) {
  padding: $padding;
  border-radius: $radius;
  border: 1px solid $border-color;
  background: #1e293b;
}

// Sin parámetros: usa los valores por defecto
.notification-card {
  @include card;
}

// Con parámetros personalizados
.modal-card {
  @include card(1.5rem, 12px, #6366f1);
}

// Pasando solo algunos parámetros por nombre
.compact-card {
  @include card($padding: 0.5rem);
}
```

### 4.3 @content: el slot del mixin

Con `@content`, el mixin acepta un bloque de código personalizado. El patrón más habitual es un mixin que gestiona media queries:

```scss
@mixin from($breakpoint) {
  @media screen and (min-width: $breakpoint) {
    @content;
  }
}

.product-grid {
  grid-template-columns: 1fr; // base: móvil

  @include from(768px) {
    grid-template-columns: 1fr 1fr;
  }

  @include from(1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

El CSS compilado:

```css
.product-grid {
  grid-template-columns: 1fr;
}

@media screen and (min-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 4.4 Mixin vs clase compartida

Esta distinción tiene impacto real en el tamaño del CSS generado:

```scss
// Opción A: mixin (copia el bloque en cada uso)
@mixin reset-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-list {
  @include reset-list;
}
.breadcrumb {
  @include reset-list;
}
.tag-list {
  @include reset-list;
}
css
/* Resultado: el mismo bloque 3 veces */
.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.breadcrumb {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tag-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
css
/* Opción B: clase compartida (un solo bloque) */
.reset-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
```

**Cuándo usar cada uno:**

| Situación                                      | Solución             |
| ---------------------------------------------- | -------------------- |
| El código generado varía según parámetros      | Mixin                |
| El código es idéntico en todos los usos        | Clase compartida     |
| Necesitas envolver media queries o keyframes   | Mixin con `@content` |
| Es un patrón de layout reutilizable en el HTML | Clase utilitaria     |

---

## 5. Módulos SCSS

SCSS organiza los archivos como módulos. Los archivos parciales se nombran con `_` y no generan un CSS propio:

```
scss/
├── _tokens.scss      ← variables y custom properties
├── _reset.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   └── _modal.scss
└── main.scss         ← importa todo, genera main.css
scss
// main.scss
@use 'tokens';
@use 'reset';
@use 'components/button';
@use 'components/card';
@use 'components/modal';
```

`@use` carga el módulo una sola vez y crea un namespace para sus variables y mixins:

```scss
// _tokens.scss
$color-primary: #6366f1;

// main.scss
@use "tokens";

.button {
  // Accede a la variable con el namespace del módulo
  background: tokens.$color-primary;
}
```

`@forward` expone el contenido de un módulo para que otros puedan importarlo:

```scss
// _index.scss (barrel de la carpeta components/)
@forward "button";
@forward "card";
@forward "modal";

// main.scss — importa todo de un golpe
@use "components";
```

> **Nota sobre `@import`:** La directiva `@import` está deprecada en Dart Sass y será eliminada. Usa siempre `@use` y `@forward` en proyectos nuevos.

---

## 6. Funciones y control

### 6.1 Funciones

Las funciones devuelven un valor. Se diferencian de los mixins en que no generan reglas CSS directamente:

```scss
// Función para calcular rem a partir de px
@function rem($px, $base: 16) {
  @return ($px / $base) * 1rem;
}

// Función para generar z-index controlados
$z-layers: (
  modal: 300,
  tooltip: 200,
  header: 100,
  base: 1,
);

@function z($layer) {
  @return map-get($z-layers, $layer);
}

// Uso
.modal {
  font-size: rem(18); // → 1.125rem
  z-index: z(modal); // → 300
}

.header {
  z-index: z(header); // → 100
}
```

### 6.2 Directivas de control

```scss
// @if: lógica condicional
@mixin theme-text($theme) {
  @if $theme == "dark" {
    color: #f1f5f9;
    background: #0f172a;
  } @else if $theme == "light" {
    color: #0f172a;
    background: #f8fafc;
  } @else {
    color: inherit;
  }
}

// @each: iterar sobre una lista o mapa
$statuses: (
  success: #10b981,
  warning: #f59e0b,
  error: #ef4444,
  info: #6366f1,
);

@each $name, $color in $statuses {
  .badge--#{$name} {
    background: rgba($color, 0.15);
    color: $color;
    border-color: rgba($color, 0.3);
  }
}

// @for: repetir N veces
// Genera .col-1 a .col-12 para un grid de 12 columnas
@for $i from 1 through 12 {
  .col-#{$i} {
    flex: 0 0 percentage($i / 12);
    max-width: percentage($i / 12);
  }
}
```

---

## 7. Responsive design

### 7.1 El problema del diseño fijo

Un layout diseñado para 1440px de ancho en un móvil de 375px requiere scroll horizontal y hace el contenido ilegible. El diseño responsive resuelve esto con dos principios:

- **Flexibilidad:** los elementos se adaptan fluidamente dentro de su contenedor
- **Adaptabilidad:** el layout se reorganiza en rangos de tamaño definidos

La flexibilidad la trabajan flexbox y CSS Grid. La adaptabilidad la gestionan los breakpoints y las media queries.

### 7.2 Breakpoints

Un breakpoint es un punto de corte en el que el diseño cambia de estructura. Los valores exactos no son una verdad universal: se definen según el proyecto. Un conjunto típico:

| nombre | valor    | dispositivos típicos           |
| ------ | -------- | ------------------------------ |
| xs     | < 576px  | móviles en portrait            |
| sm     | ≥ 576px  | móviles en landscape, phablets |
| md     | ≥ 768px  | tablets                        |
| lg     | ≥ 992px  | laptops, monitores pequeños    |
| xl     | ≥ 1200px | monitores estándar             |
| xxl    | ≥ 1400px | monitores grandes              |

### 7.3 Media queries

Una media query aplica estilos solo cuando se cumplen una o varias condiciones:

```css
/* Solo pantallas con ancho mínimo de 768px */
@media screen and (min-width: 768px) {
  .sidebar {
    display: block;
  }
}

/* Rango: entre 576px y 991px */
@media screen and (min-width: 576px) and (max-width: 991px) {
  .hero {
    font-size: 1.5rem;
  }
}

/* Preferencia del sistema operativo */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
  }
}

/* Orientación del dispositivo */
@media (orientation: landscape) {
  .video-player {
    height: 100vh;
  }
}
```

En SCSS puedes usar variables para los breakpoints y mixins para encapsular la sintaxis:

```scss
$bp-sm: 576px;
$bp-md: 768px;
$bp-lg: 992px;
$bp-xl: 1200px;

@mixin from($bp) {
  @media screen and (min-width: $bp) {
    @content;
  }
}

.container {
  padding: 1rem;

  @include from($bp-md) {
    padding: 1.5rem;
  }
  @include from($bp-xl) {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### 7.4 Mobile first

Mobile first es una estrategia de escritura: los estilos base cubren la pantalla más pequeña, y las media queries con `min-width` añaden complejidad para pantallas más grandes. Nunca hay que deshacer estilos, solo añadir.

```scss
// Mobile first (min-width): se añade progresivamente
.product-grid {
  display: grid;
  grid-template-columns: 1fr; // móvil: 1 columna
  gap: 1rem;

  @include from($bp-sm) {
    grid-template-columns: 1fr 1fr; // tablet: 2 columnas
  }

  @include from($bp-lg) {
    grid-template-columns: 1fr 1fr 1fr; // desktop: 3 columnas
  }

  @include from($bp-xl) {
    grid-template-columns: repeat(4, 1fr); // wide: 4 columnas
  }
}
```

La alternativa, desktop first, requiere deshacer estilos en cada breakpoint descendente:

```scss
// Desktop first (max-width): hay que ir "quitando" hacia abajo
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); // base: 4 columnas

  @media (max-width: 1199px) {
    grid-template-columns: 1fr 1fr 1fr; // quita una columna
  }

  @media (max-width: 991px) {
    grid-template-columns: 1fr 1fr; // quita otra
  }

  @media (max-width: 575px) {
    grid-template-columns: 1fr; // quita todo
  }
}
```

Ambas producen el mismo resultado visual, pero mobile first genera CSS más predecible y fácil de mantener porque nunca sobrescribes, solo añades.

**Flujo de trabajo mobile first:**

1. Abre las DevTools y ajusta el viewport al ancho de un móvil (375px)
2. Escribe todos los estilos base sin media queries
3. Amplía progresivamente el viewport y añade media queries cuando el diseño lo necesite
4. No añadas un breakpoint hasta que el layout "se rompa" visualmente

---

## 8. Accesibilidad

### 8.1 Por qué importa

Aproximadamente el 15% de la población mundial vive con algún tipo de discapacidad. Las personas ciegas o con baja visión utilizan lectores de pantalla (software que lee el contenido del DOM en voz alta). Las personas con movilidad reducida navegan solo con teclado.

Un botón que solo tiene un icono como contenido (`<button>✕</button>`) es completamente opaco para un lector de pantalla: el software dirá "button" sin ningún contexto.

Además, en muchos países la accesibilidad web es un requisito legal para sitios de administración pública, banca, sanidad y transporte.

### 8.2 WCAG

El WCAG (Web Content Accessibility Guidelines) es el estándar internacional. Define tres niveles de cumplimiento:

| Nivel   | Descripción                                                                | Cuándo se exige                            |
| ------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| **A**   | Requisitos básicos. Sin ellos el contenido es directamente inutilizable    | Siempre                                    |
| **AA**  | Elimina las principales barreras de acceso. Es el estándar de la industria | Proyectos profesionales, clientes públicos |
| **AAA** | Máxima accesibilidad. Difícil de conseguir en todo el contenido            | Proyectos especializados                   |

### 8.3 Checklist básico

**Imágenes:**

```html
<!-- ❌ Sin alt: el lector de pantalla dice "image" -->
<img src="product.jpg" />

<!-- ✅ Alt descriptivo -->
<img src="product.jpg" alt="Zapatillas Nike Air Max en color blanco" />

<!-- ✅ Alt vacío para imágenes decorativas (el lector las ignora) -->
<img src="divider.svg" alt="" />
```

**Botones e interactivos:**

```html
<!-- ❌ Solo icono: no hay nombre accesible -->
<button>✕</button>

<!-- ✅ aria-label describe la acción -->
<button aria-label="Cerrar modal de confirmación">✕</button>

<!-- ✅ Texto visible: ya tiene nombre accesible -->
<button>Cancelar pedido</button>
```

**Estructura semántica:**

```html
<!-- ❌ div sin semántica: invisible para los lectores de pantalla -->
<div class="titulo">Panel de control</div>
<div class="subtitulo">Resumen del mes</div>

<!-- ✅ Headings semánticos: el usuario puede navegar entre ellos -->
<h1>Panel de control</h1>
<h2>Resumen del mes</h2>

<!-- Jerarquía correcta: no saltes de h1 a h3 -->
<!-- ❌ h1 → h3 (salto de nivel) -->
<!-- ✅ h1 → h2 → h3 -->
```
