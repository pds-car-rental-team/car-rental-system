import type { ReactNode } from 'react'

import { Tooltip as TooltipBase, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  /** Texto curto que explica o elemento, ex.: "Editar". */
  texto: string
  lado?: 'top' | 'right' | 'bottom' | 'left'
  /** Um único elemento interativo (botão ou link). */
  children: ReactNode
}

/**
 * Dica que aparece ao passar o mouse ou focar pelo teclado. Obrigatória em botões só com ícone.
 * Não substitui o `aria-label` do botão e nunca deve conter informação essencial (não aparece no toque).
 */
export function Tooltip({ texto, lado = 'top', children }: Props) {
  return (
    <TooltipProvider>
      <TooltipBase>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={lado}>{texto}</TooltipContent>
      </TooltipBase>
    </TooltipProvider>
  )
}
