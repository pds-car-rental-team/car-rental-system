import type { FiltroStatusLocacao, StatusLocacao } from './api'

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const ROTULO_STATUS: Record<StatusLocacao, string> = {
  ABERTA: 'Aberta',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

export const ROTULO_FILTRO_STATUS: Record<FiltroStatusLocacao, string> = {
  ABERTA: 'Aberta',
  ATRASADA: 'Atrasada',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

/** 189.9 -> "R$ 189,90". */
export function formatarMoeda(valor: number) {
  return formatadorMoeda.format(valor).replace(/\u00a0/g, ' ')
}

/** "2026-11-20" -> "20/11/2026". */
export function formatarData(iso: string) {
  const partes = iso.split('-')
  if (partes.length !== 3) return iso
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

/** "ABC1D23" -> "ABC-1D23". */
export function formatarPlaca(valor: string) {
  const limpo = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7)
  if (limpo.length <= 3) return limpo
  return `${limpo.slice(0, 3)}-${limpo.slice(3)}`
}

/** Retorna a data local atual no formato ISO "YYYY-MM-DD". */
export function dataAtualIso() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** Calcula a quantidade de diárias (mínimo 1) e o valor previsto a partir do período e diária. */
export function calcularValorPrevisto(
  dataRetirada: string,
  dataPrevistaDevolucao: string,
  valorDiaria: number | undefined,
): { diarias: number; valorPrevisto: number } | null {
  if (!dataRetirada || !dataPrevistaDevolucao || valorDiaria === undefined || valorDiaria <= 0) {
    return null
  }
  const inicio = Date.parse(`${dataRetirada}T00:00:00Z`)
  const fim = Date.parse(`${dataPrevistaDevolucao}T00:00:00Z`)
  if (Number.isNaN(inicio) || Number.isNaN(fim) || fim < inicio) {
    return null
  }
  const diffDias = Math.round((fim - inicio) / 86_400_000)
  const diarias = Math.max(1, diffDias)
  return {
    diarias,
    valorPrevisto: Number((diarias * valorDiaria).toFixed(2)),
  }
}

/** Diárias cobradas (mínimo 1) e valor final de uma devolução. */
export function calcularValorFinal(dataRetirada: string, dataDevolucao: string, valorDiaria: number) {
  const inicio = Date.parse(`${dataRetirada}T00:00:00Z`)
  const fim = Date.parse(`${dataDevolucao}T00:00:00Z`)
  if (Number.isNaN(inicio) || Number.isNaN(fim) || fim < inicio) return null
  const diarias = Math.max(1, Math.round((fim - inicio) / 86_400_000))
  return { diarias, valorFinal: Number((diarias * valorDiaria).toFixed(2)) }
}
