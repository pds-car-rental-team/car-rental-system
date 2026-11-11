import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/app/layout/PageHeader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatarCpf, formatarTelefone } from '@/lib/formatters'
import { mensagemDeErro } from '@/lib/http'

import { useClientes, useExcluirCliente, type Cliente } from '../api'

/** Evita uma requisição a cada tecla digitada na busca. */
function useValorAtrasado(valor: string, atrasoMs = 300) {
  const [atrasado, setAtrasado] = useState(valor)
  useEffect(() => {
    const timer = setTimeout(() => setAtrasado(valor), atrasoMs)
    return () => clearTimeout(timer)
  }, [valor, atrasoMs])
  return atrasado
}

export function ClientesListPage() {
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(0)
  const [paraExcluir, setParaExcluir] = useState<Cliente | null>(null)

  const buscaAplicada = useValorAtrasado(busca.trim())
  const { data, isPending, error, refetch } = useClientes({ busca: buscaAplicada, pagina })
  const excluir = useExcluirCliente()

  function confirmarExclusao() {
    if (!paraExcluir) return
    excluir.mutate(paraExcluir.id, {
      onSuccess: () => toast.success('Cliente excluído.'),
      onError: (erro) => toast.error(mensagemDeErro(erro)),
      onSettled: () => setParaExcluir(null),
    })
  }

  return (
    <>
      <PageHeader titulo="Clientes" descricao="Cadastro e consulta dos clientes da locadora.">
        <Button asChild>
          <Link to="/clientes/novo">
            <PlusIcon /> Novo cliente
          </Link>
        </Button>
      </PageHeader>

      <div className="relative mb-4 max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Buscar por nome ou CPF"
          placeholder="Buscar por nome ou CPF"
          className="pl-9"
          value={busca}
          onChange={(evento) => {
            setBusca(evento.target.value)
            setPagina(0)
          }}
        />
      </div>

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead className="hidden md:table-cell">E-mail</TableHead>
              <TableHead className="hidden sm:table-cell">Telefone</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {error && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <p role="alert" className="mb-3 text-sm text-destructive">
                    {mensagemDeErro(error)}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {data?.itens.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  {buscaAplicada
                    ? `Nenhum cliente encontrado para "${buscaAplicada}".`
                    : 'Nenhum cliente cadastrado ainda.'}
                </TableCell>
              </TableRow>
            )}

            {data?.itens.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell className="tabular-nums">{formatarCpf(cliente.cpf)}</TableCell>
                <TableCell className="hidden md:table-cell">{cliente.email}</TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {formatarTelefone(cliente.telefone)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link to={`/clientes/${cliente.id}/editar`} aria-label={`Editar ${cliente.nome}`}>
                      <PencilIcon />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Excluir ${cliente.nome}`}
                    onClick={() => setParaExcluir(cliente)}
                  >
                    <Trash2Icon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.totalItens > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            {data.totalItens} {data.totalItens === 1 ? 'cliente' : 'clientes'} · página {data.pagina + 1} de{' '}
            {data.totalPaginas}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagina + 1 >= data.totalPaginas}
              onClick={() => setPagina(pagina + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={paraExcluir !== null} onOpenChange={(aberto) => !aberto && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              {paraExcluir?.nome} será removido do cadastro. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmarExclusao}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
