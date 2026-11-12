import type { CategoriaVeiculo, SituacaoVeiculo } from './api'

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const ROTULO_CATEGORIA: Record<CategoriaVeiculo, string> = {
  ECONOMICO: 'Econômico',
  HATCH: 'Hatch',
  SEDAN: 'Sedan',
  SUV: 'SUV',
  UTILITARIO: 'Utilitário',
}

export const ROTULO_SITUACAO: Record<SituacaoVeiculo, string> = {
  DISPONIVEL: 'Disponível',
  ALUGADO: 'Alugado',
  EM_MANUTENCAO: 'Em manutenção',
}

/** "ABC1D23" -> "ABC-1D23". */
export function formatarPlaca(valor: string) {
  const limpo = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7)
  if (limpo.length <= 3) return limpo
  return `${limpo.slice(0, 3)}-${limpo.slice(3)}`
}

/** 189.9 -> "R$ 189,90". */
export function formatarMoeda(valor: number) {
  return formatadorMoeda.format(valor).replace(/\u00a0/g, ' ')
}

