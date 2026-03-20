import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { BarChart } from "./components/charts/BarChart";
import { TrendChart } from "./components/charts/TrendChart";
import { allowedCategories } from "./lib/categories";
import { allowedPaymentMethods } from "./lib/paymentMethods";
import {
  applyFilters,
  calculateSummary,
  getCategoryBreakdown,
  getMerchantBreakdown,
  getMonthlyTrend
} from "./lib/analytics";
import { formatCurrency } from "./lib/format";
import { loadTransactions, saveTransactions } from "./lib/storage";
import type { Screen, Transaction, TransactionFilters, TransactionFormValues } from "./types";

const emptyFilters: TransactionFilters = {
  startDate: "",
  endDate: "",
  category: "",
  merchant: "",
  paymentMethod: ""
};

function buildTransactionPayload(form: TransactionFormValues, existingId?: string): Transaction {
  return {
    id: existingId ?? crypto.randomUUID(),
    type: form.type,
    amount: Number(form.amount),
    date: form.date,
    category: form.category.trim(),
    subcategory: form.subcategory.trim(),
    merchant: form.merchant.trim(),
    paymentMethod: form.paymentMethod,
    notes: form.notes.trim()
  };
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const filteredTransactions = useMemo(
    () =>
      applyFilters(
        [...transactions].sort((left, right) => right.date.localeCompare(left.date)),
        filters
      ),
    [transactions, filters]
  );
  const summary = useMemo(
    () => calculateSummary(filteredTransactions),
    [filteredTransactions]
  );
  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(filteredTransactions),
    [filteredTransactions]
  );
  const merchantBreakdown = useMemo(
    () => getMerchantBreakdown(filteredTransactions),
    [filteredTransactions]
  );
  const monthlyTrend = useMemo(
    () => getMonthlyTrend(filteredTransactions),
    [filteredTransactions]
  );
  const categories = useMemo(() => [...allowedCategories], []);
  const paymentMethods = useMemo(() => [...allowedPaymentMethods], []);

  function handleSubmit(form: TransactionFormValues) {
    const payload = buildTransactionPayload(form, editingTransaction?.id);

    setTransactions((current) => {
      if (editingTransaction) {
        return current.map((transaction) =>
          transaction.id === editingTransaction.id ? payload : transaction
        );
      }

      return [payload, ...current];
    });

    setEditingTransaction(null);
    setActiveScreen("transactions");
  }

  function handleDelete(transactionId: string) {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== transactionId)
    );

    if (editingTransaction?.id === transactionId) {
      setEditingTransaction(null);
    }
  }

  const topCategory = categoryBreakdown[0];
  const topMerchant = merchantBreakdown[0];

  return (
    <div className="app-shell">
      <Header activeScreen={activeScreen} onScreenChange={setActiveScreen} />

      <SummaryCards summary={summary} />

      <section className="highlight-grid">
        <article className="highlight-card">
          <p className="eyebrow">Foco de gastos</p>
          <h2>{topCategory?.label ?? "Ainda não há despesas registradas"}</h2>
          <p>
            {topCategory
              ? `${formatCurrency(topCategory.value)} na sua principal categoria`
              : "Adicione despesas para revelar seus padrões de consumo."}
          </p>
        </article>

        <article className="highlight-card alt">
          <p className="eyebrow">Maior concentração</p>
          <h2>{topMerchant?.label ?? "Ainda não há estabelecimentos destacados"}</h2>
          <p>
            {topMerchant
              ? `${formatCurrency(topMerchant.value)} no estabelecimento com maior gasto`
              : "O ranking de estabelecimentos aparecerá aqui."}
          </p>
        </article>
      </section>

      {activeScreen === "dashboard" ? (
        <main className="content-grid">
          <TrendChart data={monthlyTrend} />
          <BarChart title="Gastos por categoria" items={categoryBreakdown} />
          <BarChart title="Gastos por estabelecimento" items={merchantBreakdown} />
        </main>
      ) : null}

      {activeScreen === "transactions" ? (
        <main className="transactions-layout">
          <div className="stack">
            <TransactionForm
              categories={categories}
              initialValue={editingTransaction}
              onSubmit={handleSubmit}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          </div>

          <div className="stack">
            <TransactionList
              transactions={filteredTransactions}
              filters={filters}
              categories={categories}
              paymentMethods={paymentMethods}
              onFiltersChange={setFilters}
              onEdit={(transaction) => {
                setEditingTransaction(transaction);
                setActiveScreen("transactions");
              }}
              onDelete={handleDelete}
            />
          </div>
        </main>
      ) : null}

      {activeScreen === "insights" ? (
        <main className="insights-layout">
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Ranking</p>
                <h2>Onde Gasto Mais</h2>
              </div>
            </div>

            <div className="ranked-grid">
              <div className="ranked-column">
                <h3>Categorias</h3>
                {categoryBreakdown.map((item, index) => (
                  <article key={item.label} className="rank-card">
                    <span className="rank-index">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{Math.round(item.share * 100)}% do total das despesas</p>
                    </div>
                    <span>{formatCurrency(item.value)}</span>
                  </article>
                ))}
              </div>

              <div className="ranked-column">
                <h3>Estabelecimentos</h3>
                {merchantBreakdown.map((item, index) => (
                  <article key={item.label} className="rank-card">
                    <span className="rank-index">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <p>{Math.round(item.share * 100)}% do total das despesas</p>
                    </div>
                    <span>{formatCurrency(item.value)}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      ) : null}
    </div>
  );
}
