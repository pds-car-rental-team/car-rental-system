import { describe, expect, it } from 'vitest'

import { calcularValorPrevisto, formatarData, formatarMoeda, formatarPlaca } from './formatters'

describe('formatters de locações', () => {
  it('formata data ISO para padrão brasileiro', () => {
    expect(formatarData('2026-11-20')).toBe('20/11/2026')
  })

  it('formata moeda e placa', () => {
    expect(formatarMoeda(360)).toBe('R$ 360,00')
    expect(formatarPlaca('bra2e19')).toBe('BRA-2E19')
  })

  it('calcula valor previsto para período de múltiplos dias', () => {
    expect(calcularValorPrevisto('2026-11-20', '2026-11-23', 120)).toEqual({
      diarias: 3,
      valorPrevisto: 360,
    })
  })

  it('cobra no mínimo uma diária quando retirada e devolução são no mesmo dia', () => {
    expect(calcularValorPrevisto('2026-11-20', '2026-11-20', 149.9)).toEqual({
      diarias: 1,
      valorPrevisto: 149.9,
    })
  })

  it('retorna null quando a devolução é anterior à retirada', () => {
    expect(calcularValorPrevisto('2026-11-20', '2026-11-19', 120)).toBeNull()
  })
})
