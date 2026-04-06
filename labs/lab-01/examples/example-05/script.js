import { formatAmount, formatDate, formatType } from "./modules/format.js";

const transactions = [
  { desc: "Nómina abril", amount: 2400, type: "income", date: "2026-04-01" },
  { desc: "Alquiler", amount: 800, type: "expense", date: "2026-04-02" },
  { desc: "Proyecto extra", amount: 600, type: "income", date: "2026-04-03" },
];

const list = document.getElementById("list");

transactions.forEach((t) => {
  const item = document.createElement("div");
  item.classList.add("transaction", `transaction--${t.type}`);

  const desc = document.createElement("span");
  desc.textContent = t.desc;

  const meta = document.createElement("span");
  meta.textContent = `${formatType(t.type)} · ${formatAmount(t.amount)} · ${formatDate(t.date)}`;

  item.appendChild(desc);
  item.appendChild(meta);
  list.appendChild(item);
});
