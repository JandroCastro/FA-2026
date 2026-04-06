import { getLabById } from "../data/labs.js";

export function renderViewer(container, src, { labId, type, itemId }) {
  const lab = getLabById(labId);
  const items = type === "examples" ? lab?.examples : lab?.exercises;
  const item = items?.find((i) => i.id === itemId);

  container.innerHTML = `
  <div class="page--viewer">
    <header class="viewer__header">
      <a href="#/labs/${labId}" class="viewer__back">← ${lab?.title ?? labId}</a>
      <div class="viewer__meta">
        <span class="viewer__type">${type === "examples" ? "Ejemplo" : "Ejercicio"}</span>
        <h1 class="viewer__title">${item?.title ?? itemId}</h1>
      </div>
      <a href="${src}" target="_blank" class="btn btn--secondary" style="font-size:var(--text-xs)">
        Abrir en nueva pestaña ↗
      </a>
    </header>
    <div class="viewer__frame-wrapper">
      <iframe src="${src}" class="viewer__frame" title="${item?.title ?? itemId}"></iframe>
    </div>
  </div>
`;
}
