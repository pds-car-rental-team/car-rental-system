import { PencilIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  /** Rótulo acessível, ex.: "Editar Maria da Silva". */
  rotulo: string
  onClick: () => void
}

/** Ação de editar da linha de uma tabela: sempre o ícone de lápis. */
export function BotaoEditar({ rotulo, onClick }: Props) {
  return (
    <Button variant="ghost" size="icon" aria-label={rotulo} title="Editar" onClick={onClick}>
      <PencilIcon />
    </Button>
  )
}

/** Ação de excluir da linha de uma tabela: sempre a lixeira vermelha (ação destrutiva). */
export function BotaoExcluir({ rotulo, onClick }: Props) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={rotulo}
      title="Excluir"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={onClick}
    >
      <Trash2Icon />
    </Button>
  )
}
