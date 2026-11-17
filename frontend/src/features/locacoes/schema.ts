import { z } from 'zod'

import { dataAtualIso } from './formatters'

export const locacaoSchema = z
  .object({
    clienteId: z.string().min(1, 'Selecione o cliente.'),
    veiculoId: z.string().min(1, 'Selecione o veículo.'),
    dataRetirada: z.string().min(1, 'Informe a data de retirada.'),
    dataPrevistaDevolucao: z.string().min(1, 'Informe a data prevista de devolução.'),
  })
  .superRefine((dados, ctx) => {
    if (dados.dataRetirada && dados.dataRetirada < dataAtualIso()) {
      ctx.addIssue({
        code: 'custom',
        path: ['dataRetirada'],
        message: 'A data de retirada não pode ser anterior à data atual.',
      })
    }
    if (dados.dataRetirada && dados.dataPrevistaDevolucao && dados.dataPrevistaDevolucao < dados.dataRetirada) {
      ctx.addIssue({
        code: 'custom',
        path: ['dataPrevistaDevolucao'],
        message: 'A data prevista de devolução não pode ser anterior à data de retirada.',
      })
    }
  })

export type LocacaoFormValues = z.infer<typeof locacaoSchema>
