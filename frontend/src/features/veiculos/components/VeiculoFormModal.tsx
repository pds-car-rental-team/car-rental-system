import { toast } from 'sonner'

import { FormModal } from '@/components/FormModal'

import { useSalvarVeiculo, type Veiculo } from '../api'
import { formatarPlaca } from '../formatters'
import { VeiculoForm } from './VeiculoForm'

interface Props {
  aberto: boolean
  aoFechar: () => void
  /** Veículo em edição; `null` para cadastrar um novo. */
  veiculo: Veiculo | null
}

/** Modal de cadastro e edição de veículo. Carregado sob demanda pela listagem (`lazy`). */
export default function VeiculoFormModal({ aberto, aoFechar, veiculo }: Props) {
  const salvar = useSalvarVeiculo()

  return (
    <FormModal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={veiculo ? 'Editar veículo' : 'Novo veículo'}
      descricao="Dados do veículo e situação atual na frota."
    >
      <VeiculoForm
        valoresIniciais={
          veiculo
            ? {
              placa: formatarPlaca(veiculo.placa),
              modelo: veiculo.modelo,
              categoria: veiculo.categoria,
              valorDiaria: veiculo.valorDiaria.toFixed(2).replace('.', ','),
              situacao: veiculo.situacao,
            }
            : undefined
        }
        rotuloEnviar={veiculo ? 'Salvar alterações' : 'Cadastrar veículo'}
        onCancel={aoFechar}
        onSubmit={async (valores) => {
          await salvar.mutateAsync({ id: veiculo?.id, valores })
          toast.success(veiculo ? 'Veículo atualizado.' : 'Veículo cadastrado.')
          aoFechar()
        }}
      />
    </FormModal>
  )
}
