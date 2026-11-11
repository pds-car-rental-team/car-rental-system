import type { Key, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { mensagemDeErro } from '@/lib/http'
import { cn } from '@/lib/utils'

export interface Coluna<T> {
  cabecalho: string
  celula: (item: T) => ReactNode
  /** Primeira coluna de identificação do registro: texto maior e em destaque. */
  principal?: boolean
  /** Valores numéricos (CPF, telefone, dinheiro): alinha os dígitos. */
  numerica?: boolean
}

interface Props<T> {
  colunas: Coluna<T>[]
  dados: T[] | undefined
  chave: (item: T) => Key
  carregando: boolean
  erro: unknown
  aoTentarNovamente: () => void
  /** Texto exibido quando não há registros. */
  vazio: string
  /** Botões da linha. Use `BotaoEditar` e `BotaoExcluir`. */
  acoes?: (item: T) => ReactNode
}

/**
 * Tabela padrão das listagens. Já trata os quatro estados obrigatórios:
 * carregando, erro (com "Tentar novamente"), vazio e com dados.
 */
export function DataTable<T>({ colunas, dados, chave, carregando, erro, aoTentarNovamente, vazio, acoes }: Props<T>) {
  const totalColunas = colunas.length + (acoes ? 1 : 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[47rem] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-foreground text-xs tracking-[0.06em] text-muted-foreground uppercase">
            {colunas.map((coluna, i) => (
              <th key={coluna.cabecalho} className={cn('h-10 px-3 font-semibold', i === 0 && 'pl-0')}>
                {coluna.cabecalho}
              </th>
            ))}
            {acoes && <th className="h-10 text-right font-semibold">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {carregando &&
            Array.from({ length: 6 }, (_, i) => (
              <tr key={i} className="border-b" aria-hidden="true">
                <td colSpan={totalColunas} className="h-[3.75rem]">
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ))}

          {!carregando && !!erro && (
            <tr>
              <td colSpan={totalColunas} className="py-14 text-center">
                <p role="alert" className="mb-4 font-medium text-destructive">
                  {mensagemDeErro(erro)}
                </p>
                <Button variant="outline" size="sm" onClick={aoTentarNovamente}>
                  Tentar novamente
                </Button>
              </td>
            </tr>
          )}

          {!carregando && !erro && dados?.length === 0 && (
            <tr>
              <td colSpan={totalColunas} className="py-14 text-center text-muted-foreground">
                {vazio}
              </td>
            </tr>
          )}

          {!erro &&
            dados?.map((item) => (
              <tr key={chave(item)} className="border-b transition-colors hover:bg-muted/60">
                {colunas.map((coluna, i) => (
                  <td
                    key={coluna.cabecalho}
                    className={cn(
                      'h-[3.75rem] px-3 text-foreground/80',
                      i === 0 && 'pl-0',
                      coluna.principal && 'text-[0.9375rem] font-semibold text-foreground',
                      coluna.numerica && 'tabular-nums',
                    )}
                  >
                    {coluna.celula(item)}
                  </td>
                ))}
                {acoes && <td className="text-right whitespace-nowrap">{acoes(item)}</td>}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
