import type { ReactNode } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
  aberto: boolean
  aoFechar: () => void
  /** Pergunta direta, ex.: "Excluir cliente?". */
  titulo: string
  /** Consequência da ação. Destaque o nome do registro com `<strong>`. */
  children: ReactNode
  /** Verbo da ação, ex.: "Excluir". */
  rotuloConfirmar: string
  aoConfirmar: () => void
}

/** Confirmação obrigatória antes de qualquer ação destrutiva (excluir, cancelar, encerrar). */
export function ConfirmDialog({ aberto, aoFechar, titulo, children, rotuloConfirmar, aoConfirmar }: Props) {
  return (
    <AlertDialog open={aberto} onOpenChange={(abrir) => !abrir && aoFechar()}>
      <AlertDialogContent className="block rounded-xl border-t-4 border-t-destructive p-7 data-[size=default]:sm:max-w-[26.25rem]">
        <AlertDialogTitle className="font-heading text-xl font-bold tracking-[-0.02em]">{titulo}</AlertDialogTitle>
        <AlertDialogDescription className="mt-2.5 [&_strong]:font-semibold [&_strong]:text-foreground">
          {children}
        </AlertDialogDescription>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={aoConfirmar}>
            {rotuloConfirmar}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
