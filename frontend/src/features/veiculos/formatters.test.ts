import { describe, expect, it } from 'vitest'

import { formatarMoeda, formatarPlaca } from './formatters'

describe('formatarPlaca', () => {
  it('formata placa Mercosul e padrão antigo com hífen', () => {
    expect(formatarPlaca('abc1d23')).toBe('ABC-1D23')
    expect(formatarPlaca('ABC1234')).toBe('ABC-1234')
  })

  it('mantém valores curtos sem hífen', () => {
    expect(formatarPlaca('ab')).toBe('AB')
    expect(formatarPlaca('abc')).toBe('ABC')
  })
})

describe('formatarMoeda', () => {
  it('formata valor numérico em reais', () => {
    expect(formatarMoeda(189.9)).toBe('R$ 189,90')
    expect(formatarMoeda(1250)).toBe('R$ 1.250,00')
  })
})

