import { useState } from 'react'

import { DataTable, type Coluna } from '@/components/DataTable'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { SearchInput } from '@/components/SearchInput'
import { useValorAtrasado } from '@/lib/useValorAtrasado'

import {
  useDisponibilidadeFrota,
  useResumoDisponibilidade,
  type CategoriaVeiculo,
  type SituacaoVeiculo,
  type Veiculo,
} from '../api'
import { ResumoDisponibilidadeCards } from '../components/ResumoDisponibilidadeCards'
import { SituacaoVeiculoBadge } from '../components/SituacaoVeiculoBadge'
import { formatarMoeda, formatarPlaca, ROTULO_CATEGORIA, ROTULO_SITUACAO } from '../formatters'

const CATEGORIAS: CategoriaVeiculo[] = ['ECONOMICO', 'HATCH', 'SEDAN', 'SUV', 'UTILITARIO']
const SITUACOES: SituacaoVeiculo[] = ['DISPONIVEL', 'ALUGADO', 'EM_MANUTENCAO']

const COLUNAS: Coluna<Veiculo>[] = [
  { cabecalho: 'Modelo', celula: (v) => v.modelo, principal: true },
  { cabecalho: 'Placa', celula: (v) => formatarPlaca(v.placa), numerica: true },
  { cabecalho: 'Categoria', celula: (v) => ROTULO_CATEGORIA[v.categoria] },
  { cabecalho: 'Diária', celula: (v) => formatarMoeda(v.valorDiaria), numerica: true },
  { cabecalho: 'Situação', celula: (v) => <SituacaoVeiculoBadge situacao={v.situacao} /> },
]

export function DisponibilidadePage() {
  const [situacao, setSituacao] = useState<SituacaoVeiculo | undefined>(undefined)
  const [categoria, setCategoria] = useState<CategoriaVeiculo | undefined>(undefined)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(0)

  const buscaAplicada = useValorAtrasado(busca.trim())
  const { data, isPending, error, refetch } = useDisponibilidadeFrota({
    situacao,
    categoria,
    busca: buscaAplicada,
    pagina,
  })
  const resumoQuery = useResumoDisponibilidade(categoria)

  const temFiltroAtivo = Boolean(situacao || categoria || buscaAplicada)
  const contagem =
    data && `${data.totalItens} ${temFiltroAtivo ? 'encontrados' : 'veículos'}`.replace(/^1 (\w+)s$/, '1 $1')

  return (
    <>
      <PageHeader titulo="Disponibilidade da frota" contagem={contagem}>
        <SearchInput
          rotulo="Buscar por placa ou modelo"
          valor={busca}
          aoMudar={(valor) => {
            setBusca(valor)
            setPagina(0)
          }}
        />

        <select
          aria-label="Filtrar por categoria"
          value={categoria ?? ''}
          onChange={(evento) => {
            const valor = evento.target.value
            setCategoria(valor ? (valor as CategoriaVeiculo) : undefined)
            setPagina(0)
          }}
          className="h-11 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((item) => (
            <option key={item} value={item}>
              {ROTULO_CATEGORIA[item]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por situação"
          value={situacao ?? ''}
          onChange={(evento) => {
            const valor = evento.target.value
            setSituacao(valor ? (valor as SituacaoVeiculo) : undefined)
            setPagina(0)
          }}
          className="h-11 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <option value="">Todas as situações</option>
          {SITUACOES.map((item) => (
            <option key={item} value={item}>
              {ROTULO_SITUACAO[item]}
            </option>
          ))}
        </select>
      </PageHeader>

      <ResumoDisponibilidadeCards
        resumo={resumoQuery.data}
        carregando={resumoQuery.isPending}
        situacaoSelecionada={situacao}
        aoSelecionarSituacao={(novaSituacao) => {
          setSituacao(novaSituacao)
          setPagina(0)
        }}
      />

      <DataTable
        colunas={COLUNAS}
        dados={data?.itens}
        chave={(veiculo) => veiculo.id}
        carregando={isPending}
        erro={error}
        aoTentarNovamente={() => {
          void refetch()
          void resumoQuery.refetch()
        }}
        vazio={
          temFiltroAtivo
            ? 'Nenhum veículo encontrado para os filtros selecionados.'
            : 'Nenhum veículo cadastrado na frota ainda.'
        }
      />

      {data && <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} aoMudar={setPagina} />}
    </>
  )
}

