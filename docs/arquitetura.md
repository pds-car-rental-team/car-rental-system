# Arquitetura

## Visão geral

Aplicação web de uso interno de uma locadora de veículos (funcionários e administradores).

```
Navegador ──> Frontend (React, Vite) ──/api──> Backend (Spring Boot) ──> PostgreSQL
```

- **frontend/**: interface em React. Não contém regra de negócio; valida formulários só para dar retorno rápido ao usuário.
- **backend/**: API REST. É a única dona das regras de negócio e do acesso ao banco.
- **PostgreSQL**: único armazenamento. O esquema só muda por migrations (Flyway).

O repositório é um monorepo:

```
backend/              API Spring Boot (Maven)
frontend/             Aplicação React (pnpm)
docs/                 Estes padrões
docker-compose.yml    PostgreSQL de desenvolvimento
AGENTS.md             Regras para agentes de IA (CLAUDE.md é um link para ele)
```

## Stack

| Camada | Tecnologia |
| --- | --- |
| Backend | Java 21, Spring Boot 4 (Web MVC, Data JPA, Validation), Flyway, springdoc (Swagger) |
| Banco | PostgreSQL 17 |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod |
| Testes | JUnit 5, Mockito, Testcontainers, Vitest, Testing Library |

Não adicione biblioteca nova sem combinar com o grupo: quase tudo que as histórias do backlog precisam já está aqui.

## Organização por módulo de negócio

O código é agrupado **por funcionalidade**, não por tipo técnico. Cada módulo do domínio
(cliente, veículo, locação, devolução, financeiro…) tem a sua pasta nos dois lados:

```
backend/src/main/java/br/com/carrental/
├── cliente/                 um pacote por módulo
│   ├── Cliente.java             entidade JPA
│   ├── ClienteRepository.java   acesso a dados
│   ├── ClienteService.java      regras de negócio e transações
│   ├── ClienteController.java   HTTP
│   └── dto/                     ClienteRequest, ClienteResponse
├── dev/                     dados fictícios, ativos só no perfil dev
└── shared/                  código usado por mais de um módulo
    ├── exception/               exceções de negócio e tratamento global de erros
    ├── web/                     paginação
    └── util/

frontend/src/
├── app/                     roteador, layout e páginas gerais
├── components/              blocos do design system (PageHeader, DataTable, FormSheet…)
│   └── ui/                  componentes base do shadcn/ui
├── features/
│   └── clientes/            uma pasta por módulo
│       ├── api.ts               chamadas HTTP + hooks do TanStack Query
│       ├── schema.ts            validação do formulário (Zod)
│       ├── components/          formulário e painel do módulo
│       └── pages/               tela de listagem (uma rota por módulo)
└── lib/                     código usado por mais de um módulo (http, formatadores)
```

### Regras de dependência

- **Controller → Service → Repository.** Nunca pule camada: controller não usa repository; repository não conhece DTO.
- **Entidade nunca sai do service para fora.** O controller recebe e devolve apenas DTOs.
- **Um módulo usa outro pelo Service**, nunca pelo Repository do outro. Exemplo: `LocacaoService` chama `ClienteService`/`VeiculoService`.
- **`shared/` e `lib/` não dependem de nenhum módulo.** Só mova código para lá quando um segundo módulo realmente precisar.
- No frontend, uma feature não importa de outra feature. O que for comum vai para `lib/` ou `components/`.

## Idioma

- **Domínio em português**: classes, tabelas, colunas, rotas, campos de JSON e mensagens (`Cliente`, `ClienteService`, `/clientes`, `criadoEm`). É o vocabulário do backlog.
- **Termos técnicos em inglês**, como é convenção dos frameworks: `Controller`, `Service`, `Repository`, `Request`, `Response`, `Page`, `useQuery`.
- Textos exibidos ao usuário sempre em português do Brasil.

## Receita: adicionar um módulo novo

Use o módulo de clientes como modelo e siga esta ordem. O exemplo é `veiculo`.

1. **Banco**: crie `backend/src/main/resources/db/migration/V<n>__criar_tabela_veiculo.sql` ([banco-de-dados.md](banco-de-dados.md)).
2. **Backend**: no pacote `br.com.carrental.veiculo`, crie `Veiculo`, `VeiculoRepository`, `dto/VeiculoRequest`, `dto/VeiculoResponse`, `VeiculoService` e `VeiculoController` ([backend.md](backend.md), [api.md](api.md)).
3. **Dados fictícios**: acrescente exemplos do módulo em `br.com.carrental.dev.DadosFicticios`, para os colegas terem o que ver na tela.
4. **Testes do backend**: `VeiculoServiceTest` (unitário) e `VeiculoControllerIntegrationTest` ([testes.md](testes.md)).
5. **Frontend**: em `frontend/src/features/veiculos`, crie `api.ts`, `schema.ts`, `components/` e `pages/`, copiando a estrutura de clientes e usando os blocos do [design-system.md](design-system.md) ([frontend.md](frontend.md)).
6. **Rotas e menu**: registre as rotas em `frontend/src/app/router.tsx` e o item de menu em `frontend/src/app/layout/AppLayout.tsx`.
7. **Valide**: rode os comandos da seção "Antes de concluir" do `AGENTS.md`.
