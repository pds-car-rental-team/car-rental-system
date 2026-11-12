import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { http } from '@/lib/http'
import { TAMANHO_PAGINA, type Pagina } from '@/lib/pagina'

export type SituacaoVeiculo = 'DISPONIVEL' | 'ALUGADO' | 'EM_MANUTENCAO'

export type CategoriaVeiculo = 'ECONOMICO' | 'HATCH' | 'SEDAN' | 'SUV' | 'UTILITARIO'

export interface Veiculo {
  id: number
  placa: string
  modelo: string
  categoria: CategoriaVeiculo
  valorDiaria: number
  situacao: SituacaoVeiculo
  criadoEm: string
  atualizadoEm: string
}

export interface DisponibilidadeResumo {
  total: number
  disponiveis: number
  alugados: number
  emManutencao: number
}

export interface FiltroDisponibilidade {
  situacao?: SituacaoVeiculo
  categoria?: CategoriaVeiculo
  busca: string
  pagina: number
}

const chaves = {
  todos: ['veiculos'] as const,
  lista: (filtro: FiltroDisponibilidade) => ['veiculos', 'disponibilidade', 'lista', filtro] as const,
  resumo: (categoria?: CategoriaVeiculo) => ['veiculos', 'disponibilidade', 'resumo', categoria ?? 'TODAS'] as const,
}

export function useDisponibilidadeFrota(filtro: FiltroDisponibilidade) {
  return useQuery({
    queryKey: chaves.lista(filtro),
    queryFn: ({ signal }) =>
      http<Pagina<Veiculo>>('/veiculos', {
        params: {
          situacao: filtro.situacao,
          categoria: filtro.categoria,
          busca: filtro.busca,
          pagina: filtro.pagina,
          tamanho: TAMANHO_PAGINA,
        },
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

export function useResumoDisponibilidade(categoria?: CategoriaVeiculo) {
  return useQuery({
    queryKey: chaves.resumo(categoria),
    queryFn: ({ signal }) =>
      http<DisponibilidadeResumo>('/veiculos/disponibilidade', {
        params: { categoria },
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

