# Padrões do frontend

Referência: `frontend/src/features/clientes`.

## Estrutura de uma feature

```
features/<modulo>/
├── api.ts          tipos da API, funções HTTP e hooks do TanStack Query
├── schema.ts       schema Zod do formulário e o tipo inferido
├── components/     componentes usados só neste módulo
└── pages/          uma tela por rota (<Algo>Page.tsx)
```

Rotas ficam em `src/app/router.tsx`; o menu, em `src/app/layout/AppLayout.tsx`.

## Regras

**TypeScript**
- Proibido `any`. Tipos de resposta da API ficam em `api.ts` e espelham o `Response` do backend.
- Imports com o alias `@/` (`@/lib/http`), não com caminhos relativos longos.

**Chamadas à API**
- Sempre por `http()` de `@/lib/http`. Nunca use `fetch` ou `axios` direto em componente.
- Sempre com TanStack Query: `useQuery` para ler, `useMutation` para gravar. Nunca `useEffect` + `useState` para buscar dados.
- Cada feature exporta hooks (`useClientes`, `useCriarCliente`); componentes não conhecem URLs.
- Após gravar, invalide as consultas do módulo (`queryClient.invalidateQueries`).

**Formulários**
- React Hook Form + Zod (`zodResolver`). As regras do schema repetem as do `Request` do backend, com as mesmas mensagens.
- Erros da API voltam para o formulário: erros de campo (`erro.errosDeCampo`) com `setError` no campo; demais, em `root`. Veja `ClienteForm.tsx`.
- Máscaras e validações de documento ficam em `@/lib/formatters`. Para a API vai somente dígitos.

**Interface**
- Componentes vêm do shadcn/ui. Para adicionar um: `pnpm dlx shadcn@latest add <componente>`. Não edite `src/components/ui` à mão e não crie botão, input ou tabela próprios.
- Estilo só com classes do Tailwind e com as cores do tema (`bg-primary`, `text-muted-foreground`, `text-destructive`). Não use cor fixa (`#fff`, `bg-blue-500`) nem arquivo CSS por componente.
- Toda tela começa com `<PageHeader titulo="…">`.
- Ícones: `lucide-react`.

**Estados de tela**: toda tela que busca dados trata os quatro casos:
1. carregando (`Skeleton`);
2. erro (mensagem com `mensagemDeErro(erro)` e opção de tentar de novo);
3. vazio (texto explicando que não há registros);
4. com dados.

**Retorno ao usuário**
- Sucesso de uma ação: `toast.success("…")`. Falha: mensagem no formulário ou `toast.error(mensagemDeErro(erro))`.
- Ação destrutiva (excluir) sempre pede confirmação com `AlertDialog`.

**Acessibilidade**
- Todo campo tem `label` ligado por `htmlFor`/`id`. Botão só com ícone tem `aria-label`.
- A tela precisa funcionar em largura de celular: esconda colunas secundárias da tabela em telas pequenas, não crie rolagem horizontal.

**Texto**
- Tudo em português do Brasil. Botões dizem a ação ("Cadastrar cliente", "Salvar alterações"), não "OK"/"Enviar".

## Ambiente de desenvolvimento

O Vite repassa `/api` para o backend em `http://localhost:8080` (proxy em `vite.config.ts`), então não há CORS em desenvolvimento.
Ajustes locais vão em `frontend/.env.local` (não versionado); veja `frontend/.env.example`.
