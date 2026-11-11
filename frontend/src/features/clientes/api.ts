import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apenasDigitos } from '@/lib/formatters'
import { http } from '@/lib/http'
import type { Pagina } from '@/lib/pagina'

import type { ClienteFormValues } from './schema'

export interface Cliente {
  id: number
  nome: string
  cpf: string
  email: string
  telefone: string
  criadoEm: string
  atualizadoEm: string
}

interface FiltroClientes {
  busca: string
  pagina: number
}

const chaves = {
  todos: ['clientes'] as const,
  lista: (filtro: FiltroClientes) => ['clientes', 'lista', filtro] as const,
  detalhe: (id: number) => ['clientes', 'detalhe', id] as const,
}

function paraRequest(valores: ClienteFormValues) {
  return { ...valores, cpf: apenasDigitos(valores.cpf), telefone: apenasDigitos(valores.telefone) }
}

export function useClientes(filtro: FiltroClientes) {
  return useQuery({
    queryKey: chaves.lista(filtro),
    queryFn: ({ signal }) =>
      http<Pagina<Cliente>>('/clientes', { params: { busca: filtro.busca, pagina: filtro.pagina }, signal }),
    placeholderData: keepPreviousData,
  })
}

export function useCliente(id: number) {
  return useQuery({
    queryKey: chaves.detalhe(id),
    queryFn: ({ signal }) => http<Cliente>(`/clientes/${id}`, { signal }),
  })
}

export function useCriarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ClienteFormValues) =>
      http<Cliente>('/clientes', { method: 'POST', body: paraRequest(valores) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.todos }),
  })
}

export function useAtualizarCliente(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ClienteFormValues) =>
      http<Cliente>(`/clientes/${id}`, { method: 'PUT', body: paraRequest(valores) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.todos }),
  })
}

export function useExcluirCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => http<void>(`/clientes/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.todos }),
  })
}
