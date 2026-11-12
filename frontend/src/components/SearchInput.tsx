import { SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface Props {
  /** Texto do placeholder e do rótulo acessível, ex.: "Buscar por nome ou CPF". */
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
}

/** Campo de busca padrão das listagens. Use junto com `useValorAtrasado` para não chamar a API a cada tecla. */
export function SearchInput({ rotulo, valor, aoMudar }: Props) {
  return (
    <div className="relative max-w-[21rem] flex-1 basis-52">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={rotulo}
        placeholder={rotulo}
        className="pl-10"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
      />
    </div>
  )
}
