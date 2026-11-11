import { CarFrontIcon, UsersIcon, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

import { cn } from '@/lib/utils'

interface ItemDeMenu {
  rotulo: string
  para: string
  icone: LucideIcon
}

/** Cada novo módulo (veículos, locações...) entra no menu adicionando um item aqui. */
const MENU: ItemDeMenu[] = [{ rotulo: 'Clientes', para: '/clientes', icone: UsersIcon }]

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-muted/40 md:flex-row">
      <aside className="flex shrink-0 items-center gap-4 border-b bg-background px-4 py-3 md:w-60 md:flex-col md:items-stretch md:gap-6 md:border-r md:border-b-0 md:py-5">
        <div className="flex items-center gap-2.5 md:px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CarFrontIcon className="size-4.5" />
          </span>
          <span className="font-semibold tracking-tight">Locadora</span>
        </div>

        <nav aria-label="Menu principal" className="flex gap-1 overflow-x-auto md:flex-col">
          {MENU.map(({ rotulo, para, icone: Icone }) => (
            <NavLink
              key={para}
              to={para}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive && 'bg-muted text-foreground',
                )
              }
            >
              <Icone className="size-4" />
              {rotulo}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
