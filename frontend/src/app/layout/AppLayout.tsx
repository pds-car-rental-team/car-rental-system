import { CarFrontIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

import { cn } from '@/lib/utils'

/** Cada novo módulo (veículos, locações...) entra no menu adicionando um item aqui. */
const MENU = [{ rotulo: 'Clientes', para: '/clientes' }]

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="bg-header text-header-foreground">
        <div className="flex flex-wrap items-center gap-x-9 px-4 sm:px-10">
          <div className="flex min-h-16 items-center gap-2.5">
            <span className="flex size-[2.125rem] items-center justify-center rounded-[0.625rem] bg-primary text-primary-foreground">
              <CarFrontIcon className="size-[1.125rem]" />
            </span>
            <span className="font-heading text-[1.0625rem] font-bold tracking-[-0.01em]">Locadora</span>
          </div>

          <nav aria-label="Menu principal" className="flex flex-wrap gap-1">
            {MENU.map(({ rotulo, para }) => (
              <NavLink
                key={para}
                to={para}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-16 items-center border-y-[3px] border-transparent px-3.5 font-medium text-header-muted transition-colors hover:text-header-foreground',
                    isActive && 'border-b-header-accent font-semibold text-header-foreground',
                  )
                }
              >
                {rotulo}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <main className="flex-1 px-4 py-8 sm:p-10">
        <div className="mx-auto flex max-w-[70rem] flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
