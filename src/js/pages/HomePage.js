import { LABS } from "../data/labs.js";

export function renderHome(container) {
  container.innerHTML = `
  <div class="page page--home">
    <header class="page__header">
      <h1 class="page__title">Frontend Avanzado</h1>
      <p class="page__subtitle">8 labs · Del JavaScript avanzado a los microfrontales.</p>
    </header>
    <section class="labs-grid">
      ${LABS.map(renderCard).join("")}
    </section>
  </div>
`;
}

function renderCard(lab) {
  const available = lab.status === "available";
  return `
  <article class="lab-card ${available ? "" : "lab-card--disabled"}">
    <div class="lab-card__header">
      <span class="lab-card__icon">${lab.icon}</span>
      <span class="lab-card__num">Lab ${lab.number}</span>
      ${!available ? '<span class="lab-card__badge">Próximamente</span>' : ""}
    </div>
    <div class="lab-card__body">
      <h2 class="lab-card__title">${lab.title}</h2>
      <p class="lab-card__desc">${lab.description}</p>
      <ul class="lab-card__topics">
        ${lab.topics.map((t) => `<li>${t}</li>`).join("")}
      </ul>
    </div>
    <div class="lab-card__footer">
      ${
        available
          ? `<a href="#/labs/${lab.id}" class="btn btn--primary">Ver Lab →</a>`
          : `<span class="btn btn--disabled">Disponible pronto</span>`
      }
      <span class="lab-card__stats">
        ${lab.examples.length} ejemplos 
      </span>
    </div>
  </article>
`;
}
