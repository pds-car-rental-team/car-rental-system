import { createBrowserRouter, Navigate } from 'react-router'

import { ClienteEditarPage } from '@/features/clientes/pages/ClienteEditarPage'
import { ClienteNovoPage } from '@/features/clientes/pages/ClienteNovoPage'
import { ClientesListPage } from '@/features/clientes/pages/ClientesListPage'

import { AppLayout } from './layout/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'

/** Todas as rotas da aplicação. Cada módulo registra as suas dentro do AppLayout. */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Enquanto o painel de indicadores não existe, a página inicial é a de clientes.
      { index: true, element: <Navigate to="/clientes" replace /> },
      { path: 'clientes', element: <ClientesListPage /> },
      { path: 'clientes/novo', element: <ClienteNovoPage /> },
      { path: 'clientes/:id/editar', element: <ClienteEditarPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
