# car-rental-system

Sistema de gestão para locadoras de veículos, desenvolvido na disciplina Processos e Desenvolvimento de Software.

Centraliza o cadastro de clientes e veículos, o registro de locações e devoluções, o controle financeiro básico e os indicadores da operação.

## Tecnologias

- **Backend:** Java 21, Spring Boot, Spring Data JPA, Flyway, PostgreSQL
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Testes:** JUnit 5, Mockito, Testcontainers, Vitest

## Como rodar

Requisitos: JDK 21 ou mais novo, Node 24, pnpm (`corepack enable`) e Docker. Não é preciso criar `.env`.
Passo a passo completo, configurações opcionais e solução de problemas: [docs/configuracao.md](docs/configuracao.md).

```bash
# 1. Banco de dados
docker compose up -d

# 2. API (http://localhost:8080 — documentação em /swagger-ui.html)
cd backend
./mvnw spring-boot:run

# 3. Interface (http://localhost:5173), em outro terminal
cd frontend
pnpm install
pnpm dev
```

No Windows, use `.\mvnw.cmd` no lugar de `./mvnw`. A API sobe com clientes fictícios para facilitar os testes.

## Testes

```bash
cd backend && ./mvnw test        # exige Docker em execução
cd frontend && pnpm test
```

## Como contribuir

Antes de desenvolver uma história, leia os [padrões do projeto](docs/README.md).
Quem usa agentes de IA (Claude Code, Codex, etc.) não precisa configurar nada: as regras estão no [AGENTS.md](AGENTS.md).

## Situação do backlog

| História | Situação |
| --- | --- |
| Cadastrar e consultar clientes (SCRUM-11) | Implementada |
| Demais histórias | A fazer |
