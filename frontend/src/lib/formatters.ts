/** Máscaras e validações de documentos. A API sempre recebe e devolve somente dígitos. */

export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, '')
}

/** "52998224725" -> "529.982.247-25". Aceita valor parcial (para máscara durante a digitação). */
export function formatarCpf(valor: string) {
  const d = apenasDigitos(valor).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

/** "34999990000" -> "(34) 99999-0000". Aceita fixo (10 dígitos) e celular (11). */
export function formatarTelefone(valor: string) {
  const d = apenasDigitos(valor).slice(0, 11)
  if (d.length <= 2) return d
  const ddd = d.slice(0, 2)
  const numero = d.slice(2)
  if (numero.length <= 4) return `(${ddd}) ${numero}`
  const corte = numero.length === 9 ? 5 : 4
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`
}

export function cpfValido(valor: string) {
  const d = apenasDigitos(valor)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false

  const digito = (tamanho: number) => {
    let soma = 0
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}
