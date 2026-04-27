export const LABS = [
  {
    id: "lab-01",
    number: "01",
    title: "JavaScript Avanzado I",
    description:
      "Event Loop, asincronía, closures, this y módulos. La base para entender cómo JavaScript realmente ejecuta tu código.",
    icon: "⚙️",
    topics: [
      "Event Loop",
      "Callbacks",
      "Promises",
      "Async/Await",
      "Closures",
      "This",
      "Módulos ESM",
    ],
    status: "available",
    examples: [
      { id: "example-01", title: "Single-thread y Event Loop" },
      { id: "example-02", title: "De callbacks a async/await" },
      { id: "example-03", title: "Closures y estado privado" },
      { id: "example-04", title: "This y gestión de errores" },
      { id: "example-05", title: "Módulos ESM en la práctica" },
    ],
    exercises: [
      { id: "exercise-01", title: "Blog tecnológico — fetch y async/await" },
    ],
  },
  {
    id: "lab-02",
    number: "02",
    title: "JavaScript Avanzado II",
    description:
      "Prototipos, clases y herencia: cómo JavaScript organiza los objetos bajo el capó. Gestión de memoria, npm y las herramientas del ecosistema moderno.",
    icon: "🔬",
    topics: [
      "Prototype chain",
      "Funciones constructoras",
      "Clases ES6",
      "Herencia",
      "Memory leaks",
      "npm",
      "Babel",
      "RxJS",
    ],
    status: "available",
    examples: [
      { id: "example-01", title: "La cadena de prototipos" },
      { id: "example-02", title: "De funciones constructoras a clases" },
      { id: "example-03", title: "Herencia con extends y super" },
      { id: "example-04", title: "Memory leaks y limpieza" },
    ],
    exercises: [],
  },
  {
    id: "lab-03",
    number: "03",
    title: "Maquetación y Preprocesadores",
    description:
      "SCSS, design tokens y responsive design. Variables, nesting, mixins, " +
      "mobile first y accesibilidad: las herramientas que hacen el CSS escalable e inclusivo.",
    icon: "🎨",
    topics: [
      "SCSS / Preprocesadores",
      "Variables y design tokens",
      "Nesting",
      "Mixins",
      "Responsive design",
      "Mobile first",
      "Media queries",
      "Accesibilidad WCAG",
    ],
    status: "available",
    examples: [
      { id: "example-01", title: "Variables SCSS y design tokens" },
      { id: "example-02", title: "Nesting: estructura visual vs CSS plano" },
      { id: "example-03", title: "Mixins: código que se expande" },
      { id: "example-04", title: "Mobile first y breakpoints" },
      { id: "example-05", title: "Accesibilidad: lo que el DOM no dice" },
    ],
    exercises: [],
  },
  {
    id: "lab-04",
    number: "04",
    title: "Web Components",
    description:
      "Custom Elements, Shadow DOM y HTML Templates. Las tres APIs nativas " +
      "para crear componentes reutilizables, encapsulados y themables " +
      "sin ningún framework.",
    icon: "🧩",
    topics: [
      "Custom Elements",
      "customElements API",
      "Ciclo de vida",
      "Shadow DOM",
      "Light DOM",
      "HTML Templates",
      "Slots",
      "CSS Custom Properties",
      "Theming",
    ],
    status: "available",
    examples: [
      {
        id: "example-01",
        title: "customElements.define(): el primer componente",
      },
      { id: "example-02", title: "Ciclo de vida de un custom element" },
      { id: "example-03", title: "template y slot" },
      { id: "example-04", title: "Shadow DOM: la barrera de estilos" },
      { id: "example-05", title: "El web component completo" },
      { id: "example-06", title: "CSS Custom Properties como API de theming" },
    ],
    exercises: [],
  },
];

export function getLabById(id) {
  return LABS.find((lab) => lab.id === id) ?? null;
}
