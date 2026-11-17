import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useId, useRef, useState } from 'react'

import type { OpcaoSelect } from '@/components/Select'
import { cn } from '@/lib/utils'

interface Props<T extends string> {
  opcoes: OpcaoSelect<T>[]
  /** `undefined` enquanto nada foi escolhido (mostra o `placeholder`). */
  valor: T | undefined
  aoMudar: (valor: T) => void
  placeholder?: string
  placeholderBusca?: string
  vazio?: string
  /** Em formulário: o mesmo `id` usado no `FieldLabel`. */
  id?: string
  /** Marca o campo com erro de validação. */
  invalido?: boolean
  disabled?: boolean
  className?: string
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

function semPontuacao(texto: string) {
  return texto.replace(/[^a-z0-9]/g, '')
}

/**
 * Lista de seleção com busca interna e rolagem própria.
 * Use em formulários no lugar de `Select` quando a lista puder crescer (ex.: clientes, veículos).
 */
export function SearchableSelect<T extends string>({
  opcoes,
  valor,
  aoMudar,
  placeholder = 'Selecione',
  placeholderBusca = 'Buscar…',
  vazio = 'Nenhum resultado encontrado.',
  id,
  invalido,
  disabled,
  className,
}: Props<T>) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [ativo, setAtivo] = useState(0)

  const buscaRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const selecionada = opcoes.find((o) => o.valor === valor)

  const termo = normalizarTexto(busca)
  const termoLimpo = semPontuacao(termo)
  const filtradas = termo
    ? opcoes.filter((o) => {
        const rotulo = normalizarTexto(o.rotulo)
        return rotulo.includes(termo) || (termoLimpo.length > 0 && semPontuacao(rotulo).includes(termoLimpo))
      })
    : opcoes

  function alterarAbertura(novoAberto: boolean) {
    if (disabled && novoAberto) return
    setAberto(novoAberto)
    setBusca('')
    setAtivo(0)
  }

  function selecionar(opcao: OpcaoSelect<T>) {
    aoMudar(opcao.valor)
    alterarAbertura(false)
  }

  function aoTeclarNaBusca(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setAtivo((atual) => (filtradas.length === 0 ? 0 : (atual + 1) % filtradas.length))
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setAtivo((atual) => (filtradas.length === 0 ? 0 : (atual - 1 + filtradas.length) % filtradas.length))
    } else if (evento.key === 'Enter' && filtradas[ativo]) {
      evento.preventDefault()
      selecionar(filtradas[ativo])
    }
  }

  return (
    <PopoverPrimitive.Root open={aberto} onOpenChange={alterarAbertura}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={aberto}
          aria-controls={aberto ? listboxId : undefined}
          aria-haspopup="listbox"
          aria-invalid={invalido || undefined}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card py-2 pr-3 pl-3.5 text-left text-base md:text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
            !selecionada && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{selecionada ? selecionada.rotulo : placeholder}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={12}
          onOpenAutoFocus={(evento) => {
            evento.preventDefault()
            buscaRef.current?.focus()
          }}
          onWheel={(evento) => evento.stopPropagation()}
          className="z-50 flex w-(--radix-popover-trigger-width) flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div className="border-b border-border p-2">
            <input
              ref={buscaRef}
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setAtivo(0)
              }}
              onKeyDown={aoTeclarNaBusca}
              placeholder={placeholderBusca}
              aria-label={placeholderBusca}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            className="max-h-56 overflow-y-auto overscroll-contain py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {filtradas.length === 0 ? (
              <li className="px-3.5 py-2.5 text-sm text-muted-foreground">{vazio}</li>
            ) : (
              filtradas.map((opcao, indice) => {
                const marcado = opcao.valor === valor
                const destacado = indice === ativo
                return (
                  <li
                    key={opcao.valor}
                    role="option"
                    aria-selected={marcado}
                    onMouseEnter={() => setAtivo(indice)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selecionar(opcao)
                    }}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-sm select-none',
                      destacado && 'bg-accent text-accent-foreground',
                      marcado && 'font-medium',
                    )}
                  >
                    <span className="truncate">{opcao.rotulo}</span>
                    {marcado && <CheckIcon className="size-4 shrink-0 text-primary" />}
                  </li>
                )
              })
            )}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
