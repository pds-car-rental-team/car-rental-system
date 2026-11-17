import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'

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
  const [estiloPainel, setEstiloPainel] = useState<CSSProperties>({})

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
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

  function abrir() {
    if (disabled) return
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const espacoAbaixo = window.innerHeight - rect.bottom
      const abrirAcima = espacoAbaixo < 260 && rect.top > espacoAbaixo
      setEstiloPainel({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        ...(abrirAcima ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      })
    }
    setBusca('')
    setAtivo(0)
    setAberto(true)
  }

  function fechar() {
    setAberto(false)
    setBusca('')
  }

  function selecionar(opcao: OpcaoSelect<T>) {
    aoMudar(opcao.valor)
    fechar()
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!aberto) return
    buscaRef.current?.focus()

    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        fechar()
      }
    }

    function aoTeclarGlobal(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        fechar()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclarGlobal)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclarGlobal)
    }
  }, [aberto])

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
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={aberto}
        aria-controls={aberto ? listboxId : undefined}
        aria-haspopup="listbox"
        aria-invalid={invalido || undefined}
        disabled={disabled}
        onClick={() => (aberto ? fechar() : abrir())}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card py-2 pr-3 pl-3.5 text-left text-base md:text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
          !selecionada && 'text-muted-foreground',
        )}
      >
        <span className="truncate">{selecionada ? selecionada.rotulo : placeholder}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {aberto && (
        <div
          style={estiloPainel}
          className="z-50 flex flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
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
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            className="max-h-52 overflow-y-auto overscroll-contain p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {filtradas.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">{vazio}</li>
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
                      'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm select-none',
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
        </div>
      )}
    </div>
  )
}
