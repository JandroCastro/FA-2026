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
      "CSS avanzado, SCSS, design tokens y sistemas de diseño escalables.",
    icon: "🎨",
    status: "coming-soon",
    examples: [],
    exercises: [],
  },
];

export function getLabById(id) {
  return LABS.find((lab) => lab.id === id) ?? null;
}
