import { APP_DATA_SCHEMA_VERSION, isAppDataLike, normalizeAppData } from "./appData";
import type { AppData, BackupData, ImportMode, Transaction } from "../types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function escapeCsvCell(value: string | number): string {
  const stringValue = String(value ?? "");
  const escaped = stringValue.replaceAll('"', '""');
  return `"${escaped}"`;
}

function transactionFingerprint(transaction: Transaction): string {
  return [
    transaction.type,
    transaction.amount.toFixed(2),
    transaction.date,
    transaction.category.trim().toLowerCase(),
    transaction.subcategory.trim().toLowerCase(),
    transaction.merchant.trim().toLowerCase(),
    transaction.paymentMethod.trim().toLowerCase(),
    transaction.notes.trim().toLowerCase()
  ].join("|");
}

function mergeTransactions(current: Transaction[], imported: Transaction[]): Transaction[] {
  const seenIds = new Set<string>();
  const seenFingerprints = new Set<string>();
  const merged: Transaction[] = [];

  for (const transaction of [...current, ...imported]) {
    const fingerprint = transactionFingerprint(transaction);

    if (transaction.id && seenIds.has(transaction.id)) {
      continue;
    }

    if (seenFingerprints.has(fingerprint)) {
      continue;
    }

    if (transaction.id) {
      seenIds.add(transaction.id);
    }

    seenFingerprints.add(fingerprint);
    merged.push(transaction);
  }

  return merged;
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function serializeBackup(data: AppData): BackupData {
  const normalized = normalizeAppData(data);

  return {
    transactions: normalized.transactions,
    categories: normalized.categories,
    accounts: normalized.accounts,
    paymentMethods: normalized.paymentMethods,
    goals: normalized.goals,
    preferences: normalized.preferences,
    schemaVersion: APP_DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString()
  };
}

export function buildBackupFilename(date = new Date()): string {
  const isoDate = date.toISOString().slice(0, 10);
  return `backup-financas-${isoDate}.json`;
}

export function exportTransactionsCsv(transactions: Transaction[]): string {
  const header = [
    "id",
    "tipo",
    "valor",
    "data",
    "categoria",
    "subcategoria",
    "estabelecimento",
    "forma_pagamento",
    "observacoes"
  ];

  const rows = transactions.map((transaction) => [
    escapeCsvCell(transaction.id),
    escapeCsvCell(transaction.type === "income" ? "receita" : "despesa"),
    escapeCsvCell(transaction.amount.toFixed(2)),
    escapeCsvCell(transaction.date),
    escapeCsvCell(transaction.category),
    escapeCsvCell(transaction.subcategory),
    escapeCsvCell(transaction.merchant),
    escapeCsvCell(transaction.paymentMethod),
    escapeCsvCell(transaction.notes)
  ]);

  return [header.map(escapeCsvCell).join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function parseAndValidateBackupFile(raw: string): BackupData {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("O arquivo selecionado não contém um JSON válido.");
  }

  if (!isObject(parsed) || !isAppDataLike(parsed)) {
    throw new Error("O backup está em um formato incompatível com o app.");
  }

  const candidate = parsed as Record<string, unknown>;

  const hasRequiredArrays =
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.accounts) &&
    Array.isArray(candidate.paymentMethods) &&
    Array.isArray(candidate.goals);

  if (!hasRequiredArrays) {
    throw new Error("O backup está incompleto. Estruturas obrigatórias não foram encontradas.");
  }

  if (typeof candidate.schemaVersion !== "number") {
    throw new Error("O backup não informa a versão do schema de dados.");
  }

  if (candidate.schemaVersion > APP_DATA_SCHEMA_VERSION) {
    throw new Error(
      "Este backup foi gerado por uma versão mais nova do app e não pode ser importado com segurança."
    );
  }

  if (typeof candidate.exportedAt !== "string" || !candidate.exportedAt.trim()) {
    throw new Error("O backup não informa a data de exportação.");
  }

  try {
    const normalized = normalizeAppData({
      transactions: candidate.transactions as AppData["transactions"],
      categories: candidate.categories as AppData["categories"],
      accounts: candidate.accounts as AppData["accounts"],
      paymentMethods: candidate.paymentMethods as AppData["paymentMethods"],
      goals: candidate.goals as AppData["goals"],
      preferences: (isObject(candidate.preferences) ? candidate.preferences : undefined) as
        | AppData["preferences"]
        | undefined,
      updatedAt: candidate.exportedAt
    });

    return {
      ...normalized,
      schemaVersion: candidate.schemaVersion,
      exportedAt: candidate.exportedAt
    };
  } catch {
    throw new Error("O arquivo está corrompido ou contém dados inválidos.");
  }
}

export function restoreAppData(
  currentData: AppData,
  importedBackup: BackupData,
  mode: ImportMode
): AppData {
  const importedData = normalizeAppData({
    ...importedBackup,
    updatedAt: importedBackup.exportedAt
  });

  if (mode === "replace") {
    return importedData;
  }

  return normalizeAppData({
    transactions: mergeTransactions(currentData.transactions, importedData.transactions),
    categories: dedupeByKey(
      [...currentData.categories, ...importedData.categories],
      (category) => category.trim().toLowerCase()
    ),
    accounts: dedupeByKey(
      [...currentData.accounts, ...importedData.accounts],
      (account) => account.id || account.name.trim().toLowerCase()
    ),
    paymentMethods: dedupeByKey(
      [...currentData.paymentMethods, ...importedData.paymentMethods],
      (paymentMethod) => paymentMethod.trim().toLowerCase()
    ),
    goals: dedupeByKey(
      [...currentData.goals, ...importedData.goals],
      (goal) => goal.id || goal.name.trim().toLowerCase()
    ),
    preferences: importedData.preferences,
    updatedAt: new Date().toISOString()
  });
}
