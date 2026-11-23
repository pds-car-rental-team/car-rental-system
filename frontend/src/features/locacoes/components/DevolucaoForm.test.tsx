import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/http'

import type { Locacao } from '../api'
import { DevolucaoForm } from './DevolucaoForm'

const LOCACAO_MOCK: Locacao = {
  id: 1,
  clienteId: 10,
  clienteNome: 'Maria da Silva',
  veiculoId: 20,
  veiculoPlaca: 'BRA2E19',
  veiculoModelo: 'Renault Kwid 1.0 Zen',
  dataRetirada: '2026-11-10',
  dataPrevistaDevolucao: '2026-11-14',
  dataDevolucao: null,
  valorDiaria: 120,
  valorPrevisto: 480,
  valorFinal: null,
  status: 'ABERTA',
  atrasada: true,
  criadoEm: '2026-11-10T10:00:00Z',
  atualizadoEm: '2026-11-10T10:00:00Z',
}

function renderizar(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(<DevolucaoForm locacao={LOCACAO_MOCK} onSubmit={onSubmit} onCancel={vi.fn()} />)
  return onSubmit
}

describe('DevolucaoForm', () => {
  it('calcula o valor final conforme a data e envia a devolução com a situação escolhida', async () => {
    const onSubmit = renderizar()
    const usuario = userEvent.setup()

    const campoData = screen.getByLabelText('Data de devolução')
    await usuario.clear(campoData)
    await usuario.type(campoData, '2026-11-16')

    expect(screen.getByText(/6 diárias/)).toBeInTheDocument()
    expect(screen.getByText(/Valor final: R\$ 720,00/)).toBeInTheDocument()

    await usuario.click(screen.getByLabelText('Situação do veículo após a devolução'))
    await usuario.click(await screen.findByRole('option', { name: 'Em manutenção' }))

    await usuario.click(screen.getByRole('button', { name: 'Registrar devolução' }))

    expect(onSubmit).toHaveBeenCalledWith({
      dataDevolucao: '2026-11-16',
      situacaoVeiculo: 'EM_MANUTENCAO',
    })
  })

  it('exibe erro de validação e não envia quando a data de devolução está vazia', async () => {
    const onSubmit = renderizar()
    const usuario = userEvent.setup()

    await usuario.clear(screen.getByLabelText('Data de devolução'))
    await usuario.click(screen.getByRole('button', { name: 'Registrar devolução' }))

    expect(await screen.findByText('Informe a data de devolução.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('exibe erro retornado pela API ao tentar registrar devolução inválida', async () => {
    const mensagem = 'Esta locação não está aberta.'
    renderizar(vi.fn().mockRejectedValue(new ApiError(409, mensagem)))
    const usuario = userEvent.setup()

    await usuario.click(screen.getByRole('button', { name: 'Registrar devolução' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(mensagem)
  })
})
