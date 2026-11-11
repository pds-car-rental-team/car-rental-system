import type { ReactNode } from 'react'

interface Props {
  titulo: string
  descricao?: string
  /** Ações da página (ex.: botão "Novo"). */
  children?: ReactNode
}

/** Cabeçalho padrão de todas as telas: use sempre este componente para manter a consistência. */
export function PageHeader({ titulo, descricao, children }: Props) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {children}
    </header>
  )
}
