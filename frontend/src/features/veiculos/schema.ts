import { z } from 'zod'

const PLACA = /^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/
const CATEGORIAS = ['ECONOMICO', 'HATCH', 'SEDAN', 'SUV', 'UTILITARIO']
const SITUACOES = ['DISPONIVEL', 'ALUGADO', 'EM_MANUTENCAO']

/** Converte "189,90" ou "189.90" em número. Devolve NaN se não for válido. */
export function lerValor(valor: string) {
  return Number(valor.trim().replace(',', '.'))
}

/** Mesmas regras do VeiculoRequest do backend. O backend continua sendo a validação final. */
export const veiculoSchema = z.object({
  placa: z
    .string()
    .trim()
    .min(1, 'Informe a placa.')
    .refine((v) => PLACA.test(v), 'Placa inválida. Use o padrão ABC1234 ou ABC1D23.'),
  modelo: z.string().trim().min(1, 'Informe o modelo.').max(120, 'O modelo deve ter no máximo 120 caracteres.'),
  categoria: z.string().refine((v) => CATEGORIAS.includes(v), 'Informe a categoria.'),
  valorDiaria: z
    .string()
    .min(1, 'Informe o valor da diária.')
    .refine((v) => /^\d+([.,]\d{1,2})?$/.test(v.trim()), 'Use apenas números, com no máximo 2 casas decimais.')
    .refine((v) => lerValor(v) > 0, 'O valor da diária deve ser maior que zero.'),
  situacao: z.string().refine((v) => SITUACOES.includes(v), 'Informe a situação.'),
})

export type VeiculoFormValues = z.infer<typeof veiculoSchema>
