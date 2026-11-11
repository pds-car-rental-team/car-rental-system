import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao: string
  /** O formulário: um `<form>` com `FormModalBody` e `FormModalFooter`. */
  children: ReactNode
}

/**
 * Modal padrão para formulários de cadastro e edição.
 * Todo formulário do sistema abre aqui, sobre a listagem, nunca em outra página.
 */
export function FormModal({ aberto, aoFechar, titulo, descricao, children }: Props) {
  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !abrir && aoFechar()}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0 sm:max-w-[32.5rem]">
        <DialogHeader className="gap-1 border-b px-7 py-5">
          <DialogTitle className="font-heading text-xl leading-tight font-bold tracking-[-0.02em]">{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

/** Área com os campos do formulário. Rola por dentro se o formulário for maior que a tela. */
export function FormModalBody({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-7">{children}</div>
}

/** Agrupa dois campos curtos lado a lado (ex.: CPF e telefone). Em celular, empilha. */
export function FormModalRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

interface FooterProps {
  rotuloEnviar: string
  enviando: boolean
  aoCancelar: () => void
}

/** Rodapé com "Cancelar" e o botão de envio do formulário. */
export function FormModalFooter({ rotuloEnviar, enviando, aoCancelar }: FooterProps) {
  return (
    <div className="flex flex-col-reverse gap-3 rounded-b-xl border-t bg-background px-7 py-5 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" onClick={aoCancelar}>
        Cancelar
      </Button>
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Salvando…' : rotuloEnviar}
      </Button>
    </div>
  )
}
