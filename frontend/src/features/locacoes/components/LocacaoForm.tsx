import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { FormModalBody, FormModalFooter, FormModalRow } from '@/components/FormModal'
import { SearchableSelect } from '@/components/SearchableSelect'
import { type OpcaoSelect } from '@/components/Select'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { formatarCpf } from '@/lib/formatters'
import { ApiError, mensagemDeErro } from '@/lib/http'

import type { ClienteOpcao, VeiculoOpcao } from '../api'
import { calcularValorPrevisto, dataAtualIso, formatarMoeda, formatarPlaca } from '../formatters'
import { locacaoSchema, type LocacaoFormValues } from '../schema'

interface Props {
  clientes: ClienteOpcao[]
  veiculos: VeiculoOpcao[]
  carregandoOpcoes?: boolean
  erroOpcoes?: unknown
  /** Deve rejeitar com o erro da API para que o formulário o exiba. */
  onSubmit: (valores: LocacaoFormValues) => Promise<unknown>
  onCancel: () => void
}

export function LocacaoForm({
  clientes,
  veiculos,
  carregandoOpcoes = false,
  erroOpcoes,
  onSubmit,
  onCancel,
}: Props) {
  const hoje = dataAtualIso()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LocacaoFormValues>({
    resolver: zodResolver(locacaoSchema),
    defaultValues: {
      clienteId: '',
      veiculoId: '',
      dataRetirada: hoje,
      dataPrevistaDevolucao: '',
    },
  })

  const [veiculoId, dataRetirada, dataPrevistaDevolucao] = useWatch({
    control,
    name: ['veiculoId', 'dataRetirada', 'dataPrevistaDevolucao'],
  })

  const veiculoSelecionado = veiculos.find((v) => String(v.id) === veiculoId)
  const previsao = calcularValorPrevisto(dataRetirada, dataPrevistaDevolucao, veiculoSelecionado?.valorDiaria)

  const opcoesClientes: OpcaoSelect<string>[] = clientes.map((c) => ({
    valor: String(c.id),
    rotulo: `${c.nome} — ${formatarCpf(c.cpf)}`,
  }))

  const opcoesVeiculos: OpcaoSelect<string>[] = veiculos.map((v) => ({
    valor: String(v.id),
    rotulo: `${v.modelo} (${formatarPlaca(v.placa)}) — ${formatarMoeda(v.valorDiaria)}/dia`,
  }))

  const enviar = handleSubmit(async (valores) => {
    try {
      await onSubmit(valores)
    } catch (erro) {
      if (erro instanceof ApiError && erro.errosDeCampo.length > 0) {
        for (const { campo, mensagem } of erro.errosDeCampo) {
          if (campo === 'clienteId' || campo === 'veiculoId' || campo === 'dataRetirada' || campo === 'dataPrevistaDevolucao') {
            setError(campo, { message: mensagem })
          }
        }
      } else {
        setError('root', { message: mensagemDeErro(erro) })
      }
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="flex min-h-0 flex-1 flex-col">
      <FormModalBody>
        {erroOpcoes ? (
          <p role="alert" className="font-medium text-destructive">
            {mensagemDeErro(erroOpcoes)}
          </p>
        ) : null}

        <Field data-invalid={!!errors.clienteId}>
          <FieldLabel htmlFor="clienteId">Cliente</FieldLabel>
          <Controller
            control={control}
            name="clienteId"
            render={({ field }) => (
              <SearchableSelect
                id="clienteId"
                opcoes={opcoesClientes}
                valor={field.value || undefined}
                aoMudar={field.onChange}
                placeholder={carregandoOpcoes ? 'Carregando clientes…' : 'Selecione o cliente'}
                placeholderBusca="Buscar por nome ou CPF…"
                vazio="Nenhum cliente encontrado."
                invalido={!!errors.clienteId}
              />
            )}
          />
          <FieldError errors={[errors.clienteId]} />
        </Field>

        <Field data-invalid={!!errors.veiculoId}>
          <FieldLabel htmlFor="veiculoId">Veículo disponível</FieldLabel>
          <Controller
            control={control}
            name="veiculoId"
            render={({ field }) => (
              <SearchableSelect
                id="veiculoId"
                opcoes={opcoesVeiculos}
                valor={field.value || undefined}
                aoMudar={field.onChange}
                placeholder={
                  carregandoOpcoes
                    ? 'Carregando veículos…'
                    : veiculos.length === 0
                      ? 'Nenhum veículo disponível'
                      : 'Selecione o veículo'
                }
                placeholderBusca="Buscar por modelo ou placa…"
                vazio="Nenhum veículo encontrado."
                invalido={!!errors.veiculoId}
              />
            )}
          />
          <FieldError errors={[errors.veiculoId]} />
        </Field>

        <FormModalRow>
          <Field data-invalid={!!errors.dataRetirada}>
            <FieldLabel htmlFor="dataRetirada">Data de retirada</FieldLabel>
            <Input
              id="dataRetirada"
              type="date"
              min={hoje}
              aria-invalid={!!errors.dataRetirada}
              {...register('dataRetirada')}
            />
            <FieldError errors={[errors.dataRetirada]} />
          </Field>

          <Field data-invalid={!!errors.dataPrevistaDevolucao}>
            <FieldLabel htmlFor="dataPrevistaDevolucao">Previsão de devolução</FieldLabel>
            <Input
              id="dataPrevistaDevolucao"
              type="date"
              min={dataRetirada || hoje}
              aria-invalid={!!errors.dataPrevistaDevolucao}
              {...register('dataPrevistaDevolucao')}
            />
            <FieldError errors={[errors.dataPrevistaDevolucao]} />
          </Field>
        </FormModalRow>

        {previsao && veiculoSelecionado && (
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {previsao.diarias} {previsao.diarias === 1 ? 'diária' : 'diárias'} ×{' '}
              {formatarMoeda(veiculoSelecionado.valorDiaria)}
            </span>
            <span className="font-heading font-bold tabular-nums text-foreground">
              Valor previsto: {formatarMoeda(previsao.valorPrevisto)}
            </span>
          </div>
        )}

        {errors.root && (
          <p role="alert" className="font-medium text-destructive">
            {errors.root.message}
          </p>
        )}
      </FormModalBody>

      <FormModalFooter rotuloEnviar="Registrar locação" enviando={isSubmitting} aoCancelar={onCancel} />
    </form>
  )
}
