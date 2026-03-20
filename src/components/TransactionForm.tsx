import { useEffect, useState } from "react";
import { parseCurrencyInput } from "../lib/format";
import { allowedPaymentMethods } from "../lib/paymentMethods";
import type {
  PaymentMethod,
  Transaction,
  TransactionFormValues,
  TransactionType
} from "../types";

interface TransactionFormProps {
  categories: string[];
  initialValue?: Transaction | null;
  onSubmit: (transaction: TransactionFormValues) => void;
  onCancelEdit: () => void;
}

function toFormValues(transaction?: Transaction | null): TransactionFormValues {
  return {
    type: transaction?.type ?? "expense",
    amount: transaction ? String(transaction.amount) : "",
    date: transaction?.date ?? new Date().toISOString().slice(0, 10),
    category: transaction?.category ?? "",
    subcategory: transaction?.subcategory ?? "",
    merchant: transaction?.merchant ?? "",
    paymentMethod: transaction?.paymentMethod ?? "Cartão de Crédito",
    notes: transaction?.notes ?? ""
  };
}

export function TransactionForm({
  categories,
  initialValue,
  onSubmit,
  onCancelEdit
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormValues>(toFormValues(initialValue));
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    setForm(toFormValues(initialValue));
    setAmountError("");
  }, [initialValue]);

  function updateField<Key extends keyof TransactionFormValues>(
    key: Key,
    value: TransactionFormValues[Key]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = parseCurrencyInput(form.amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setAmountError("Informe um valor válido. Exemplo: 12,50");
      return;
    }

    onSubmit(form);
    setAmountError("");

    if (!initialValue) {
      setForm(toFormValues(null));
    }
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lançamento</p>
          <h2>{initialValue ? "Editar transação" : "Novo lançamento"}</h2>
        </div>
        {initialValue ? (
          <button type="button" className="ghost-button" onClick={onCancelEdit}>
            Cancelar edição
          </button>
        ) : null}
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="segmented-control" role="tablist" aria-label="Tipo de transação">
          {(["expense", "income"] as TransactionType[]).map((type) => (
            <button
              key={type}
              type="button"
              className={form.type === type ? "segment active" : "segment"}
              onClick={() => updateField("type", type)}
            >
              {type === "expense" ? "Despesa" : "Receita"}
            </button>
          ))}
        </div>

        <label>
          <span>Valor</span>
          <input
            required
            inputMode="decimal"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => {
              updateField("amount", event.target.value);
              if (amountError) {
                setAmountError("");
              }
            }}
            placeholder="0,00"
            aria-invalid={amountError ? "true" : "false"}
          />
          {amountError ? <small className="field-error">{amountError}</small> : null}
        </label>

        <label>
          <span>Data</span>
          <input
            required
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
        </label>

        <label>
          <span>Categoria</span>
          <select
            required
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Subcategoria</span>
          <input
            required
            value={form.subcategory}
            onChange={(event) => updateField("subcategory", event.target.value)}
            placeholder="Compras da semana"
          />
        </label>

        <label>
          <span>Estabelecimento</span>
          <input
            required
            value={form.merchant}
            onChange={(event) => updateField("merchant", event.target.value)}
            placeholder="Fresh Mart"
          />
        </label>

        <label>
          <span>Forma de pagamento</span>
          <select
            value={form.paymentMethod}
            onChange={(event) =>
              updateField("paymentMethod", event.target.value as PaymentMethod)
            }
          >
            {allowedPaymentMethods.map((paymentMethod) => (
              <option key={paymentMethod} value={paymentMethod}>
                {paymentMethod}
              </option>
            ))}
          </select>
        </label>

        <label className="full-width">
          <span>Observações</span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Detalhes opcionais"
          />
        </label>

        <button type="submit" className="primary-button">
          {initialValue ? "Salvar alterações" : "Salvar lançamento"}
        </button>
      </form>
    </section>
  );
}
