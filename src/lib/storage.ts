import { demoTransactions } from "../data/demoData";
import { normalizeCategory } from "./categories";
import { normalizePaymentMethod } from "./paymentMethods";
import type { Transaction } from "../types";

const STORAGE_KEY = "moneytrack.transactions.v1";

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

function normalizeTransaction(transaction: Transaction): Transaction {
  return {
    ...transaction,
    category: normalizeCategory(categoryMap[transaction.category] ?? transaction.category),
    subcategory: subcategoryMap[transaction.subcategory] ?? transaction.subcategory,
    paymentMethod: normalizePaymentMethod(transaction.paymentMethod),
    notes: notesMap[transaction.notes] ?? transaction.notes
  };
}

function normalizedSeed(): Transaction[] {
  return demoTransactions.map(normalizeTransaction);
}

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") {
    return normalizedSeed();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seeded = normalizedSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as Transaction[];
    const normalized = parsed.map(normalizeTransaction);

    if (normalized.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }

    return normalizedSeed();
  } catch {
    const seeded = normalizedSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions.map(normalizeTransaction))
  );
}
