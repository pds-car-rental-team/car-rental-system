import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/http'

import type { ClienteOpcao, VeiculoOpcao } from '../api'
import { dataAtualIso } from '../formatters'
import { LocacaoForm } from './LocacaoForm'

const CLIENTES: ClienteOpcao[] = [
  { id: 1, nome: 'Maria da Silva', cpf: '52998224725' },
  { id: 2, nome: 'João Souza', cpf: '11144477735' },
]

const VEICULOS: VeiculoOpcao[] = [
  { id: 2, placa: 'BRA2E19', modelo: 'Renault Kwid 1.0 Zen', valorDiaria: 120 },
  { id: 3, placa: 'RTY7U89', modelo: 'Chevrolet Onix 1.0 LT', valorDiaria: 150 },
]

function adicionarDias(iso: string, dias: number) {
  const data = new Date(`${iso}T00:00:00Z`)
  data.setUTCDate(data.getUTCDate() + dias)
  return data.toISOString().slice(0, 10)
}

function renderizar(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(<LocacaoForm clientes={CLIENTES} veiculos={VEICULOS} onSubmit={onSubmit} onCancel={vi.fn()} />)
  return onSubmit
}

async function preencherValido() {
  const usuario = userEvent.setup()
  const hoje = dataAtualIso()
  const devolucao = adicionarDias(hoje, 3)

  await usuario.click(screen.getByLabelText('Cliente'))
  await usuario.click(await screen.findByRole('option', { name: /Maria da Silva/ }))

  await usuario.click(screen.getByLabelText('Veículo disponível'))
  await usuario.click(await screen.findByRole('option', { name: /Renault Kwid 1.0 Zen/ }))

  await usuario.type(screen.getByLabelText('Previsão de devolução'), devolucao)
  return { usuario, hoje, devolucao }
}

describe('LocacaoForm', () => {
  it('exibe erros de validação e não envia quando os campos estão vazios', async () => {
    const onSubmit = renderizar()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Registrar locação' }))

    expect(await screen.findByText('Selecione o cliente.')).toBeInTheDocument()
    expect(screen.getByText('Selecione o veículo.')).toBeInTheDocument()
    expect(screen.getByText('Informe a data prevista de devolução.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calcula o valor previsto e envia os dados da locação', async () => {
    const onSubmit = renderizar()

    const { usuario, hoje, devolucao } = await preencherValido()

    expect(screen.getByText(/3 diárias/)).toBeInTheDocument()
    expect(screen.getByText(/Valor previsto: R\$ 360,00/)).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Registrar locação' }))

    expect(onSubmit).toHaveBeenCalledWith({
      clienteId: '1',
      veiculoId: '2',
      dataRetirada: hoje,
      dataPrevistaDevolucao: devolucao,
    })
  })

  it('exibe mensagem de erro da API quando o veículo está indisponível', async () => {
    const mensagem = 'Veículo não está disponível para locação.'
    renderizar(vi.fn().mockRejectedValue(new ApiError(409, mensagem)))

    const { usuario } = await preencherValido()
    await usuario.click(screen.getByRole('button', { name: 'Registrar locação' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(mensagem)
  })

  it('filtra clientes e veículos pela busca digitada nos seletores', async () => {
    renderizar()
    const usuario = userEvent.setup()

    await usuario.click(screen.getByLabelText('Cliente'))
    await usuario.type(screen.getByLabelText('Buscar por nome ou CPF…'), '111.444')
    expect(screen.getByRole('option', { name: /João Souza/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Maria da Silva/ })).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('option', { name: /João Souza/ }))

    await usuario.click(screen.getByLabelText('Veículo disponível'))
    await usuario.type(screen.getByLabelText('Buscar por modelo ou placa…'), 'rty')
    expect(screen.getByRole('option', { name: /Chevrolet Onix/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Renault Kwid/ })).not.toBeInTheDocument()
  })
})
