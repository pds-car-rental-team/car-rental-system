import { useEffect, useState } from 'react'

/** Devolve o valor só depois de uma pausa na digitação, para a busca não chamar a API a cada tecla. */
export function useValorAtrasado(valor: string, atrasoMs = 300) {
  const [atrasado, setAtrasado] = useState(valor)

  useEffect(() => {
    const timer = setTimeout(() => setAtrasado(valor), atrasoMs)
    return () => clearTimeout(timer)
  }, [valor, atrasoMs])

  return atrasado
}
