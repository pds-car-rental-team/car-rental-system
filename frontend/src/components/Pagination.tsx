import { Button } from '@/components/ui/button'

interface Props {
  /** Página atual, começando em 0 (como a API devolve). */
  pagina: number
  totalPaginas: number
  aoMudar: (pagina: number) => void
}

/** Rodapé de paginação das listagens. Não aparece quando não há páginas. */
export function Pagination({ pagina, totalPaginas, aoMudar }: Props) {
  if (totalPaginas === 0) return null

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
      <span>
        Página {pagina + 1} de {totalPaginas}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" disabled={pagina === 0} onClick={() => aoMudar(pagina - 1)}>
          Anterior
        </Button>
        <Button variant="outline" disabled={pagina + 1 >= totalPaginas} onClick={() => aoMudar(pagina + 1)}>
          Próxima
        </Button>
      </div>
    </footer>
  )
}
