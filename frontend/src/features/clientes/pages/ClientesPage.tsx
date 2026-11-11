import { PlusIcon } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable, type Coluna } from '@/components/DataTable'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { BotaoEditar, BotaoExcluir } from '@/components/RowActions'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { formatarCpf, formatarTelefone } from '@/lib/formatters'
import { mensagemDeErro } from '@/lib/http'
import { useValorAtrasado } from '@/lib/useValorAtrasado'

import { useClientes, useExcluirCliente, type Cliente } from '../api'

// O formulário só é baixado quando o usuário abre o painel pela primeira vez.
const ClienteFormSheet = lazy(() => import('../components/ClienteFormSheet'))

const COLUNAS: Coluna<Cliente>[] = [
  { cabecalho: 'Nome', celula: (c) => c.nome, principal: true },
  { cabecalho: 'CPF', celula: (c) => formatarCpf(c.cpf), numerica: true },
  { cabecalho: 'E-mail', celula: (c) => c.email },
  { cabecalho: 'Telefone', celula: (c) => formatarTelefone(c.telefone), numerica: true },
]

/** `sessao` muda a cada abertura para o formulário sempre começar limpo. */
interface PainelFormulario {
  sessao: number
  aberto: boolean
  cliente: Cliente | null
}

export function ClientesPage() {
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(0)
  const [painel, setPainel] = useState<PainelFormulario | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Cliente | null>(null)

  const buscaAplicada = useValorAtrasado(busca.trim())
  const { data, isPending, error, refetch } = useClientes({ busca: buscaAplicada, pagina })
  const excluir = useExcluirCliente()

  function abrirPainel(cliente: Cliente | null) {
    setPainel((atual) => ({ sessao: (atual?.sessao ?? 0) + 1, aberto: true, cliente }))
  }

  function confirmarExclusao() {
    if (!paraExcluir) return
    excluir.mutate(paraExcluir.id, {
      onSuccess: () => toast.success('Cliente excluído.'),
      onError: (erro) => toast.error(mensagemDeErro(erro)),
    })
    setParaExcluir(null)
  }

  const contagem =
    data && `${data.totalItens} ${buscaAplicada ? 'encontrados' : 'cadastrados'}`.replace(/^1 (\w+)s$/, '1 $1')

  return (
    <>
      <PageHeader titulo="Clientes" contagem={contagem}>
        <SearchInput
          rotulo="Buscar por nome ou CPF"
          valor={busca}
          aoMudar={(valor) => {
            setBusca(valor)
            setPagina(0)
          }}
        />
        <Button onClick={() => abrirPainel(null)}>
          <PlusIcon /> Novo cliente
        </Button>
      </PageHeader>

      <DataTable
        colunas={COLUNAS}
        dados={data?.itens}
        chave={(cliente) => cliente.id}
        carregando={isPending}
        erro={error}
        aoTentarNovamente={() => refetch()}
        vazio={
          buscaAplicada ? `Nenhum cliente encontrado para "${buscaAplicada}".` : 'Nenhum cliente cadastrado ainda.'
        }
        acoes={(cliente) => (
          <>
            <BotaoEditar rotulo={`Editar ${cliente.nome}`} onClick={() => abrirPainel(cliente)} />
            <BotaoExcluir rotulo={`Excluir ${cliente.nome}`} onClick={() => setParaExcluir(cliente)} />
          </>
        )}
      />

      {data && <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} aoMudar={setPagina} />}

      {painel && (
        <Suspense fallback={null}>
          <ClienteFormSheet
            key={painel.sessao}
            aberto={painel.aberto}
            cliente={painel.cliente}
            aoFechar={() => setPainel((atual) => atual && { ...atual, aberto: false })}
          />
        </Suspense>
      )}

      <ConfirmDialog
        aberto={paraExcluir !== null}
        aoFechar={() => setParaExcluir(null)}
        titulo="Excluir cliente?"
        rotuloConfirmar="Excluir"
        aoConfirmar={confirmarExclusao}
      >
        <strong>{paraExcluir?.nome}</strong> será removido do cadastro. Esta ação não pode ser desfeita.
      </ConfirmDialog>
    </>
  )
}
