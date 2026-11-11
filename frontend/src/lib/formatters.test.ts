import { describe, expect, it } from 'vitest'

import { apenasDigitos, cpfValido, formatarCpf, formatarTelefone } from './formatters'

describe('formatarCpf', () => {
  it('aplica a máscara completa', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25')
  })

  it('aplica a máscara em valores parciais', () => {
    expect(formatarCpf('5299')).toBe('529.9')
    expect(formatarCpf('5299822')).toBe('529.982.2')
  })

  it('descarta dígitos excedentes', () => {
    expect(formatarCpf('529982247259999')).toBe('529.982.247-25')
  })
})

describe('formatarTelefone', () => {
  it('formata celular e fixo', () => {
    expect(formatarTelefone('34999990000')).toBe('(34) 99999-0000')
    expect(formatarTelefone('3432100000')).toBe('(34) 3210-0000')
  })

  it('formata valores parciais', () => {
    expect(formatarTelefone('34')).toBe('34')
    expect(formatarTelefone('34999')).toBe('(34) 999')
  })
})

describe('cpfValido', () => {
  it('aceita CPF válido com ou sem máscara', () => {
    expect(cpfValido('529.982.247-25')).toBe(true)
    expect(cpfValido('11144477735')).toBe(true)
  })

  it('rejeita dígito verificador errado, repetidos e tamanho incorreto', () => {
    expect(cpfValido('529.982.247-26')).toBe(false)
    expect(cpfValido('111.111.111-11')).toBe(false)
    expect(cpfValido('123')).toBe(false)
  })
})

describe('apenasDigitos', () => {
  it('remove tudo que não é dígito', () => {
    expect(apenasDigitos('(34) 99999-0000')).toBe('34999990000')
  })
})
