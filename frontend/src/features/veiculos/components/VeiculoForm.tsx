import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { FormModalBody, FormModalFooter, FormModalRow } from '@/components/FormModal'
import { Select } from '@/components/Select'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError, mensagemDeErro } from '@/lib/http'

import type { CategoriaVeiculo, SituacaoVeiculo } from '../api'
import { formatarPlaca, ROTULO_CATEGORIA, ROTULO_SITUACAO } from '../formatters'
import { veiculoSchema, type VeiculoFormValues } from '../schema'

const VAZIO: VeiculoFormValues = { placa: '', modelo: '', categoria: '', valorDiaria: '', situacao: 'DISPONIVEL' }

const CATEGORIAS = (Object.keys(ROTULO_CATEGORIA) as CategoriaVeiculo[]).map((valor) => ({
  valor,
  rotulo: ROTULO_CATEGORIA[valor],
}))
const SITUACOES = (Object.keys(ROTULO_SITUACAO) as SituacaoVeiculo[]).map((valor) => ({
  valor,
  rotulo: ROTULO_SITUACAO[valor],
}))

interface Props {
  valoresIniciais?: VeiculoFormValues
  rotuloEnviar: string
  /** Deve rejeitar com o erro da API para que o formulário o exiba. */
  onSubmit: (valores: VeiculoFormValues) => Promise<unknown>
  onCancel: () => void
}

export function VeiculoForm({ valoresIniciais = VAZIO, rotuloEnviar, onSubmit, onCancel }: Props) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VeiculoFormValues>({ resolver: zodResolver(veiculoSchema), defaultValues: valoresIniciais })

  const enviar = handleSubmit(async (valores) => {
    try {
      await onSubmit(valores)
    } catch (erro) {
      if (erro instanceof ApiError && erro.errosDeCampo.length > 0) {
        for (const { campo, mensagem } of erro.errosDeCampo) {
          if (campo in VAZIO) setError(campo as keyof VeiculoFormValues, { message: mensagem })
        }
      } else if (erro instanceof ApiError && erro.status === 409) {
        setError('placa', { message: erro.message }, { shouldFocus: true })
      } else {
        setError('root', { message: mensagemDeErro(erro) })
      }
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="flex min-h-0 flex-1 flex-col">
      <FormModalBody>
        <FormModalRow>
          <Field data-invalid={!!errors.placa}>
            <FieldLabel htmlFor="placa">Placa</FieldLabel>
            <Input
              id="placa"
              placeholder="ABC-1D23"
              autoComplete="off"
              aria-invalid={!!errors.placa}
              {...register('placa', {
                onChange: (evento) => setValue('placa', formatarPlaca(evento.target.value)),
              })}
            />
            <FieldError errors={[errors.placa]} />
          </Field>

          <Field data-invalid={!!errors.valorDiaria}>
            <FieldLabel htmlFor="valorDiaria">Valor da diária (R$)</FieldLabel>
            <Input
              id="valorDiaria"
              inputMode="decimal"
              placeholder="189,90"
              autoComplete="off"
              aria-invalid={!!errors.valorDiaria}
              {...register('valorDiaria')}
            />
            <FieldError errors={[errors.valorDiaria]} />
          </Field>
        </FormModalRow>

        <Field data-invalid={!!errors.modelo}>
          <FieldLabel htmlFor="modelo">Modelo</FieldLabel>
          <Input id="modelo" autoComplete="off" aria-invalid={!!errors.modelo} {...register('modelo')} />
          <FieldError errors={[errors.modelo]} />
        </Field>

        <FormModalRow>
          <Field data-invalid={!!errors.categoria}>
            <FieldLabel htmlFor="categoria">Categoria</FieldLabel>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <Select
                  id="categoria"
                  opcoes={CATEGORIAS}
                  valor={(field.value || undefined) as CategoriaVeiculo | undefined}
                  aoMudar={field.onChange}
                  invalido={!!errors.categoria}
                />
              )}
            />
            <FieldError errors={[errors.categoria]} />
          </Field>

          <Field data-invalid={!!errors.situacao}>
            <FieldLabel htmlFor="situacao">Situação</FieldLabel>
            <Controller
              control={control}
              name="situacao"
              render={({ field }) => (
                <Select
                  id="situacao"
                  opcoes={SITUACOES}
                  valor={(field.value || undefined) as SituacaoVeiculo | undefined}
                  aoMudar={field.onChange}
                  invalido={!!errors.situacao}
                />
              )}
            />
            <FieldError errors={[errors.situacao]} />
          </Field>
        </FormModalRow>

        {errors.root && (
          <p role="alert" className="font-medium text-destructive">
            {errors.root.message}
          </p>
        )}
      </FormModalBody>

      <FormModalFooter rotuloEnviar={rotuloEnviar} enviando={isSubmitting} aoCancelar={onCancel} />
    </form>
  )
}
