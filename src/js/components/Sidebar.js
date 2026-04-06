import { LABS } from "../data/labs.js";

export class Sidebar {
  #container;
  #activeId = null;

  constructor(container) {
    this.#container = container;
  }

  render() {
    this.#container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar__header">
        <span class="sidebar__heading">Módulo · 8 Labs</span>
      </div>
      <ul class="sidebar__nav">
        <li>
          <a href="#/" class="sidebar__link sidebar__link--home
            ${this.#activeId === null ? "sidebar__link--active" : ""}">
            🏠 Todos los labs
          </a>
        </li>
        ${LABS.map((lab) => this.#renderItem(lab)).join("")}
      </ul>
      <div class="sidebar__footer">v1.0 · 2026</div>
    </aside>
  `;
    this.#container.querySelectorAll(".sidebar__link").forEach((link) => {
      link.addEventListener("click", () => {
        this.#container.classList.remove("sidebar--open");
      });
    });
  }

  setActive(labId) {
    this.#activeId = labId;
    this.render();
  }

  #renderItem(lab) {
    const isActive = this.#activeId === lab.id;
    const isAvailable = lab.status === "available";
    const linkClass = [
      "sidebar__link",
      isActive ? "sidebar__link--active" : "",
      !isAvailable ? "sidebar__link--disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const content = `
    <span class="sidebar__lab-num">${lab.number}</span>
    <span class="sidebar__lab-title">${lab.title}</span>
    ${!isAvailable ? '<span class="sidebar__badge">Próximo</span>' : ""}
  `;

    return `<li>${
      isAvailable
        ? `<a href="#/labs/${lab.id}" class="${linkClass}">${content}</a>`
        : `<span class="${linkClass}">${content}</span>`
    }</li>`;
  }
}
