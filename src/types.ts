export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "Cartão de Crédito"
  | "Cartão de Débito"
  | "Dinheiro"
  | "Pix"
  | "Carteira";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  subcategory: string;
  merchant: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface TransactionFormValues {
  type: TransactionType;
  amount: string;
  date: string;
  category: string;
  subcategory: string;
  merchant: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface TransactionFilters {
  startDate: string;
  endDate: string;
  category: string;
  merchant: string;
  paymentMethod: string;
}

export interface SummaryMetrics {
  income: number;
  expenses: number;
  balance: number;
}

export interface BreakdownItem {
  label: string;
  value: number;
  share: number;
}

export interface MonthlyTrendItem {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment" | "other";
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string;
}

export interface UserPreferences {
  currency: string;
  locale: string;
  theme: "dark";
}

export interface AppData {
  transactions: Transaction[];
  categories: string[];
  accounts: Account[];
  paymentMethods: PaymentMethod[];
  goals: Goal[];
  preferences: UserPreferences;
  schemaVersion: number;
  updatedAt: string;
}

export interface BackupData {
  transactions: Transaction[];
  categories: string[];
  accounts: Account[];
  paymentMethods: PaymentMethod[];
  goals: Goal[];
  preferences: UserPreferences;
  schemaVersion: number;
  exportedAt: string;
}

export type ImportMode = "replace" | "merge";

export type Screen = "dashboard" | "transactions" | "insights" | "settings";
