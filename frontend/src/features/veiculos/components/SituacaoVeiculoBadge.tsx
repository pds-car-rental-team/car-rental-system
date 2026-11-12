import { cn } from '@/lib/utils'

import type { SituacaoVeiculo } from '../api'
import { ROTULO_SITUACAO } from '../formatters'

const ESTILOS_SITUACAO: Record<SituacaoVeiculo, string> = {
  DISPONIVEL: 'bg-status-available text-status-available-foreground',
  ALUGADO: 'bg-status-rented text-status-rented-foreground',
  EM_MANUTENCAO: 'bg-status-maintenance text-status-maintenance-foreground',
}

interface Props {
  situacao: SituacaoVeiculo
}

export function SituacaoVeiculoBadge({ situacao }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        ESTILOS_SITUACAO[situacao],
      )}
    >
      {ROTULO_SITUACAO[situacao]}
    </span>
  )
}

