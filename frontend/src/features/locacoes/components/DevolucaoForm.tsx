import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { FormModalBody, FormModalFooter } from '@/components/FormModal'
import { Select } from '@/components/Select'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError, mensagemDeErro } from '@/lib/http'

import type { Locacao } from '../api'
import { calcularValorFinal, dataAtualIso, formatarData, formatarMoeda } from '../formatters'
import { devolucaoSchema, type DevolucaoFormValues } from '../schema'

const SITUACOES = [
  { valor: 'DISPONIVEL', rotulo: 'Disponível' },
  { valor: 'EM_MANUTENCAO', rotulo: 'Em manutenção' },
] as const

interface Props {
  locacao: Locacao
  /** Deve rejeitar com o erro da API para que o formulário o exiba. */
  onSubmit: (valores: DevolucaoFormValues) => Promise<unknown>
  onCancel: () => void
}

export function DevolucaoForm({ locacao, onSubmit, onCancel }: Props) {
  const hoje = dataAtualIso()
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DevolucaoFormValues>({
    resolver: zodResolver(devolucaoSchema),
    defaultValues: { dataDevolucao: hoje, situacaoVeiculo: 'DISPONIVEL' },
  })

  const dataDevolucao = useWatch({ control, name: 'dataDevolucao' })
  const resumo = calcularValorFinal(locacao.dataRetirada, dataDevolucao, locacao.valorDiaria)

  const enviar = handleSubmit(async (valores) => {
    try {
      await onSubmit(valores)
    } catch (erro) {
      if (erro instanceof ApiError && erro.errosDeCampo.length > 0) {
        for (const { campo, mensagem } of erro.errosDeCampo) {
          if (campo === 'dataDevolucao' || campo === 'situacaoVeiculo') setError(campo, { message: mensagem })
        }
      } else {
        setError('root', { message: mensagemDeErro(erro) })
      }
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="flex min-h-0 flex-1 flex-col">
      <FormModalBody>
        <p className="text-sm text-muted-foreground">
          {locacao.clienteNome} · {locacao.veiculoModelo} · retirada em {formatarData(locacao.dataRetirada)} ·
          previsão {formatarData(locacao.dataPrevistaDevolucao)}
        </p>

        <Field data-invalid={!!errors.dataDevolucao}>
          <FieldLabel htmlFor="dataDevolucao">Data de devolução</FieldLabel>
          <Input
            id="dataDevolucao"
            type="date"
            min={locacao.dataRetirada}
            aria-invalid={!!errors.dataDevolucao}
            {...register('dataDevolucao')}
          />
          <FieldError errors={[errors.dataDevolucao]} />
        </Field>

        <Field data-invalid={!!errors.situacaoVeiculo}>
          <FieldLabel htmlFor="situacaoVeiculo">Situação do veículo após a devolução</FieldLabel>
          <Controller
            control={control}
            name="situacaoVeiculo"
            render={({ field }) => (
              <Select
                id="situacaoVeiculo"
                opcoes={[...SITUACOES]}
                valor={field.value}
                aoMudar={field.onChange}
                invalido={!!errors.situacaoVeiculo}
              />
            )}
          />
          <FieldError errors={[errors.situacaoVeiculo]} />
        </Field>

        {resumo && (
          <div className="flex flex-col gap-1 rounded-lg bg-muted px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor previsto</span>
              <span className="tabular-nums">{formatarMoeda(locacao.valorPrevisto)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {resumo.diarias} {resumo.diarias === 1 ? 'diária' : 'diárias'} × {formatarMoeda(locacao.valorDiaria)}
              </span>
              <span className="font-heading font-bold tabular-nums text-foreground">
                Valor final: {formatarMoeda(resumo.valorFinal)}
              </span>
            </div>
          </div>
        )}

        {errors.root && (
          <p role="alert" className="font-medium text-destructive">
            {errors.root.message}
          </p>
        )}
      </FormModalBody>

      <FormModalFooter rotuloEnviar="Registrar devolução" enviando={isSubmitting} aoCancelar={onCancel} />
    </form>
  )
}
