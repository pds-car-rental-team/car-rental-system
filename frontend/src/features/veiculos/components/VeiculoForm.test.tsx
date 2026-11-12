import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/http'

import { VeiculoForm } from './VeiculoForm'

function renderizar(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(<VeiculoForm rotuloEnviar="Cadastrar" onSubmit={onSubmit} onCancel={vi.fn()} />)
  return onSubmit
}

async function preencherValido() {
  const usuario = userEvent.setup()
  await usuario.type(screen.getByLabelText('Placa'), 'abc1d23')
  await usuario.type(screen.getByLabelText('Valor da diária (R$)'), '189,90')
  await usuario.type(screen.getByLabelText('Modelo'), 'Fiat Pulse 1.3')
  await usuario.click(screen.getByLabelText('Categoria'))
  await usuario.click(await screen.findByRole('option', { name: 'SUV' }))
  return usuario
}

describe('VeiculoForm', () => {
  it('exibe erros de validação e não envia quando os campos estão vazios', async () => {
    const onSubmit = renderizar()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Informe a placa.')).toBeInTheDocument()
    expect(screen.getByText('Informe o modelo.')).toBeInTheDocument()
    expect(screen.getByText('Informe a categoria.')).toBeInTheDocument()
    expect(screen.getByText('Informe o valor da diária.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('aplica máscara na placa e envia os valores', async () => {
    const onSubmit = renderizar()

    const usuario = await preencherValido()
    expect(screen.getByLabelText('Placa')).toHaveValue('ABC-1D23')

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      placa: 'ABC-1D23',
      modelo: 'Fiat Pulse 1.3',
      categoria: 'SUV',
      valorDiaria: '189,90',
      situacao: 'DISPONIVEL',
    })
  })

  it('rejeita diária zero', async () => {
    const onSubmit = renderizar()

    const usuario = userEvent.setup()
    await usuario.type(screen.getByLabelText('Valor da diária (R$)'), '0')
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('O valor da diária deve ser maior que zero.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('mostra no campo placa o erro de duplicidade vindo da API', async () => {
    const mensagem = 'Já existe um veículo cadastrado com esta placa.'
    renderizar(vi.fn().mockRejectedValue(new ApiError(409, mensagem)))

    const usuario = await preencherValido()
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText(mensagem)).toBeInTheDocument()
  })
})
