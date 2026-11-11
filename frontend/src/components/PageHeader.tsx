import type { ReactNode } from 'react'

interface Props {
  titulo: string
  /** Selo ao lado do título, ex.: "24 cadastrados". */
  contagem?: string
  /** Ações da página: busca, filtros e o botão principal. */
  children?: ReactNode
}

/** Cabeçalho padrão de toda tela: título, selo de contagem e ações à direita. */
export function PageHeader({ titulo, contagem, children }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-2">
        <h1 className="font-heading text-[2rem] leading-tight font-bold tracking-[-0.03em]">{titulo}</h1>
        {contagem && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-[0.8rem] font-semibold text-accent-foreground">
            {contagem}
          </span>
        )}
      </div>
      {children && <div className="flex flex-1 basis-[26rem] flex-wrap justify-end gap-3">{children}</div>}
    </header>
  )
}
