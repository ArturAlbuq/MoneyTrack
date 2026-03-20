import type { PaymentMethod } from "../types";

export const allowedPaymentMethods: PaymentMethod[] = [
  "Cartão de Crédito",
  "Cartão de Débito",
  "Dinheiro",
  "Pix",
  "Carteira"
];

const paymentMethodReplacements: Record<string, PaymentMethod> = {
  "Credit Card": "Cartão de Crédito",
  "Debit Card": "Cartão de Débito",
  Cash: "Dinheiro",
  Pix: "Pix",
  "Bank Transfer": "Pix",
  Wallet: "Carteira",
  "Cartão de Crédito": "Cartão de Crédito",
  "Cartão de Débito": "Cartão de Débito",
  Dinheiro: "Dinheiro",
  "Transferência Bancária": "Pix",
  Carteira: "Carteira"
};

export function normalizePaymentMethod(paymentMethod: string): PaymentMethod {
  return paymentMethodReplacements[paymentMethod] ?? "Pix";
}
