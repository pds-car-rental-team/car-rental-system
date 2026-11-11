import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="font-heading text-[2rem] font-bold tracking-[-0.03em]">Página não encontrada</h1>
      <p className="mt-2 text-muted-foreground">O endereço acessado não existe.</p>
      <Button className="mt-6" asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
