import { Select, type OpcaoSelect } from '@/components/Select'

const TODOS = '__todos__'

interface Props<T extends string> {
  /** Rótulo acessível, ex.: "Filtrar por categoria". */
  rotulo: string
  /** Texto da opção que remove o filtro, ex.: "Todas as categorias". */
  rotuloTodos: string
  opcoes: OpcaoSelect<T>[]
  /** `undefined` quando nenhum filtro está aplicado. */
  valor: T | undefined
  aoMudar: (valor: T | undefined) => void
}

/**
 * Filtro de listagem por uma opção fixa (situação, categoria...). Fica no `PageHeader`, ao lado do `SearchInput`.
 * Tem largura fixa para o cabeçalho não se mexer quando a opção escolhida muda.
 */
export function FilterSelect<T extends string>({ rotulo, rotuloTodos, opcoes, valor, aoMudar }: Props<T>) {
  return (
    <Select<T | typeof TODOS>
      rotulo={rotulo}
      opcoes={[{ valor: TODOS, rotulo: rotuloTodos }, ...opcoes]}
      valor={valor ?? TODOS}
      aoMudar={(novo) => aoMudar(novo === TODOS ? undefined : novo)}
      className="w-full sm:w-52"
    />
  )
}
