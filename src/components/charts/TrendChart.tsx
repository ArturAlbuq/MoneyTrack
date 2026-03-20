import { formatCurrency, formatMonthLabel } from "../../lib/format";
import type { MonthlyTrendItem } from "../../types";

interface TrendChartProps {
  data: MonthlyTrendItem[];
}

export function TrendChart({ data }: TrendChartProps) {
  const width = 480;
  const height = 220;
  const padding = 20;
  const maxValue = Math.max(...data.flatMap((item) => [item.income, item.expenses]), 1);

  const incomePoints = data.map((item, index) => {
    const x =
      padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - (item.income / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  const expensePoints = data.map((item, index) => {
    const x =
      padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y =
      height - padding - (item.expenses / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Evolução</p>
          <h2>Tendência mensal</h2>
        </div>
      </div>

      <div className="trend-shell">
        <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart" role="img">
          <defs>
            <linearGradient id="income-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(82, 214, 155, 0.85)" />
              <stop offset="100%" stopColor="rgba(82, 214, 155, 0.08)" />
            </linearGradient>
          </defs>

          <polyline
            fill="none"
            stroke="#52d69b"
            strokeWidth="4"
            points={incomePoints.join(" ")}
          />
          <polyline
            fill="none"
            stroke="#f7b955"
            strokeWidth="4"
            points={expensePoints.join(" ")}
          />

          {data.map((item, index) => {
            const x =
              padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
            const incomeY =
              height - padding - (item.income / maxValue) * (height - padding * 2);
            const expenseY =
              height - padding - (item.expenses / maxValue) * (height - padding * 2);

            return (
              <g key={item.month}>
                <circle cx={x} cy={incomeY} r="5" fill="#52d69b" />
                <circle cx={x} cy={expenseY} r="5" fill="#f7b955" />
              </g>
            );
          })}
        </svg>

        <div className="trend-legend">
          <span>
            <i className="dot income" />
            Receitas
          </span>
          <span>
            <i className="dot expense" />
            Despesas
          </span>
        </div>

        <div className="trend-footer">
          {data.map((item) => (
            <div key={item.month} className="trend-footer-item">
              <strong>{formatMonthLabel(item.month)}</strong>
              <span>{formatCurrency(item.balance)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
