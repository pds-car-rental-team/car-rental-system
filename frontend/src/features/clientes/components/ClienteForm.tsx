import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { FormModalBody, FormModalFooter, FormModalRow } from '@/components/FormModal'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { formatarCpf, formatarTelefone } from '@/lib/formatters'
import { ApiError, mensagemDeErro } from '@/lib/http'

import { clienteSchema, type ClienteFormValues } from '../schema'

const VAZIO: ClienteFormValues = { nome: '', cpf: '', email: '', telefone: '' }

interface Props {
  valoresIniciais?: ClienteFormValues
  rotuloEnviar: string
  /** Deve rejeitar com o erro da API para que o formulário o exiba. */
  onSubmit: (valores: ClienteFormValues) => Promise<unknown>
  onCancel: () => void
}

export function ClienteForm({ valoresIniciais = VAZIO, rotuloEnviar, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({ resolver: zodResolver(clienteSchema), defaultValues: valoresIniciais })

  const enviar = handleSubmit(async (valores) => {
    try {
      await onSubmit(valores)
    } catch (erro) {
      if (erro instanceof ApiError && erro.errosDeCampo.length > 0) {
        for (const { campo, mensagem } of erro.errosDeCampo) {
          if (campo in VAZIO) setError(campo as keyof ClienteFormValues, { message: mensagem })
        }
      } else if (erro instanceof ApiError && erro.status === 409) {
        setError('cpf', { message: erro.message }, { shouldFocus: true })
      } else {
        setError('root', { message: mensagemDeErro(erro) })
      }
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="flex min-h-0 flex-1 flex-col">
      <FormModalBody>
        <Field data-invalid={!!errors.nome}>
          <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
          <Input id="nome" autoComplete="off" aria-invalid={!!errors.nome} {...register('nome')} />
          <FieldError errors={[errors.nome]} />
        </Field>

        <FormModalRow>
          <Field data-invalid={!!errors.cpf}>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <Input
              id="cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              autoComplete="off"
              aria-invalid={!!errors.cpf}
              {...register('cpf', {
                onChange: (evento) => setValue('cpf', formatarCpf(evento.target.value)),
              })}
            />
            <FieldError errors={[errors.cpf]} />
          </Field>

          <Field data-invalid={!!errors.telefone}>
            <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
            <Input
              id="telefone"
              type="tel"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              autoComplete="off"
              aria-invalid={!!errors.telefone}
              {...register('telefone', {
                onChange: (evento) => setValue('telefone', formatarTelefone(evento.target.value)),
              })}
            />
            <FieldError errors={[errors.telefone]} />
          </Field>
        </FormModalRow>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" type="email" autoComplete="off" aria-invalid={!!errors.email} {...register('email')} />
          <FieldError errors={[errors.email]} />
        </Field>

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
