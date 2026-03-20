import type {
  BreakdownItem,
  MonthlyTrendItem,
  SummaryMetrics,
  Transaction,
  TransactionFilters
} from "../types";

export function applyFilters(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  const merchantQuery = filters.merchant.trim().toLowerCase();

  return transactions.filter((transaction) => {
    if (filters.startDate && transaction.date < filters.startDate) {
      return false;
    }

    if (filters.endDate && transaction.date > filters.endDate) {
      return false;
    }

    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    if (
      merchantQuery &&
      !transaction.merchant.toLowerCase().includes(merchantQuery)
    ) {
      return false;
    }

    if (
      filters.paymentMethod &&
      transaction.paymentMethod !== filters.paymentMethod
    ) {
      return false;
    }

    return true;
  });
}

export function calculateSummary(transactions: Transaction[]): SummaryMetrics {
  return transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expenses += transaction.amount;
      }

      summary.balance = summary.income - summary.expenses;
      return summary;
    },
    { income: 0, expenses: 0, balance: 0 }
  );
}

function groupExpenses(
  transactions: Transaction[],
  accessor: (transaction: Transaction) => string
): BreakdownItem[] {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const total = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
  const map = new Map<string, number>();

  for (const transaction of expenses) {
    const key = accessor(transaction);
    map.set(key, (map.get(key) ?? 0) + transaction.amount);
  }

  return Array.from(map.entries())
    .map(([label, value]) => ({
      label,
      value,
      share: total > 0 ? value / total : 0
    }))
    .sort((left, right) => right.value - left.value);
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  limit = 6
): BreakdownItem[] {
  return groupExpenses(transactions, (transaction) => transaction.category).slice(
    0,
    limit
  );
}

export function getMerchantBreakdown(
  transactions: Transaction[],
  limit = 6
): BreakdownItem[] {
  return groupExpenses(transactions, (transaction) => transaction.merchant).slice(
    0,
    limit
  );
}

export function getMonthlyTrend(transactions: Transaction[]): MonthlyTrendItem[] {
  const map = new Map<string, MonthlyTrendItem>();

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7);
    const current = map.get(month) ?? {
      month,
      income: 0,
      expenses: 0,
      balance: 0
    };

    if (transaction.type === "income") {
      current.income += transaction.amount;
    } else {
      current.expenses += transaction.amount;
    }

    current.balance = current.income - current.expenses;
    map.set(month, current);
  }

  return Array.from(map.values()).sort((left, right) =>
    left.month.localeCompare(right.month)
  );
}

export function getUniqueCategories(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((transaction) => transaction.category))).sort();
}

export function getUniquePaymentMethods(transactions: Transaction[]): string[] {
  return Array.from(
    new Set(transactions.map((transaction) => transaction.paymentMethod))
  ).sort();
}
