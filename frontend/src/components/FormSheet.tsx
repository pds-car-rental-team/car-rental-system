import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao: string
  /** O formulário: um `<form>` com `FormSheetBody` e `FormSheetFooter`. */
  children: ReactNode
}

/**
 * Painel lateral padrão para formulários de cadastro e edição.
 * Todo formulário do sistema abre aqui, sobre a listagem, nunca em outra página.
 */
export function FormSheet({ aberto, aoFechar, titulo, descricao, children }: Props) {
  return (
    <Sheet open={aberto} onOpenChange={(abrir) => !abrir && aoFechar()}>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[28.75rem]">
        <SheetHeader className="gap-1 border-b px-7 py-5">
          <SheetTitle className="font-heading text-xl font-bold tracking-[-0.02em]">{titulo}</SheetTitle>
          <SheetDescription>{descricao}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}

/** Área rolável com os campos do formulário. */
export function FormSheetBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-7">{children}</div>
}

interface FooterProps {
  rotuloEnviar: string
  enviando: boolean
  aoCancelar: () => void
}

/** Rodapé fixo com "Cancelar" e o botão de envio do formulário. */
export function FormSheetFooter({ rotuloEnviar, enviando, aoCancelar }: FooterProps) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t bg-background px-7 py-5">
      <Button type="button" variant="outline" onClick={aoCancelar}>
        Cancelar
      </Button>
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Salvando…' : rotuloEnviar}
      </Button>
    </div>
  )
}
