import { toast } from 'sonner'

import { FormModal } from '@/components/FormModal'

import { useDevolverLocacao, type Locacao } from '../api'
import { DevolucaoForm } from './DevolucaoForm'

interface Props {
  aberto: boolean
  aoFechar: () => void
  locacao: Locacao
}

/** Modal de devolução. Carregado sob demanda pela listagem (`lazy`). */
export default function DevolucaoFormModal({ aberto, aoFechar, locacao }: Props) {
  const devolver = useDevolverLocacao()

  return (
    <FormModal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Registrar devolução"
      descricao="Informe a data e a situação do veículo para encerrar a locação."
    >
      <DevolucaoForm
        locacao={locacao}
        onCancel={aoFechar}
        onSubmit={async (valores) => {
          await devolver.mutateAsync({ id: locacao.id, valores })
          toast.success('Devolução registrada.')
          aoFechar()
        }}
      />
    </FormModal>
  )
}
