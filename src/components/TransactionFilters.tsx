import type { TransactionFilters as TransactionFiltersValues } from "../types";

interface TransactionFiltersProps {
  filters: TransactionFiltersValues;
  categories: string[];
  paymentMethods: string[];
  onChange: (filters: TransactionFiltersValues) => void;
  embedded?: boolean;
}

export function TransactionFilters({
  filters,
  categories,
  paymentMethods,
  onChange,
  embedded = false
}: TransactionFiltersProps) {
  function update<Key extends keyof TransactionFiltersValues>(
    key: Key,
    value: TransactionFiltersValues[Key]
  ) {
    onChange({ ...filters, [key]: value });
  }

  const content = (
    <>
      <div className={embedded ? "filters-heading filters-heading-embedded" : "section-heading"}>
        <div>
          <p className="eyebrow">Refinar</p>
          <h2>Filtros</h2>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={() =>
            onChange({
              startDate: "",
              endDate: "",
              category: "",
              merchant: "",
              paymentMethod: ""
            })
          }
        >
          Limpar
        </button>
      </div>

      <div className={embedded ? "filters-grid filters-grid-embedded" : "filters-grid"}>
        <label>
          <span>Data inicial</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => update("startDate", event.target.value)}
          />
        </label>

        <label>
          <span>Data final</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => update("endDate", event.target.value)}
          />
        </label>

        <label>
          <span>Categoria</span>
          <select
            value={filters.category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Estabelecimento</span>
          <input
            value={filters.merchant}
            onChange={(event) => update("merchant", event.target.value)}
            placeholder="Buscar por estabelecimento"
          />
        </label>

        <label>
          <span>Forma de pagamento</span>
          <select
            value={filters.paymentMethod}
            onChange={(event) => update("paymentMethod", event.target.value)}
          >
            <option value="">Selecionar uma forma de pagamento</option>
            {paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod} value={paymentMethod}>
                {paymentMethod}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );

  if (embedded) {
    return <div className="history-filters">{content}</div>;
  }

  return <section className="panel">{content}</section>;
}
