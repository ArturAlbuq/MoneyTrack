export const allowedCategories = [
  "Alimentação",
  "Assinaturas",
  "Compras",
  "Saúde",
  "Salário",
  "Transporte"
] as const;

const categoryReplacements: Record<string, string> = {
  "Bônus": "Salário",
  Bonus: "Salário",
  Freelance: "Salário",
  "Viagens": "Transporte",
  Travel: "Transporte",
  Moradia: "Compras",
  Housing: "Compras",
  "Bem-estar": "Saúde",
  Fitness: "Saúde",
  Mercado: "Alimentação",
  Groceries: "Alimentação"
};

export function normalizeCategory(category: string): string {
  return categoryReplacements[category] ?? category;
}
