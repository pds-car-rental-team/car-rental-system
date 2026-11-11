import { toast } from 'sonner'

import { FormModal } from '@/components/FormModal'
import { formatarCpf, formatarTelefone } from '@/lib/formatters'

import { useSalvarCliente, type Cliente } from '../api'
import { ClienteForm } from './ClienteForm'

interface Props {
  aberto: boolean
  aoFechar: () => void
  /** Cliente em edição; `null` para cadastrar um novo. */
  cliente: Cliente | null
}

/** Modal de cadastro e edição de cliente. Carregado sob demanda pela listagem (`lazy`). */
export default function ClienteFormModal({ aberto, aoFechar, cliente }: Props) {
  const salvar = useSalvarCliente()

  return (
    <FormModal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={cliente ? 'Editar cliente' : 'Novo cliente'}
      descricao="Dados de identificação e contato do cliente."
    >
      <ClienteForm
        valoresIniciais={
          cliente
            ? {
                nome: cliente.nome,
                cpf: formatarCpf(cliente.cpf),
                email: cliente.email,
                telefone: formatarTelefone(cliente.telefone),
              }
            : undefined
        }
        rotuloEnviar={cliente ? 'Salvar alterações' : 'Cadastrar cliente'}
        onCancel={aoFechar}
        onSubmit={async (valores) => {
          await salvar.mutateAsync({ id: cliente?.id, valores })
          toast.success(cliente ? 'Cliente atualizado.' : 'Cliente cadastrado.')
          aoFechar()
        }}
      />
    </FormModal>
  )
}
