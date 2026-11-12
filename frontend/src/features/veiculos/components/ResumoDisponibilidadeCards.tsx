import { CarIcon, CheckCircle2Icon, KeyRoundIcon, WrenchIcon } from 'lucide-react'
import type { ComponentType } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import type { DisponibilidadeResumo, SituacaoVeiculo } from '../api'

interface Props {
  resumo: DisponibilidadeResumo | undefined
  carregando: boolean
  situacaoSelecionada: SituacaoVeiculo | undefined
  aoSelecionarSituacao: (situacao: SituacaoVeiculo | undefined) => void
}

interface ItemCard {
  id: 'TODOS' | SituacaoVeiculo
  rotulo: string
  situacao: SituacaoVeiculo | undefined
  obterValor: (resumo: DisponibilidadeResumo) => number
  icone: ComponentType<{ className?: string }>
  classeDestaque: string
}

const CARDS: ItemCard[] = [
  {
    id: 'TODOS',
    rotulo: 'Total da frota',
    situacao: undefined,
    obterValor: (r) => r.total,
    icone: CarIcon,
    classeDestaque: 'bg-accent text-accent-foreground',
  },
  {
    id: 'DISPONIVEL',
    rotulo: 'Disponíveis',
    situacao: 'DISPONIVEL',
    obterValor: (r) => r.disponiveis,
    icone: CheckCircle2Icon,
    classeDestaque: 'bg-status-available text-status-available-foreground',
  },
  {
    id: 'ALUGADO',
    rotulo: 'Alugados',
    situacao: 'ALUGADO',
    obterValor: (r) => r.alugados,
    icone: KeyRoundIcon,
    classeDestaque: 'bg-status-rented text-status-rented-foreground',
  },
  {
    id: 'EM_MANUTENCAO',
    rotulo: 'Em manutenção',
    situacao: 'EM_MANUTENCAO',
    obterValor: (r) => r.emManutencao,
    icone: WrenchIcon,
    classeDestaque: 'bg-status-maintenance text-status-maintenance-foreground',
  },
]

/** Cards de resumo da disponibilidade da frota; clicar em um card aplica o filtro da respectiva situação. */
export function ResumoDisponibilidadeCards({
  resumo,
  carregando,
  situacaoSelecionada,
  aoSelecionarSituacao,
}: Props) {
  return (
    <section aria-label="Resumo de disponibilidade da frota" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map((card) => {
        const Icone = card.icone
        const ativo = situacaoSelecionada === card.situacao
        const valor = resumo ? card.obterValor(resumo) : 0

        return (
          <button
            key={card.id}
            type="button"
            aria-pressed={ativo}
            onClick={() =>
              aoSelecionarSituacao(
                card.situacao !== undefined && situacaoSelecionada === card.situacao ? undefined : card.situacao,
              )
            }
            className={cn(
              'flex items-center justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/60',
              ativo && 'border-primary ring-2 ring-ring/40',
            )}
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{card.rotulo}</p>
              {carregando && !resumo ? (
                <Skeleton className="mt-1.5 h-7 w-12" />
              ) : (
                <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{valor}</p>
              )}
            </div>
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', card.classeDestaque)}>
              <Icone className="size-5" />
            </span>
          </button>
        )
      })}
    </section>
  )
}

