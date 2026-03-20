import { demoTransactions } from "../data/demoData";
import type {
  Account,
  AppData,
  Goal,
  PaymentMethod,
  Transaction,
  UserPreferences
} from "../types";
import { allowedCategories, normalizeCategory } from "./categories";
import { parseCurrencyInput } from "./format";
import { allowedPaymentMethods, normalizePaymentMethod } from "./paymentMethods";
import {
  getPersistedDataSchemaVersion,
  loadPersistedData,
  savePersistedData
} from "./persistedData";

export const APP_DATA_SCHEMA_VERSION = getPersistedDataSchemaVersion();

const categoryMap: Record<string, string> = {
  Salary: "Salário",
  Housing: "Compras",
  Groceries: "Alimentação",
  Transport: "Transporte",
  Dining: "Alimentação",
  Subscriptions: "Assinaturas",
  Freelance: "Salário",
  Shopping: "Compras",
  Health: "Saúde",
  Travel: "Transporte",
  Fitness: "Saúde",
  Bonus: "Salário"
};

const subcategoryMap: Record<string, string> = {
  "Primary Job": "Emprego Principal",
  Rent: "Aluguel",
  "Weekly Stock-up": "Compras da Semana",
  Fuel: "Combustível",
  Dinner: "Jantar",
  Streaming: "Streaming",
  "Design Retainer": "Projeto de Design",
  "Home Office": "Home Office",
  Pharmacy: "Farmácia",
  "Weekend Brunch": "Brunch de Fim de Semana",
  "Bus + Hotel": "Ônibus + Hotel",
  "UX Audit": "Auditoria de UX",
  Productivity: "Produtividade",
  "Bulk Buy": "Compra do Mês",
  Gym: "Academia",
  "Ride Share": "Carro por App",
  Lunch: "Almoço",
  "Quarterly Bonus": "Bônus Trimestral",
  Clothing: "Roupas"
};

const notesMap: Record<string, string> = {
  "Monthly salary deposit": "Depósito mensal do salário",
  "Apartment rent": "Pagamento do aluguel",
  "Household groceries": "Compras do lar",
  "Fuel refill": "Abastecimento",
  "Dinner with friends": "Jantar com amigos",
  "Monthly streaming bundle": "Pacote mensal de streaming",
  "Brand design project": "Projeto de identidade visual",
  "Desk accessories": "Acessórios para o escritório",
  "Groceries and essentials": "Compras e itens essenciais",
  "Medicines and vitamins": "Medicamentos e vitaminas",
  "Brunch and coffee": "Brunch e café",
  "Weekend trip": "Viagem de fim de semana",
  "Freelance consulting": "Consultoria freelance",
  "Annual subscription split monthly": "Assinatura anual rateada por mês",
  "Groceries for the month": "Compras do mês",
  "Monthly membership": "Mensalidade",
  "Airport rides": "Corridas para o aeroporto",
  "Client lunch": "Almoço com cliente",
  "Quarterly performance bonus": "Bônus trimestral por desempenho",
  "Work clothes refresh": "Renovação do guarda-roupa de trabalho"
};

const defaultPreferences: UserPreferences = {
  currency: "BRL",
  locale: "pt-BR",
  theme: "dark"
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, "pt-BR")
  );
}

function normalizeTransaction(transaction: Transaction): Transaction {
  const numericAmount =
    typeof transaction.amount === "number"
      ? transaction.amount
      : parseCurrencyInput(String(transaction.amount));

  return {
    ...transaction,
    id: transaction.id || crypto.randomUUID(),
    amount: Number.isFinite(numericAmount) ? numericAmount : 0,
    category: normalizeCategory(categoryMap[transaction.category] ?? transaction.category),
    subcategory: (subcategoryMap[transaction.subcategory] ?? transaction.subcategory).trim(),
    merchant: transaction.merchant.trim(),
    paymentMethod: normalizePaymentMethod(transaction.paymentMethod),
    notes: (notesMap[transaction.notes] ?? transaction.notes).trim()
  };
}

