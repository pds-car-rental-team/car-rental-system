import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { http } from '@/lib/http'
import { TAMANHO_PAGINA, type Pagina } from '@/lib/pagina'
import type { VeiculoFormValues } from './schema'
import { lerValor } from './schema'

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

export interface FiltroVeiculos {
  busca: string
  pagina: number
}

function paraRequest(valores: VeiculoFormValues) {
  return {
    placa: valores.placa.trim(),
    modelo: valores.modelo.trim(),
    categoria: valores.categoria as CategoriaVeiculo,
    valorDiaria: lerValor(valores.valorDiaria),
    situacao: valores.situacao as SituacaoVeiculo,
  }
}

export function useVeiculos(filtro: FiltroVeiculos) {
  return useQuery({
    queryKey: ['veiculos', 'lista', filtro] as const,
    queryFn: ({ signal }) =>
      http<Pagina<Veiculo>>('/veiculos', {
        params: { busca: filtro.busca, pagina: filtro.pagina, tamanho: TAMANHO_PAGINA },
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

/** Cadastra (sem `id`) ou atualiza (com `id`) um veículo. */
export function useSalvarVeiculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, valores }: { id?: number; valores: VeiculoFormValues }) =>
      id === undefined
        ? http<Veiculo>('/veiculos', { method: 'POST', body: paraRequest(valores) })
        : http<Veiculo>(`/veiculos/${id}`, { method: 'PUT', body: paraRequest(valores) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.todos }),
  })
}

export function useExcluirVeiculo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => http<void>(`/veiculos/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.todos }),
  })
}

