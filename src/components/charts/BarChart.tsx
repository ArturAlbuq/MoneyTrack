import { formatCurrency } from "../../lib/format";
import type { BreakdownItem } from "../../types";

interface BarChartProps {
  title: string;
  items: BreakdownItem[];
}

export function BarChart({ title, items }: BarChartProps) {
  const maxValue = items[0]?.value ?? 0;

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Distribuicao</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="bars">
        {items.map((item) => {
          const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div key={item.label} className="bar-row">
              <div className="bar-copy">
                <strong>{item.label}</strong>
                <span>{formatCurrency(item.value)}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${width}%` }} />
              </div>
              <small>{Math.round(item.share * 100)}%</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
