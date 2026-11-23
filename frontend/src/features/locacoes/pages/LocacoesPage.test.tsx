import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import * as httpModule from '@/lib/http'

import { LocacoesPage } from './LocacoesPage'

const LOCACOES_MOCK = [
  {
    id: 1,
    clienteId: 10,
    clienteNome: 'Maria da Silva',
    veiculoId: 20,
    veiculoPlaca: 'BRA2E19',
    veiculoModelo: 'Renault Kwid 1.0 Zen',
    dataRetirada: '2026-11-15',
    dataPrevistaDevolucao: '2026-11-18',
    dataDevolucao: null,
    valorDiaria: 120,
    valorPrevisto: 360,
    status: 'ABERTA' as const,
    atrasada: true,
    criadoEm: '2026-11-15T10:00:00Z',
    atualizadoEm: '2026-11-15T10:00:00Z',
  },
  {
    id: 2,
    clienteId: 11,
    clienteNome: 'Carlos Eduardo',
    veiculoId: 21,
    veiculoPlaca: 'XYZ9K88',
    veiculoModelo: 'Toyota Corolla GLi 2.0',
    dataRetirada: '2026-11-01',
    dataPrevistaDevolucao: '2026-11-05',
    dataDevolucao: '2026-11-05',
    valorDiaria: 250,
    valorPrevisto: 1000,
    status: 'FINALIZADA' as const,
    atrasada: false,
    criadoEm: '2026-11-01T10:00:00Z',
    atualizadoEm: '2026-11-05T10:00:00Z',
  },
]

function renderizarPagina() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <LocacoesPage />
    </QueryClientProvider>,
  )
}

describe('LocacoesPage', () => {
  it('lista locações com selo de atrasada e botão Devolver desabilitado apenas para abertas', async () => {
    const httpSpy = vi.spyOn(httpModule, 'http').mockResolvedValue({
      itens: LOCACOES_MOCK,
      pagina: 0,
      tamanho: 20,
      totalItens: 2,
      totalPaginas: 1,
    })

    renderizarPagina()

    expect(await screen.findByText('Maria da Silva')).toBeInTheDocument()
    expect(screen.getByText('Renault Kwid 1.0 Zen (BRA-2E19)')).toBeInTheDocument()
    expect(screen.getByText('Atrasada')).toBeInTheDocument()
    expect(screen.getByText('Finalizada')).toBeInTheDocument()

    const botoesDevolver = screen.getAllByRole('button', { name: /Devolver/i })
    expect(botoesDevolver).toHaveLength(1)
    expect(botoesDevolver[0]).toBeDisabled()

    httpSpy.mockRestore()
  })

  it('filtra por status Atrasada e envia o termo de busca para a API', async () => {
    const chamadas: Array<{ caminho: string; params?: Record<string, unknown> }> = []
    const httpSpy = vi.spyOn(httpModule, 'http').mockImplementation(async (caminho, opcoes) => {
      chamadas.push({ caminho, params: opcoes?.params })
      return {
        itens: [LOCACOES_MOCK[0]],
        pagina: 0,
        tamanho: 20,
        totalItens: 1,
        totalPaginas: 1,
      }
    })

    const usuario = userEvent.setup()
    renderizarPagina()

    await screen.findByText('Maria da Silva')

    await usuario.click(screen.getByRole('combobox', { name: 'Filtrar por status' }))
    await usuario.click(await screen.findByRole('option', { name: 'Atrasada' }))

    await waitFor(() => {
      expect(
        chamadas.some((c) => c.caminho === '/locacoes' && c.params?.status === 'ATRASADA'),
      ).toBe(true)
    })

    await usuario.type(screen.getByLabelText('Buscar por cliente, placa ou modelo'), 'Maria')

    await waitFor(() => {
      expect(
        chamadas.some(
          (c) =>
            c.caminho === '/locacoes' &&
            c.params?.status === 'ATRASADA' &&
            c.params?.busca === 'Maria',
        ),
      ).toBe(true)
    })

    httpSpy.mockRestore()
  })
})
