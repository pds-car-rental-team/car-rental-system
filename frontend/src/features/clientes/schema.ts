import { z } from 'zod'

import { apenasDigitos, cpfValido } from '@/lib/formatters'

/** Mesmas regras do ClienteRequest do backend. O backend continua sendo a validação final. */
export const clienteSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(120, 'O nome deve ter no máximo 120 caracteres.'),
  cpf: z.string().min(1, 'Informe o CPF.').refine(cpfValido, 'CPF inválido.'),
  email: z.string().trim().min(1, 'Informe o e-mail.').max(254).pipe(z.email('E-mail inválido.')),
  telefone: z
    .string()
    .min(1, 'Informe o telefone.')
    .refine((valor) => [10, 11].includes(apenasDigitos(valor).length), 'Telefone inválido. Informe DDD e número.'),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>
