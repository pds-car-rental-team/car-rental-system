import { PlusIcon } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog.tsx'
import { DataTable, type Coluna } from '@/components/DataTable.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { Pagination } from '@/components/Pagination.tsx'
import { BotaoEditar, BotaoExcluir } from '@/components/RowActions.tsx'
import { SearchInput } from '@/components/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { mensagemDeErro } from '@/lib/http.ts'
import { useValorAtrasado } from '@/lib/useValorAtrasado.ts'

import { useExcluirVeiculo, useVeiculos, type Veiculo } from '../api.ts'
import { SituacaoVeiculoBadge } from '../components/SituacaoVeiculoBadge.tsx'
import { formatarMoeda, formatarPlaca, ROTULO_CATEGORIA } from '../formatters.ts'

// O formulário só é baixado quando o usuário abre o modal pela primeira vez.
const VeiculoFormModal = lazy(() => import('../components/VeiculoFormModal.tsx'))

const COLUNAS: Coluna<Veiculo>[] = [
  { cabecalho: 'Modelo', celula: (v) => v.modelo, principal: true },
  { cabecalho: 'Placa', celula: (v) => formatarPlaca(v.placa), numerica: true, largura: 'w-36' },
  { cabecalho: 'Categoria', celula: (v) => ROTULO_CATEGORIA[v.categoria], largura: 'w-40' },
  { cabecalho: 'Diária', celula: (v) => formatarMoeda(v.valorDiaria), numerica: true, largura: 'w-36' },
  { cabecalho: 'Situação', celula: (v) => <SituacaoVeiculoBadge situacao={v.situacao} />, largura: 'w-44' },
]

/** `sessao` muda a cada abertura para o formulário sempre começar limpo. */
interface ModalFormulario {
  sessao: number
  aberto: boolean
  veiculo: Veiculo | null
}

export function VeiculosPage() {
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(0)
  const [modal, setModal] = useState<ModalFormulario | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Veiculo | null>(null)

  const buscaAplicada = useValorAtrasado(busca.trim())
  const { data, isPending, error, refetch } = useVeiculos({ busca: buscaAplicada, pagina })
  const excluir = useExcluirVeiculo()

  function abrirModal(veiculo: Veiculo | null) {
    setModal((atual) => ({ sessao: (atual?.sessao ?? 0) + 1, aberto: true, veiculo }))
  }

  function confirmarExclusao() {
    if (!paraExcluir) return
    excluir.mutate(paraExcluir.id, {
      onSuccess: () => toast.success('Veículo excluído.'),
      onError: (erro) => toast.error(mensagemDeErro(erro)),
    })
    setParaExcluir(null)
  }

  const contagem =
    data && `${data.totalItens} ${buscaAplicada ? 'encontrados' : 'cadastrados'}`.replace(/^1 (\w+)s$/, '1 $1')

  return (
    <>
      <PageHeader titulo="Veículos" contagem={contagem}>
        <SearchInput
          rotulo="Buscar por placa ou modelo"
          valor={busca}
          aoMudar={(valor) => {
            setBusca(valor)
            setPagina(0)
          }}
        />
        <Button onClick={() => abrirModal(null)}>
          <PlusIcon /> Novo veículo
        </Button>
      </PageHeader>

      <DataTable
        colunas={COLUNAS}
        dados={data?.itens}
        chave={(veiculo) => veiculo.id}
        carregando={isPending}
        erro={error}
        aoTentarNovamente={() => refetch()}
        vazio={
          buscaAplicada ? `Nenhum veículo encontrado para "${buscaAplicada}".` : 'Nenhum veículo cadastrado ainda.'
        }
        acoes={(veiculo) => (
          <>
            <BotaoEditar
              rotulo={`Editar ${veiculo.modelo} ${formatarPlaca(veiculo.placa)}`}
              onClick={() => abrirModal(veiculo)}
            />
            <BotaoExcluir
              rotulo={`Excluir ${veiculo.modelo} ${formatarPlaca(veiculo.placa)}`}
              onClick={() => setParaExcluir(veiculo)}
            />
          </>
        )}
      />

      {data && <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} aoMudar={setPagina} />}

      {modal && (
        <Suspense fallback={null}>
          <VeiculoFormModal
            key={modal.sessao}
            aberto={modal.aberto}
            veiculo={modal.veiculo}
            aoFechar={() => setModal((atual) => atual && { ...atual, aberto: false })}
          />
        </Suspense>
      )}

      <ConfirmDialog
        aberto={paraExcluir !== null}
        aoFechar={() => setParaExcluir(null)}
        titulo="Excluir veículo?"
        rotuloConfirmar="Excluir"
        aoConfirmar={confirmarExclusao}
      >
        <strong>{paraExcluir?.modelo}</strong> ({paraExcluir && formatarPlaca(paraExcluir.placa)}) será removido
        da frota. Esta ação não pode ser desfeita.
      </ConfirmDialog>
    </>
  )
}
