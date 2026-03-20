import { formatCurrency } from "../lib/format";
import type { SummaryMetrics } from "../types";

interface SummaryCardsProps {
  summary: SummaryMetrics;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const items = [
    { label: "Receitas", value: summary.income, tone: "positive" },
    { label: "Despesas", value: summary.expenses, tone: "negative" },
    { label: "Saldo", value: summary.balance, tone: "neutral" }
  ];

  return (
    <section className="summary-grid">
      {items.map((item) => (
        <article key={item.label} className={`summary-card ${item.tone}`}>
          <span>{item.label}</span>
          <strong>{formatCurrency(item.value)}</strong>
        </article>
      ))}
    </section>
  );
}
