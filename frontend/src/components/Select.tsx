import { Select as SelectBase, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface OpcaoSelect<T extends string> {
  valor: T
  rotulo: string
}

interface Props<T extends string> {
  opcoes: OpcaoSelect<T>[]
  /** `undefined` enquanto nada foi escolhido (mostra o `placeholder`). */
  valor: T | undefined
  aoMudar: (valor: T) => void
  placeholder?: string
  /** Em formulário: o mesmo `id` usado no `FieldLabel`. */
  id?: string
  /** Fora de formulário (sem `FieldLabel`): rótulo acessível, ex.: "Filtrar por categoria". */
  rotulo?: string
  /** Marca o campo com erro de validação. */
  invalido?: boolean
  /** Classe de largura. Sem ela, ocupa a largura do contêiner (padrão dos formulários). */
  className?: string
}

/**
 * Lista de seleção padrão do sistema. Use sempre este bloco no lugar do `<select>` do HTML:
 * em formulários (dentro de um `Field`) e, para filtros de listagem, por meio do `FilterSelect`.
 */
export function Select<T extends string>({
  opcoes,
  valor,
  aoMudar,
  placeholder = 'Selecione',
  id,
  rotulo,
  invalido,
  className,
}: Props<T>) {
  return (
    <SelectBase value={valor ?? ''} onValueChange={(novo) => aoMudar(novo as T)}>
      <SelectTrigger id={id} aria-label={rotulo} aria-invalid={invalido || undefined} className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {opcoes.map((opcao) => (
          <SelectItem key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectBase>
  )
}
