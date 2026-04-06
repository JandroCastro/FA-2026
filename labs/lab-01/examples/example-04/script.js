class NotificationBadge {
  constructor() {
    this.count = 0;
    this.display = document.getElementById("badge-count");
  }

  increment() {
    this.count++;
    this.display.textContent = this.count;
  }
}

const badge = new NotificationBadge();

// ❌ Bug: al pasar el método como referencia, this deja de ser badge
document.getElementById("btn-bug").addEventListener("click", badge.increment);

// ✅ Fix: la arrow function mantiene this del scope exterior
document
  .getElementById("btn-fix")
  .addEventListener("click", () => badge.increment());
