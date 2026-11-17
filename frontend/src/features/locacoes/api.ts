import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { http } from '@/lib/http'
import { TAMANHO_PAGINA, type Pagina } from '@/lib/pagina'

import type { LocacaoFormValues } from './schema'

export type StatusLocacao = 'ABERTA' | 'FINALIZADA' | 'CANCELADA'

export interface Locacao {
  id: number
  clienteId: number
  clienteNome: string
  veiculoId: number
  veiculoPlaca: string
  veiculoModelo: string
  dataRetirada: string
  dataPrevistaDevolucao: string
  dataDevolucao: string | null
  valorDiaria: number
  valorPrevisto: number
  status: StatusLocacao
  criadoEm: string
  atualizadoEm: string
}

export interface ClienteOpcao {
  id: number
  nome: string
  cpf: string
}

export interface VeiculoOpcao {
  id: number
  placa: string
  modelo: string
  valorDiaria: number
}

export interface FiltroLocacoes {
  status?: StatusLocacao
  pagina: number
}

const chaves = {
  todos: ['locacoes'] as const,
  lista: (filtro: FiltroLocacoes) => ['locacoes', 'lista', filtro] as const,
  clientesOpcoes: ['locacoes', 'clientes-opcoes'] as const,
  veiculosDisponiveis: ['locacoes', 'veiculos-disponiveis'] as const,
}

export function useLocacoes(filtro: FiltroLocacoes) {
  return useQuery({
    queryKey: chaves.lista(filtro),
    queryFn: ({ signal }) =>
      http<Pagina<Locacao>>('/locacoes', {
        params: {
          status: filtro.status,
          pagina: filtro.pagina,
          tamanho: TAMANHO_PAGINA,
        },
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

export function useClientesParaLocacao(habilitado: boolean) {
  return useQuery({
    queryKey: chaves.clientesOpcoes,
    queryFn: ({ signal }) => http<Pagina<ClienteOpcao>>('/clientes', { params: { tamanho: 100 }, signal }),
    enabled: habilitado,
  })
}

export function useVeiculosDisponiveis(habilitado: boolean) {
  return useQuery({
    queryKey: chaves.veiculosDisponiveis,
    queryFn: ({ signal }) =>
      http<Pagina<VeiculoOpcao>>('/veiculos', { params: { situacao: 'DISPONIVEL', tamanho: 100 }, signal }),
    enabled: habilitado,
  })
}

export function useRegistrarLocacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: LocacaoFormValues) =>
      http<Locacao>('/locacoes', {
        method: 'POST',
        body: {
          clienteId: Number(valores.clienteId),
          veiculoId: Number(valores.veiculoId),
          dataRetirada: valores.dataRetirada,
          dataPrevistaDevolucao: valores.dataPrevistaDevolucao,
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chaves.todos }),
        queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
      ])
    },
  })
}
