import { cn } from '@/lib/utils'

import type { StatusLocacao } from '../api'
import { ROTULO_STATUS } from '../formatters'

const ESTILOS_STATUS: Record<StatusLocacao, string> = {
  ABERTA: 'bg-status-rented text-status-rented-foreground',
  FINALIZADA: 'bg-status-available text-status-available-foreground',
  CANCELADA: 'bg-status-maintenance text-status-maintenance-foreground',
}

interface Props {
  status: StatusLocacao
}

export function StatusLocacaoBadge({ status }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        ESTILOS_STATUS[status],
      )}
    >
      {ROTULO_STATUS[status]}
    </span>
  )
}
