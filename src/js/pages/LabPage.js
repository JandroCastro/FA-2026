import { getLabById } from "../data/labs.js";

export function renderLab(container, labId) {
  const lab = getLabById(labId);

  if (!lab) {
    container.innerHTML = renderError(labId);
    return;
  }
  if (lab.status === "coming-soon") {
    container.innerHTML = renderComingSoon(lab);
    return;
  }

  container.innerHTML = `
  <div class="page page--lab">
    <header class="page__header">
      <a href="#/" class="page__back">← Todos los labs</a>
      <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-3)">
        <span style="font-size:2.5rem">${lab.icon}</span>
        <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--clr-text-muted)">
          Lab ${lab.number}
        </span>
      </div>
      <h1 class="page__title">${lab.title}</h1>
      <p class="page__subtitle">${lab.description}</p>
      <div class="topics-list">
        ${lab.topics.map((t) => `<span class="topic-tag">${t}</span>`).join("")}
      </div>
    </header>
    ${lab.examples.length ? renderList(lab, "examples", "📖 Ejemplos") : ""}
  </div>
`;
}

function renderList(lab, type, heading) {
  return `
  <section class="content-section">
    <h2 class="content-section__title">${heading}</h2>
    <div class="items-grid">
      ${lab[type]
        .map(
          (item, i) => `
        <a href="#/labs/${lab.id}/${type}/${item.id}"
           class="item-card item-card--${type === "examples" ? "example" : "exercise"}">
          <span class="item-card__number">${String(i + 1).padStart(2, "0")}</span>
          <span class="item-card__title">${item.title}</span>
          <span class="item-card__arrow">→</span>
        </a>
      `,
        )
        .join("")}
    </div>
  </section>
`;
}

function renderComingSoon(lab) {
  return `
  <div class="page">
    <div class="coming-soon">
      <span class="coming-soon__icon">${lab.icon}</span>
      <h2>Lab ${lab.number} · ${lab.title}</h2>
      <p style="color:var(--clr-text-muted)">Disponible próximamente.</p>
      <div class="topics-preview">
        <p>Temas:</p>
        <ul>${lab.topics.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>
      <a href="#/" class="btn btn--secondary">← Volver al inicio</a>
    </div>
  </div>
`;
}

function renderError(labId) {
  return `
  <div class="page">
    <div class="not-found">
      <h2>Lab no encontrado</h2>
      <p style="color:var(--clr-text-muted)">${labId}</p>
      <a href="#/" class="btn btn--secondary">← Volver al inicio</a>
    </div>
  </div>
`;
}
