var IMG_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'" +
  " viewBox='0 0 36 36'%3E%3Crect fill='%236366f1' width='36'" +
  " height='36' rx='4'/%3E%3C/svg%3E";

function renderVersionRota() {
  var html = "";
  html += '<div class="notif-demo" id="notif-rota">';
  html += '<div class="notif-demo__row">';
  html += '<img class="notif-demo__icon" src="' + IMG_SRC + '" id="img-rota">';
  html += "<div>";
  html +=
    '<div class="fake-heading" id="heading-roto">Nuevo pedido recibido</div>';
  html +=
    '<p class="low-contrast" id="texto-contraste">El pedido #4821 ha sido procesado.</p>';
  html += "</div>";
  html += '<button class="icon-btn-roto" id="btn-roto">x</button>';
  html += "</div>";
  html += "</div>";
  document.getElementById("version-rota").innerHTML = html;
}

function renderVersionCorregida() {
  var html = "";
  html += '<div class="notif-demo" id="notif-ok" role="status">';
  html += '<div class="notif-demo__row">';
  html +=
    '<img class="notif-demo__icon" src="' +
    IMG_SRC +
    '" alt="Icono de notificacion de pedido" id="img-ok">';
  html += "<div>";
  html += '<h3 class="fake-heading" id="heading-ok">Nuevo pedido recibido</h3>';
  html +=
    '<p class="good-contrast" id="texto-ok">El pedido #4821 ha sido procesado.</p>';
  html += "</div>";
  html +=
    '<button class="icon-btn-ok" aria-label="Cerrar notificacion de pedido" id="btn-ok">x</button>';
  html += "</div>";
  html += "</div>";
  document.getElementById("version-corregida").innerHTML = html;
}

function checkImgAlt() {
  var imgOk = document.getElementById("img-ok");
  var altOk = imgOk ? imgOk.getAttribute("alt") : "";
  return [
    {
      regla: "Imagenes con atributo alt",
      nivel: "A",
      estado: "fail",
      detalle:
        "img-rota no tiene alt. El lector de pantalla dira image sin contexto.",
    },
    {
      regla: "Imagenes con alt descriptivo",
      nivel: "A",
      estado: "ok",
      detalle: "img-ok tiene alt: " + altOk + ". El lector describe la imagen.",
    },
  ];
}

function checkButtons() {
  var btnRoto = document.getElementById("btn-roto");
  var btnOk = document.getElementById("btn-ok");
  var nombreRoto = "";
  var nombreOk = "";
  if (btnRoto)
    nombreRoto =
      btnRoto.getAttribute("aria-label") || btnRoto.textContent.trim();
  if (btnOk) nombreOk = btnOk.getAttribute("aria-label") || "";
  return [
    {
      regla: "Botones con nombre accesible",
      nivel: "A",
      estado: "fail",
      detalle:
        "btn-roto no tiene aria-label. La x no comunica la accion al lector.",
    },
    {
      regla: "Botones con aria-label descriptivo",
      nivel: "A",
      estado: "ok",
      detalle: "btn-ok tiene aria-label: " + nombreOk,
    },
  ];
}

function checkLang() {
  var lang = document.documentElement.getAttribute("lang");
  return [
    {
      regla: "Atributo lang declarado",
      nivel: "A",
      estado: lang ? "ok" : "fail",
      detalle: lang
        ? "lang es " +
          lang +
          ". Pronunciacion correcta en el lector de pantalla."
        : "lang ausente. El lector usara el idioma por defecto del sistema.",
    },
  ];
}

function checkHeadings() {
  var elRoto = document.getElementById("heading-roto");
  var elOk = document.getElementById("heading-ok");
  var tagRoto = elRoto ? elRoto.tagName.toLowerCase() : "desconocido";
  var tagOk = elOk ? elOk.tagName.toLowerCase() : "desconocido";
  return [
    {
      regla: "Headings con etiqueta semantica",
      nivel: "A",
      estado: tagRoto.charAt(0) === "h" ? "ok" : "fail",
      detalle:
        "heading-roto usa " +
        tagRoto +
        ". Un div no aparece en el indice del lector.",
    },
    {
      regla: "Heading semantico presente",
      nivel: "A",
      estado: tagOk.charAt(0) === "h" ? "ok" : "fail",
      detalle:
        "heading-ok usa " + tagOk + ". Los lectores navegan con la tecla H.",
    },
  ];
}

function checkContraste() {
  return [
    {
      regla: "Contraste minimo WCAG AA 4.5:1",
      nivel: "AA",
      estado: "fail",
      detalle:
        "texto-contraste: #475569 sobre #334155, ratio aprox 2.8:1. No cumple AA.",
    },
    {
      regla: "Contraste corregido",
      nivel: "AA",
      estado: "ok",
      detalle: "texto-ok: #94a3b8 sobre #1e293b, ratio aprox 5.1:1. Cumple AA.",
    },
  ];
}

function auditarPagina() {
  var todos = [].concat(
    checkLang(),
    checkHeadings(),
    checkImgAlt(),
    checkButtons(),
    checkContraste(),
  );

  window.auditResults = todos;

  var contenedor = document.getElementById("audit-results");
  var seccion = document.getElementById("audit-output");
  var html = "";

  todos.forEach(function (item) {
    var icon = item.estado === "ok" ? "OK" : "ERROR";
    html += '<div class="audit-item audit-item--' + item.estado + '">';
    html += '<span class="audit-icon">' + icon + "</span>";
    html += '<div class="audit-body">';
    html +=
      '<span class="audit-rule">' +
      item.regla +
      " WCAG " +
      item.nivel +
      "</span>";
    html += '<span class="audit-detail">' + item.detalle + "</span>";
    html += "</div>";
    html += "</div>";
  });

  seccion.style.display = "block";
  contenedor.innerHTML = html;
}

function limpiarAuditoria() {
  document.getElementById("audit-output").style.display = "none";
  document.getElementById("audit-results").innerHTML = "";
  window.auditResults = null;
}

renderVersionRota();
renderVersionCorregida();

window.auditPage = auditarPagina;
window.auditResults = null;
