import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/http'

import { ClienteForm } from './ClienteForm'

function renderizar(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <MemoryRouter>
      <ClienteForm rotuloEnviar="Cadastrar" onSubmit={onSubmit} />
    </MemoryRouter>,
  )
  return onSubmit
}

async function preencherValido() {
  const usuario = userEvent.setup()
  await usuario.type(screen.getByLabelText('Nome completo'), 'Maria da Silva')
  await usuario.type(screen.getByLabelText('CPF'), '52998224725')
  await usuario.type(screen.getByLabelText('Telefone'), '34999990000')
  await usuario.type(screen.getByLabelText('E-mail'), 'maria@exemplo.com')
  return usuario
}

describe('ClienteForm', () => {
  it('exibe erros de validação e não envia quando os campos estão vazios', async () => {
    const onSubmit = renderizar()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe o CPF.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('aplica máscaras durante a digitação e envia os valores', async () => {
    const onSubmit = renderizar()

    const usuario = await preencherValido()
    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25')
    expect(screen.getByLabelText('Telefone')).toHaveValue('(34) 99999-0000')

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      nome: 'Maria da Silva',
      cpf: '529.982.247-25',
      telefone: '(34) 99999-0000',
      email: 'maria@exemplo.com',
    })
  })

  it('mostra no campo CPF o erro de duplicidade vindo da API', async () => {
    const mensagem = 'Já existe um cliente cadastrado com este CPF.'
    renderizar(vi.fn().mockRejectedValue(new ApiError(409, mensagem)))

    const usuario = await preencherValido()
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(await screen.findByText(mensagem)).toBeInTheDocument()
  })
})
