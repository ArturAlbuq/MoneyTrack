import { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatShortDate } from "../lib/format";
import type { Transaction, TransactionFilters } from "../types";
import { TransactionFilters as TransactionFiltersPanel } from "./TransactionFilters";

interface TransactionListProps {
  transactions: Transaction[];
  filters: TransactionFilters;
  categories: string[];
  paymentMethods: string[];
  onFiltersChange: (filters: TransactionFilters) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const pageSizeOptions = [5, 10, 20, 50];

export function TransactionList({
  transactions,
  filters,
  categories,
  paymentMethods,
  onFiltersChange,
  onEdit,
  onDelete
}: TransactionListProps) {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return transactions.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, transactions]);

  return (
    <section className="panel history-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Histórico</p>
          <h2>Lançamentos</h2>
        </div>
        <span className="pill">{transactions.length} itens</span>
      </div>

      <TransactionFiltersPanel
        embedded
        filters={filters}
        categories={categories}
        paymentMethods={paymentMethods}
        onChange={onFiltersChange}
      />

      <div className="transaction-list">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum lançamento encontrado com esses filtros.</h3>
            <p>Ajuste os filtros ou crie um novo lançamento para ver resultados aqui.</p>
          </div>
        ) : null}

        {paginatedTransactions.map((transaction) => (
          <article key={transaction.id} className="transaction-item">
            <div className="transaction-main">
              <div className="transaction-topline">
                <strong>{transaction.merchant}</strong>
                <span
                  className={
                    transaction.type === "income" ? "amount income" : "amount expense"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>

              <p className="transaction-meta">
                {transaction.category} · {transaction.subcategory}
              </p>

              <p className="transaction-meta">
                {formatShortDate(transaction.date)} · {transaction.paymentMethod}
              </p>

              {transaction.notes ? (
                <p className="transaction-notes">{transaction.notes}</p>
              ) : null}
            </div>

            <div className="transaction-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => onEdit(transaction)}
              >
                Editar
              </button>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => onDelete(transaction.id)}
              >
                Excluir
              </button>
            </div>
          </article>
        ))}

        {transactions.length > 0 ? (
          <div className="pagination-shell">
            <label className="pagination-page-size">
              <span>Itens por página</span>
              <select
                value={String(itemsPerPage)}
                onChange={(event) => {
                  setItemsPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="pagination-controls" aria-label="Paginação de lançamentos">
              <button
                type="button"
                className="ghost-button pagination-button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              <span className="pagination-indicator">
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                className="ghost-button pagination-button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
