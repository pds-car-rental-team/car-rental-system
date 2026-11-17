import { toast } from 'sonner'

import { FormModal } from '@/components/FormModal'

import { useClientesParaLocacao, useRegistrarLocacao, useVeiculosDisponiveis } from '../api'
import { LocacaoForm } from './LocacaoForm'

interface Props {
  aberto: boolean
  aoFechar: () => void
}

/** Modal de registro de nova locação. Carregado sob demanda pela listagem (`lazy`). */
export default function LocacaoFormModal({ aberto, aoFechar }: Props) {
  const clientes = useClientesParaLocacao(aberto)
  const veiculos = useVeiculosDisponiveis(aberto)
  const registrar = useRegistrarLocacao()

  return (
    <FormModal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Nova locação"
      descricao="Associe cliente, veículo disponível e período para calcular o valor previsto."
    >
      <LocacaoForm
        clientes={clientes.data?.itens ?? []}
        veiculos={veiculos.data?.itens ?? []}
        carregandoOpcoes={clientes.isPending || veiculos.isPending}
        erroOpcoes={clientes.error ?? veiculos.error}
        onCancel={aoFechar}
        onSubmit={async (valores) => {
          await registrar.mutateAsync(valores)
          toast.success('Locação registrada.')
          aoFechar()
        }}
      />
    </FormModal>
  )
}
