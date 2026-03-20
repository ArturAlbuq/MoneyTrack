import type { AppData, PaymentMethod, Transaction } from "../types";

const PERSISTED_DATA_STORAGE_KEY = "moneytrack.appdata.v1";
const LEGACY_TRANSACTIONS_STORAGE_KEY = "moneytrack.transactions.v1";
const PERSISTED_DATA_SCHEMA_VERSION = 1;

interface PersistedDataEnvelope {
  schemaVersion: number;
  data: Partial<AppData>;
}

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStorageValue(key: string): string | null {
  if (!hasWindow()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Falha ao ler o storage "${key}".`, error);
    return null;
  }
}

function writeStorageValue(key: string, value: string): boolean {
  if (!hasWindow()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Falha ao salvar o storage "${key}".`, error);
    return false;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isTransactionArray(value: unknown): value is Transaction[] {
  return Array.isArray(value);
}

function isPaymentMethodArray(value: unknown): value is PaymentMethod[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFlatPersistedAppData(value: unknown): value is Partial<AppData> {
  if (!isObject(value)) {
    return false;
  }

  return (
    isTransactionArray(value.transactions) &&
    isStringArray(value.categories) &&
    Array.isArray(value.accounts) &&
    isPaymentMethodArray(value.paymentMethods) &&
    Array.isArray(value.goals) &&
    isObject(value.preferences) &&
    typeof value.updatedAt === "string"
  );
}

export function validatePersistedData(value: unknown): value is PersistedDataEnvelope {
  if (!isObject(value)) {
    return false;
  }

  if (typeof value.schemaVersion !== "number") {
    return false;
  }

  if (!isObject(value.data)) {
    return false;
  }

  const candidate = value.data;

  return (
    isTransactionArray(candidate.transactions) &&
    isStringArray(candidate.categories) &&
    Array.isArray(candidate.accounts) &&
    isPaymentMethodArray(candidate.paymentMethods) &&
    Array.isArray(candidate.goals) &&
    isObject(candidate.preferences) &&
    typeof candidate.updatedAt === "string"
  );
}

export function migratePersistedDataSchema(
  value: unknown,
  normalize: (input: Partial<AppData>) => AppData,
  createSeed: () => AppData
): AppData | null {
  if (isFlatPersistedAppData(value)) {
    return normalize({
      ...value,
      schemaVersion: PERSISTED_DATA_SCHEMA_VERSION
    });
  }

  if (validatePersistedData(value)) {
    if (value.schemaVersion > PERSISTED_DATA_SCHEMA_VERSION) {
      console.error(
        `Schema persistido v${value.schemaVersion} é mais novo que o suportado v${PERSISTED_DATA_SCHEMA_VERSION}.`
      );
      return null;
    }

    return normalize({
      ...value.data,
      schemaVersion: PERSISTED_DATA_SCHEMA_VERSION
    });
  }

  const legacyTransactions = readStorageValue(LEGACY_TRANSACTIONS_STORAGE_KEY);

  if (!legacyTransactions) {
    return null;
  }

  try {
    const parsedLegacy = JSON.parse(legacyTransactions) as unknown;

    if (!Array.isArray(parsedLegacy)) {
      return null;
    }

    return normalize({
      ...createSeed(),
      transactions: parsedLegacy as Transaction[],
      schemaVersion: PERSISTED_DATA_SCHEMA_VERSION
    });
  } catch (error) {
    console.error("Falha ao migrar storage legado de transações.", error);
    return null;
  }
}

export function loadPersistedData(
  normalize: (input: Partial<AppData>) => AppData,
  createSeed: () => AppData
): AppData {
  const raw = readStorageValue(PERSISTED_DATA_STORAGE_KEY);

  if (!raw) {
    return migratePersistedDataSchema(null, normalize, createSeed) ?? createSeed();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return migratePersistedDataSchema(parsed, normalize, createSeed) ?? createSeed();
  } catch (error) {
    console.error("Falha ao fazer parse do JSON persistido.", error);
    return migratePersistedDataSchema(null, normalize, createSeed) ?? createSeed();
  }
}

export function savePersistedData(data: AppData): boolean {
  const envelope: PersistedDataEnvelope = {
    schemaVersion: PERSISTED_DATA_SCHEMA_VERSION,
    data
  };

  return writeStorageValue(PERSISTED_DATA_STORAGE_KEY, JSON.stringify(envelope));
}

export function getPersistedDataStorageKey(): string {
  return PERSISTED_DATA_STORAGE_KEY;
}

export function getPersistedDataSchemaVersion(): number {
  return PERSISTED_DATA_SCHEMA_VERSION;
}
