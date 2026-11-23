import { PlusIcon } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'

import { DataTable, type Coluna } from '@/components/DataTable'
import { FilterSelect } from '@/components/FilterSelect'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { useValorAtrasado } from '@/lib/useValorAtrasado'

import { useLocacoes, type FiltroStatusLocacao, type Locacao } from '../api'
import { StatusLocacaoBadge } from '../components/StatusLocacaoBadge'
import { formatarData, formatarMoeda, formatarPlaca, ROTULO_FILTRO_STATUS } from '../formatters'

// Os formulários só são baixados quando o usuário abre o modal pela primeira vez.
const LocacaoFormModal = lazy(() => import('../components/LocacaoFormModal'))
const DevolucaoFormModal = lazy(() => import('../components/DevolucaoFormModal'))

const OPCOES_STATUS = (Object.keys(ROTULO_FILTRO_STATUS) as FiltroStatusLocacao[]).map((valor) => ({
  valor,
  rotulo: ROTULO_FILTRO_STATUS[valor],
}))

const COLUNAS: Coluna<Locacao>[] = [
  { cabecalho: 'Cliente', celula: (l) => l.clienteNome, principal: true },
  { cabecalho: 'Veículo', celula: (l) => `${l.veiculoModelo} (${formatarPlaca(l.veiculoPlaca)})` },
  { cabecalho: 'Retirada', celula: (l) => formatarData(l.dataRetirada), numerica: true, largura: 'w-32' },
  {
    cabecalho: 'Devolução',
    celula: (l) => {
      if (l.status === 'FINALIZADA' && l.dataDevolucao) {
        return formatarData(l.dataDevolucao)
      }
      if (l.status === 'CANCELADA') {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <span>
          {formatarData(l.dataPrevistaDevolucao)}{' '}
          <span className="text-xs text-muted-foreground">(prev.)</span>
        </span>
      )
    },
    numerica: true,
    largura: 'w-40',
  },
  {
    cabecalho: 'Valor',
    celula: (l) => formatarMoeda(l.valorFinal ?? l.valorPrevisto),
    numerica: true,
    largura: 'w-36',
  },
  {
    cabecalho: 'Status',
    celula: (l) => <StatusLocacaoBadge status={l.status} atrasada={l.atrasada} />,
    largura: 'w-32',
  },
]

interface ModalFormulario {
  sessao: number
  aberto: boolean
}

interface ModalDevolucao {
  sessao: number
  aberto: boolean
  locacao: Locacao
}

function mensagemListaVazia(busca: string, status: FiltroStatusLocacao | undefined) {
  if (busca && status) {
    return `Nenhuma locação encontrada para "${busca}" com o status selecionado.`
  }
  if (busca) {
    return `Nenhuma locação encontrada para "${busca}".`
  }
  if (status) {
    return 'Nenhuma locação encontrada com este status.'
  }
  return 'Nenhuma locação registrada ainda.'
}

export function LocacoesPage() {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<FiltroStatusLocacao | undefined>(undefined)
  const [pagina, setPagina] = useState(0)
  const [modal, setModal] = useState<ModalFormulario | null>(null)
  const [devolucao, setDevolucao] = useState<ModalDevolucao | null>(null)

  const buscaAplicada = useValorAtrasado(busca.trim())
  const { data, isPending, error, refetch } = useLocacoes({ status, busca: buscaAplicada, pagina })

  function abrirModal() {
    setModal((atual) => ({ sessao: (atual?.sessao ?? 0) + 1, aberto: true }))
  }

  function abrirDevolucao(locacao: Locacao) {
    setDevolucao((atual) => ({ sessao: (atual?.sessao ?? 0) + 1, aberto: true, locacao }))
  }

  const possuiFiltro = Boolean(status || buscaAplicada)
  const contagem =
    data && `${data.totalItens} ${possuiFiltro ? 'encontradas' : 'registradas'}`.replace(/^1 (\w+)s$/, '1 $1')

  return (
    <>
      <PageHeader titulo="Locações" contagem={contagem}>
        <SearchInput
          rotulo="Buscar por cliente, placa ou modelo"
          valor={busca}
          aoMudar={(valor) => {
            setBusca(valor)
            setPagina(0)
          }}
        />
        <FilterSelect<FiltroStatusLocacao>
          rotulo="Filtrar por status"
          rotuloTodos="Todos os status"
          opcoes={OPCOES_STATUS}
          valor={status}
          aoMudar={(novo) => {
            setStatus(novo)
            setPagina(0)
          }}
        />
        <Button onClick={abrirModal}>
          <PlusIcon /> Nova locação
        </Button>
      </PageHeader>

      <DataTable
        colunas={COLUNAS}
        dados={data?.itens}
        chave={(locacao) => locacao.id}
        carregando={isPending}
        erro={error}
        aoTentarNovamente={() => refetch()}
        vazio={mensagemListaVazia(buscaAplicada, status)}
        acoes={(locacao) =>
          locacao.status === 'ABERTA' ? (
            <Button
              variant="outline"
              size="sm"
              aria-label={`Devolver ${locacao.veiculoModelo} (${formatarPlaca(locacao.veiculoPlaca)})`}
              onClick={() => abrirDevolucao(locacao)}
            >
              Devolver
            </Button>
          ) : null
        }
      />

      {data && <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} aoMudar={setPagina} />}

      {modal && (
        <Suspense fallback={null}>
          <LocacaoFormModal
            key={modal.sessao}
            aberto={modal.aberto}
            aoFechar={() => setModal((atual) => atual && { ...atual, aberto: false })}
          />
        </Suspense>
      )}

      {devolucao && (
        <Suspense fallback={null}>
          <DevolucaoFormModal
            key={devolucao.sessao}
            aberto={devolucao.aberto}
            locacao={devolucao.locacao}
            aoFechar={() => setDevolucao((atual) => atual && { ...atual, aberto: false })}
          />
        </Suspense>
      )}
    </>
  )
}
