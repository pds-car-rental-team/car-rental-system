import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/app/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatarCpf, formatarTelefone } from '@/lib/formatters'
import { mensagemDeErro } from '@/lib/http'

import { useAtualizarCliente, useCliente } from '../api'
import { ClienteForm } from '../components/ClienteForm'

export function ClienteEditarPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: cliente, isPending, error } = useCliente(id)
  const atualizar = useAtualizarCliente(id)

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader titulo="Editar cliente" descricao={cliente?.nome} />
      <Card>
        <CardContent>
          {isPending && (
            <div className="space-y-5" aria-busy="true" aria-label="Carregando cliente">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          )}

          {error && (
            <div className="space-y-4 py-6 text-center">
              <p role="alert" className="text-sm text-destructive">
                {mensagemDeErro(error)}
              </p>
              <Button variant="outline" asChild>
                <Link to="/clientes">Voltar para clientes</Link>
              </Button>
            </div>
          )}

          {cliente && (
            <ClienteForm
              valoresIniciais={{
                nome: cliente.nome,
                cpf: formatarCpf(cliente.cpf),
                email: cliente.email,
                telefone: formatarTelefone(cliente.telefone),
              }}
              rotuloEnviar="Salvar alterações"
              onSubmit={async (valores) => {
                await atualizar.mutateAsync(valores)
                toast.success('Cliente atualizado.')
                navigate('/clientes')
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
