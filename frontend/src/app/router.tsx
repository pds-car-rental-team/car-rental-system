import { createBrowserRouter, Navigate } from 'react-router'

import { ClientesPage } from '@/features/clientes/pages/ClientesPage'
import { DisponibilidadePage } from '@/features/veiculos/pages/DisponibilidadePage'
import { VeiculosPage } from '@/features/veiculos/pages/VeiculosPage'

import { AppLayout } from './layout/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * Todas as rotas da aplicação. Cada módulo tem UMA rota de listagem;
 * cadastro, edição e exclusão acontecem em modal sobre ela.
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Enquanto o painel de indicadores não existe, a página inicial é a de clientes.
      { index: true, element: <Navigate to="/clientes" replace /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'veiculos', element: <VeiculosPage /> },
      { path: 'disponibilidade', element: <DisponibilidadePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
