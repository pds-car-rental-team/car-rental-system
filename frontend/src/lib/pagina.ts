/** Quantidade de registros por página em todas as listagens. */
export const TAMANHO_PAGINA = 15

/** Espelha o PaginaResponse do backend. */
export interface Pagina<T> {
  itens: T[]
  pagina: number
  tamanho: number
  totalItens: number
  totalPaginas: number
}
