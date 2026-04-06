export function formatAmount(amount) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat("es-ES").format(new Date(dateStr));
}

export function formatType(type) {
  return type === "income" ? "↑ Ingreso" : "↓ Gasto";
}
