import { router } from "./router.js";
import { Navbar } from "./components/Navbar.js";
import { Sidebar } from "./components/Sidebar.js";
import { renderHome } from "./pages/HomePage.js";
import { renderLab } from "./pages/LabPage.js";
import { renderViewer } from "./pages/ViewerPage.js";

const navbar = new Navbar(document.getElementById("navbar"));
const sidebar = new Sidebar(document.getElementById("sidebar"));
const main = document.getElementById("main-content");

navbar.render();
sidebar.render();

router
  .on("/", () => {
    sidebar.setActive(null);
    renderHome(main);
  })
  .on("/labs/:labId", ({ labId }) => {
    sidebar.setActive(labId);
    renderLab(main, labId);
  })
  .on("/labs/:labId/examples/:exId", ({ labId, exId }) => {
    sidebar.setActive(labId);
    renderViewer(main, `labs/${labId}/examples/${exId}/index.html`, {
      labId,
      type: "examples",
      itemId: exId,
    });
  })
  .on("/labs/:labId/exercises/:exId", ({ labId, exId }) => {
    sidebar.setActive(labId);
    renderViewer(main, `labs/${labId}/exercises/${exId}/index.html`, {
      labId,
      type: "exercises",
      itemId: exId,
    });
  })
  .onNotFound(() => {
    sidebar.setActive(null);
    main.innerHTML = `
    <div class="page">
      <div class="not-found">
        <h2>404</h2>
        <p style="color:var(--clr-text-muted)">${window.location.hash}</p>
        <a href="#/" class="btn btn--secondary">← Inicio</a>
      </div>
    </div>
  `;
  });

router.start();
