# Padrões do frontend

Referência: `frontend/src/features/clientes`.

## Estrutura de uma feature

```
features/<modulo>/
├── api.ts          tipos da API, funções HTTP e hooks do TanStack Query
├── schema.ts       schema Zod do formulário e o tipo inferido
├── components/     componentes usados só neste módulo (formulário e painel)
└── pages/          a tela de listagem do módulo (<Modulo>Page.tsx)
```

Rotas ficam em `src/app/router.tsx`; o menu, em `src/app/layout/AppLayout.tsx`.
Cada módulo tem **uma rota**: cadastro, edição e exclusão acontecem em painel e diálogo sobre a listagem.

> A aparência das telas é definida em [design-system.md](design-system.md). Leia-o antes de criar ou alterar qualquer tela.

## Regras

**TypeScript**
- Proibido `any`. Tipos de resposta da API ficam em `api.ts` e espelham o `Response` do backend.
- Imports com o alias `@/` (`@/lib/http`), não com caminhos relativos longos.

**Chamadas à API**
- Sempre por `http()` de `@/lib/http`. Nunca use `fetch` ou `axios` direto em componente.
- Sempre com TanStack Query: `useQuery` para ler, `useMutation` para gravar. Nunca `useEffect` + `useState` para buscar dados.
- Cada feature exporta hooks (`useClientes`, `useSalvarCliente`); componentes não conhecem URLs.
- Após gravar, invalide as consultas do módulo (`queryClient.invalidateQueries`).

**Formulários**
- React Hook Form + Zod (`zodResolver`). As regras do schema repetem as do `Request` do backend, com as mesmas mensagens.
- Todo formulário abre no painel lateral (`FormSheet`), carregado sob demanda com `lazy()`. Não crie rota ou página para formulário.
- Erros da API voltam para o formulário: erros de campo (`erro.errosDeCampo`) com `setError` no campo; demais, em `root`. Veja `ClienteForm.tsx`.
- Máscaras e validações de documento ficam em `@/lib/formatters`. Para a API vai somente dígitos.

**Interface** (detalhes em [design-system.md](design-system.md))
- Monte a tela com os blocos de `src/components/` (`PageHeader`, `SearchInput`, `DataTable`, `Pagination`, `FormSheet`, `ConfirmDialog`, `BotaoEditar`, `BotaoExcluir`). Não crie tabela, cabeçalho, modal ou botão de ação próprios.
- Componentes base vêm do shadcn/ui (`src/components/ui`). Para adicionar um: `pnpm dlx shadcn@latest add <componente>`.
- Estilo só com classes do Tailwind e com os tokens do tema (`bg-primary`, `text-muted-foreground`, `text-destructive`). Não use cor fixa (`#fff`, `bg-blue-500`) nem arquivo CSS por componente.
- Ícones: `lucide-react`.

**Estados de tela**: toda tela que busca dados trata carregando, erro (com opção de tentar de novo), vazio e com dados.
A `DataTable` já faz isso: passe `carregando`, `erro`, `aoTentarNovamente` e `vazio`.

**Retorno ao usuário**
- Sucesso de uma ação: `toast.success("…")`. Falha: mensagem no formulário ou `toast.error(mensagemDeErro(erro))`.
- Ação destrutiva (excluir) sempre pede confirmação com `ConfirmDialog`.

**Acessibilidade**
- Todo campo tem `label` ligado por `htmlFor`/`id`. Botão só com ícone tem `aria-label`.
- A tela precisa funcionar em largura de celular: a página nunca rola, nem na vertical nem na horizontal (a `DataTable` rola dentro da própria área).

**Texto**
- Tudo em português do Brasil. Botões dizem a ação ("Cadastrar cliente", "Salvar alterações"), não "OK"/"Enviar".

## Ambiente de desenvolvimento

O Vite repassa `/api` para o backend em `http://localhost:8080` (proxy em `vite.config.ts`), então não há CORS em desenvolvimento.
Ajustes locais vão em `frontend/.env.local` (não versionado); veja `frontend/.env.example`.
