import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import * as httpModule from '@/lib/http'

import { DisponibilidadePage } from './DisponibilidadePage'

const VEICULOS_MOCK = [
  {
    id: 1,
    placa: 'ABC1D23',
    modelo: 'Fiat Pulse 1.3',
    categoria: 'SUV' as const,
    valorDiaria: 189.9,
    situacao: 'DISPONIVEL' as const,
    criadoEm: '2026-11-11T10:00:00Z',
    atualizadoEm: '2026-11-11T10:00:00Z',
  },
  {
    id: 2,
    placa: 'DEF2G34',
    modelo: 'Toyota Corolla 2.0',
    categoria: 'SEDAN' as const,
    valorDiaria: 249.9,
    situacao: 'ALUGADO' as const,
    criadoEm: '2026-11-11T10:00:00Z',
    atualizadoEm: '2026-11-11T10:00:00Z',
  },
]

function renderizarPagina() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <DisponibilidadePage />
    </QueryClientProvider>,
  )
}

describe('DisponibilidadePage', () => {
  it('exibe os cards de resumo e lista os veículos com placa e diária formatadas', async () => {
    const httpSpy = vi.spyOn(httpModule, 'http').mockImplementation(async (caminho) => {
      if (caminho === '/veiculos/disponibilidade') {
        return { total: 12, disponiveis: 7, alugados: 3, emManutencao: 2 }
      }
      return {
        itens: VEICULOS_MOCK,
        pagina: 0,
        tamanho: 20,
        totalItens: 2,
        totalPaginas: 1,
      }
    })

    renderizarPagina()

    const resumo = screen.getByRole('region', { name: 'Resumo de disponibilidade da frota' })
    expect(await within(resumo).findByText('12')).toBeInTheDocument()
    expect(within(resumo).getByText('7')).toBeInTheDocument()
    expect(within(resumo).getByText('3')).toBeInTheDocument()
    expect(within(resumo).getByText('2')).toBeInTheDocument()

    expect(await screen.findByText('Fiat Pulse 1.3')).toBeInTheDocument()
    expect(screen.getByText('ABC-1D23')).toBeInTheDocument()
    expect(screen.getByText('R$ 189,90')).toBeInTheDocument()
    expect(screen.getByText('Toyota Corolla 2.0')).toBeInTheDocument()

    httpSpy.mockRestore()
  })

  it('filtra por situação ao clicar no card de resumo e por categoria no filtro', async () => {
    const chamadas: Array<{ caminho: string; params?: Record<string, unknown> }> = []
    const httpSpy = vi.spyOn(httpModule, 'http').mockImplementation(async (caminho, opcoes) => {
      chamadas.push({ caminho, params: opcoes?.params })
      if (caminho === '/veiculos/disponibilidade') {
        return { total: 1, disponiveis: 1, alugados: 0, emManutencao: 0 }
      }
      return {
        itens: [VEICULOS_MOCK[0]],
        pagina: 0,
        tamanho: 20,
        totalItens: 1,
        totalPaginas: 1,
      }
    })

    const usuario = userEvent.setup()
    renderizarPagina()

    await screen.findByText('Fiat Pulse 1.3')

    await usuario.click(screen.getByRole('button', { name: /Disponíveis/i }))

    expect(
      chamadas.some((c) => c.caminho === '/veiculos' && c.params?.situacao === 'DISPONIVEL'),
    ).toBe(true)

    await usuario.click(screen.getByRole('combobox', { name: 'Filtrar por categoria' }))
    await usuario.click(await screen.findByRole('option', { name: 'SUV' }))

    expect(
      chamadas.some(
        (c) =>
          c.caminho === '/veiculos' &&
          c.params?.situacao === 'DISPONIVEL' &&
          c.params?.categoria === 'SUV',
      ),
    ).toBe(true)

    httpSpy.mockRestore()
  })
})