function normalizeAccounts(accounts: Account[]): Account[] {
  return accounts
    .filter((account) => account?.name?.trim())
    .map((account) => ({
      id: account.id || crypto.randomUUID(),
      name: account.name.trim(),
      type: account.type ?? "other"
    }));
}

function normalizeGoals(goals: Goal[]): Goal[] {
  return goals
    .filter((goal) => goal?.name?.trim())
    .map((goal) => ({
      id: goal.id || crypto.randomUUID(),
      name: goal.name.trim(),
      targetAmount: Number(goal.targetAmount) || 0,
      currentAmount: Number(goal.currentAmount) || 0,
      dueDate: goal.dueDate?.trim() || undefined
    }));
}

function normalizePreferences(preferences?: Partial<UserPreferences>): UserPreferences {
  return {
    currency:
      typeof preferences?.currency === "string" && preferences.currency.trim()
        ? preferences.currency.trim()
        : defaultPreferences.currency,
    locale:
      typeof preferences?.locale === "string" && preferences.locale.trim()
        ? preferences.locale.trim()
        : defaultPreferences.locale,
    theme: "dark"
  };
}

function inferCategories(transactions: Transaction[], categories: string[]): string[] {
  return dedupeStrings([
    ...allowedCategories,
    ...categories,
    ...transactions.map((transaction) => transaction.category)
  ]);
}

function inferPaymentMethods(
  transactions: Transaction[],
  paymentMethods: PaymentMethod[]
): PaymentMethod[] {
  const normalized = [
    ...allowedPaymentMethods,
    ...paymentMethods,
    ...transactions.map((transaction) => transaction.paymentMethod)
  ].map((paymentMethod) => normalizePaymentMethod(paymentMethod));

  return [...new Set(normalized)];
}

function normalizedSeed(): AppData {
  const transactions = demoTransactions.map(normalizeTransaction);

  return {
    transactions,
    categories: inferCategories(transactions, [...allowedCategories]),
    accounts: [],
    paymentMethods: inferPaymentMethods(transactions, [...allowedPaymentMethods]),
    goals: [],
    preferences: defaultPreferences,
    schemaVersion: APP_DATA_SCHEMA_VERSION,
    updatedAt: new Date().toISOString()
  };
}

export function normalizeAppData(input: Partial<AppData>): AppData {
  const transactions = Array.isArray(input.transactions)
    ? input.transactions.map(normalizeTransaction)
    : [];
  const categories = inferCategories(
    transactions,
    Array.isArray(input.categories)
      ? input.categories.filter((category): category is string => typeof category === "string")
      : []
  );
  const paymentMethods = inferPaymentMethods(
    transactions,
    Array.isArray(input.paymentMethods)
      ? input.paymentMethods.filter(
          (paymentMethod): paymentMethod is PaymentMethod => typeof paymentMethod === "string"
        )
      : []
  );

  return {
    transactions,
    categories,
    accounts: normalizeAccounts(Array.isArray(input.accounts) ? input.accounts : []),
    paymentMethods,
    goals: normalizeGoals(Array.isArray(input.goals) ? input.goals : []),
    preferences: normalizePreferences(input.preferences),
    schemaVersion: APP_DATA_SCHEMA_VERSION,
    updatedAt:
      typeof input.updatedAt === "string" && input.updatedAt.trim()
        ? input.updatedAt
        : new Date().toISOString()
  };
}

export function loadAppData(): AppData {
  return loadPersistedData(normalizeAppData, normalizedSeed);
}

export function saveAppData(data: AppData): boolean {
  const normalized = normalizeAppData({
    ...data,
    updatedAt: new Date().toISOString()
  });

  return savePersistedData(normalized);
}

export function clearAppData(): AppData {
  const cleared = normalizeAppData({
    ...normalizedSeed(),
    transactions: [],
    categories: [...allowedCategories],
    paymentMethods: [...allowedPaymentMethods],
    accounts: [],
    goals: []
  });

  saveAppData(cleared);
  return cleared;
}

export function isAppDataLike(value: unknown): value is Partial<AppData> {
  return isObject(value);
}
