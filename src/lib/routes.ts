/**
 * O catálogo de recursos referencia rotas por string porque parte deles ainda
 * será construída. Este helper concentra a conversão para o tipo de rota do
 * TanStack Router em um único ponto.
 */
export function asAppRoute(path: string) {
  return path as never
}
