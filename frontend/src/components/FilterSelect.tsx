import { ChevronDownIcon } from 'lucide-react'

interface Opcao<T extends string> {
  valor: T
  rotulo: string
}

interface Props<T extends string> {
  /** Rótulo acessível, ex.: "Filtrar por situação". */
  rotulo: string
  /** Texto da opção que remove o filtro, ex.: "Todas as situações". */
  rotuloTodos: string
  opcoes: Opcao<T>[]
  /** `undefined` quando nenhum filtro está aplicado. */
  valor: T | undefined
  aoMudar: (valor: T | undefined) => void
}

/** Filtro de lista por uma opção fixa (situação, categoria...). Fica no `PageHeader`, ao lado do `SearchInput`. */
export function FilterSelect<T extends string>({ rotulo, rotuloTodos, opcoes, valor, aoMudar }: Props<T>) {
  return (
    <div className="relative">
      <select
        aria-label={rotulo}
        value={valor ?? ''}
        onChange={(evento) => aoMudar(opcoes.find((opcao) => opcao.valor === evento.target.value)?.valor)}
        className="h-11 w-full appearance-none rounded-lg border border-input bg-card pr-9 pl-3.5 text-base text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      >
        <option value="">{rotuloTodos}</option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
