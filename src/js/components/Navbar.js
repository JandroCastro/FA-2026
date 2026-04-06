export class Navbar {
  #container;

  constructor(container) {
    this.#container = container;
  }

  render() {
    this.#container.innerHTML = `
    <nav class="navbar">
      <div class="navbar__brand">
        <button class="navbar__toggle" id="sidebar-toggle" aria-label="Abrir menú">
          <span></span><span></span><span></span>
        </button>
        <a href="#/" class="navbar__logo">
          <span>🎓</span>
          <span>Frontend <strong>Avanzado</strong></span>
        </a>
      </div>
      <span class="navbar__badge">Bootcamp 2026</span>
    </nav>
  `;
    document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
      document.getElementById("sidebar")?.classList.toggle("sidebar--open");
    });
  }
}
