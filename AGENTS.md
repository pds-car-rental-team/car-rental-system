# Instruções para agentes de IA

Sistema web de gestão de uma locadora de veículos (clientes, veículos, locações, devoluções, financeiro e indicadores).
Trabalho em grupo da disciplina Processos e Desenvolvimento de Software, com Scrum e backlog no Jira (chaves `SCRUM-<n>`).

> `CLAUDE.md` é um link simbólico para este arquivo. **Edite sempre o `AGENTS.md`**; nunca transforme o `CLAUDE.md` em arquivo comum.

## Regra principal

**Os documentos em [`docs/`](docs/README.md) são obrigatórios.** Antes de escrever código, leia os da área em que vai mexer e siga-os mesmo que a pessoa não peça:

| Vai mexer em… | Leia |
| --- | --- |
| Configurar o projeto na máquina, erro ao rodar | [docs/configuracao.md](docs/configuracao.md) |
| Qualquer história, módulo novo | [docs/arquitetura.md](docs/arquitetura.md) |
| Código Java | [docs/backend.md](docs/backend.md) |
| Endpoints | [docs/api.md](docs/api.md) |
| Tabelas e migrations | [docs/banco-de-dados.md](docs/banco-de-dados.md) |
| Código React | [docs/frontend.md](docs/frontend.md) |
| Qualquer tela ou componente visual | [docs/design-system.md](docs/design-system.md) |
| Entrada de dados, dados pessoais, configuração | [docs/seguranca.md](docs/seguranca.md) |
| Consultas e listagens | [docs/performance.md](docs/performance.md) |
| Testes | [docs/testes.md](docs/testes.md) |
| Branch, commit, pull request | [docs/git.md](docs/git.md) |

- O módulo de **clientes** é a implementação de referência. Ao criar algo novo, abra os arquivos equivalentes de clientes e siga a mesma estrutura, nomes e estilo.
- Se o pedido da pessoa contrariar um padrão, avise e proponha o caminho que segue o padrão. Se o padrão realmente precisar mudar, altere o documento em `docs/` na mesma entrega e destaque isso no relato.
- Não adicione dependências, não troque tecnologia e não reorganize pastas sem pedido explícito.

## Estrutura

```
backend/     API REST — Java 21, Spring Boot 4, JPA, Flyway, PostgreSQL
frontend/    Interface — React 19, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query
docs/        Padrões do projeto
```

Código organizado por módulo de negócio: `backend/src/main/java/br/com/carrental/<modulo>` e `frontend/src/features/<modulo>`.

## Comandos

```bash
docker compose up -d                       # PostgreSQL local (porta 5432)

cd backend
./mvnw spring-boot:run                     # API em http://localhost:8080 (Swagger em /swagger-ui.html)
./mvnw test                                # testes (integração exige Docker em execução)

cd frontend
pnpm install
pnpm dev                                   # interface em http://localhost:5173
pnpm test                                  # testes
pnpm typecheck && pnpm lint                # verificação de tipos e lint
pnpm dlx shadcn@latest add <componente>    # adicionar componente de UI
```

Requisitos: JDK 21 ou mais novo, Node 24 (ver `.nvmrc`), pnpm e Docker. Não é preciso criar `.env`.
`./mvnw spring-boot:run` usa o perfil `dev`, que cadastra dados fictícios em tabelas vazias (`br.com.carrental.dev.DadosFicticios`).

**Se a pessoa pedir para configurar ou rodar o projeto**, siga [docs/configuracao.md](docs/configuracao.md) passo a passo: confira os pré-requisitos, execute cada etapa, valide a verificação indicada e use a tabela de problemas comuns antes de tentar outra solução.

## Regras que mais importam

**Backend**
- Camadas `Controller → Service → Repository`; regra de negócio só no service.
- Controller recebe e devolve DTOs (`record` `Request`/`Response`); entidade JPA nunca vai para o JSON.
- Erros são exceções de `shared/exception` (`RecursoNaoEncontradoException`, `ConflitoException`); nada de `try/catch` montando resposta.
- Banco só muda por migration Flyway nova; nunca edite migration existente nem use `ddl-auto` diferente de `validate`.
- Toda listagem é paginada; toda regra de unicidade tem verificação no service **e** constraint `UNIQUE`.

**Frontend**
- API somente por `@/lib/http` + hooks do TanStack Query definidos em `features/<modulo>/api.ts`.
- **Design system obrigatório** ([docs/design-system.md](docs/design-system.md)): telas montadas com os blocos de `src/components/` (`PageHeader`, `DataTable`, `FormModal`, `ConfirmDialog`…), copiando a estrutura de `ClientesPage`. Nunca crie visual próprio.
- Cores, fontes e raios só pelos tokens de `src/index.css` (`bg-primary`, `text-destructive`…). Proibido cor fixa (`#hex`, `bg-orange-600`).
- Uma rota por módulo: cadastro e edição em modal (`FormModal`, com `lazy()`), exclusão pela lixeira vermelha + `ConfirmDialog`.
- Formulários com React Hook Form + Zod. A `DataTable` já trata carregando, erro, vazio e com dados.
- TypeScript sem `any`.

**Geral**
- Domínio em português (`Cliente`, `/clientes`, `criadoEm`); termos técnicos em inglês (`Service`, `Controller`). Textos de interface em pt-BR.
- Nunca versione segredos ou `.env`. Não registre dados pessoais (CPF, e-mail, telefone) em logs. Use só dados fictícios.
- Toda regra de negócio nova vem com teste. Nunca apague ou desative teste para fazer a suíte passar.
- Faça apenas o que a história pede; não refatore código de outros módulos sem necessidade.

## Antes de concluir

Uma tarefa só está pronta quando tudo abaixo passa. Rode e relate o resultado real; não declare sucesso sem executar.

```bash
cd backend && ./mvnw test
cd frontend && pnpm typecheck && pnpm lint && pnpm test
```

Confira também:
- [ ] O código novo segue a estrutura do módulo de clientes e os documentos de `docs/`.
- [ ] Endpoints novos aparecem no Swagger com `@Tag`/`@Operation`.
- [ ] Rotas e item de menu registrados, se houver tela nova.
- [ ] Tela nova usa só blocos e tokens do design system, sem cor fixa nem componente visual duplicado.
- [ ] Nenhum segredo, `.env` ou arquivo gerado (`target/`, `node_modules/`, `dist/`) incluído.
- [ ] `docs/` atualizado se algum padrão mudou.

## Git

- Prefira uma branch por história (`feat/SCRUM-<n>-descricao`). Commit direto na `main` só quando a pessoa pedir.
- Commits em português, Conventional Commits, com a chave do Jira: `feat(clientes): bloquear CPF duplicado (SCRUM-22)`.
- Não faça commit, push, force push ou reescrita de histórico sem a pessoa pedir.
