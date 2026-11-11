import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/app/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'

import { useCriarCliente } from '../api'
import { ClienteForm } from '../components/ClienteForm'

export function ClienteNovoPage() {
  const navigate = useNavigate()
  const criar = useCriarCliente()

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader titulo="Novo cliente" descricao="Preencha os dados de identificação e contato." />
      <Card>
        <CardContent>
          <ClienteForm
            rotuloEnviar="Cadastrar cliente"
            onSubmit={async (valores) => {
              await criar.mutateAsync(valores)
              toast.success('Cliente cadastrado.')
              navigate('/clientes')
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
