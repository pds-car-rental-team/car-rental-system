# Configuração do ambiente

Guia para rodar o projeto do zero em qualquer máquina (Windows, Linux ou macOS).
Agentes de IA: sigam os passos na ordem e confirmem cada verificação antes de avançar.

**Não é preciso criar nenhum arquivo `.env`.** O projeto já vem com valores padrão para o ambiente local.

## 1. Pré-requisitos

| Ferramenta | Versão | Verificar com | Instalar |
| --- | --- | --- | --- |
| Git | qualquer | `git --version` | https://git-scm.com |
| JDK (com compilador) | 21 ou mais novo | `javac -version` | https://adoptium.net (Temurin 21) |
| Node.js | 24 | `node -v` | https://nodejs.org ou `nvm install` na raiz do projeto |
| pnpm | 10 ou mais novo | `pnpm -v` | `corepack enable` (já vem com o Node) |
| Docker | qualquer recente | `docker compose version` | Docker Desktop (Windows/macOS) ou Docker Engine (Linux) |

Atenção:
- O comando é `javac`, não `java`. Se `javac` não existir, você tem apenas o runtime (JRE) e o build falha com *"release version 21 not supported"*. Instale um JDK.
- O Maven **não** precisa ser instalado: o projeto usa o Maven Wrapper (`mvnw`).
- No Windows, o Docker Desktop precisa estar **aberto e em execução** antes do passo 3.

## 2. Clonar

```bash
git clone https://github.com/pds-car-rental-team/car-rental-system.git
cd car-rental-system
```

## 3. Banco de dados

```bash
docker compose up -d
```

Verificação: `docker compose ps` deve mostrar `car-rental-postgres` com estado `healthy`.

O banco fica em `localhost:5432`, com base, usuário e senha `car_rental` (apenas para desenvolvimento).
As tabelas são criadas automaticamente pela API ao iniciar (migrations do Flyway).

## 4. API (backend)

```bash
cd backend
./mvnw spring-boot:run        # Windows (cmd ou PowerShell): .\mvnw.cmd spring-boot:run
```

A primeira execução baixa as dependências e pode levar alguns minutos.

Verificação: o terminal mostra `Started CarRentalApiApplication` e http://localhost:8080/swagger-ui.html abre a documentação da API.

Esse comando sobe a API no perfil `dev`, que cadastra **clientes fictícios** quando a tabela está vazia.
Pelo IntelliJ, rode a classe `CarRentalApiApplication` e informe `dev` em *Active profiles* para ter o mesmo comportamento.

## 5. Interface (frontend)

Em **outro terminal**, com a API ainda rodando:

```bash
cd frontend
pnpm install
pnpm dev
```

Verificação: http://localhost:5173 abre a tela de clientes com a lista preenchida.

O frontend acessa a API pelo proxy do Vite (`/api` → `http://localhost:8080`), então não há configuração de endereço nem de CORS.

## 6. Conferir se está tudo certo

```bash
cd backend && ./mvnw test                                   # exige Docker em execução
cd frontend && pnpm typecheck && pnpm lint && pnpm test
```

Todos devem terminar sem erro.

## Configurações opcionais

Só são necessárias se o padrão não servir para a sua máquina.

**Backend** — variáveis de ambiente definidas no terminal antes de rodar o `mvnw`:

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `DB_PORT` | `5432` | Porta do PostgreSQL local (vale também para o `docker compose`) |
| `DB_URL` | `jdbc:postgresql://localhost:5432/car_rental` | Endereço completo do banco |
| `DB_USER` / `DB_PASSWORD` | `car_rental` | Credenciais do banco |
| `SERVER_PORT` | `8080` | Porta da API |

**Frontend** — copie `frontend/.env.example` para `frontend/.env.local` (não versionado) e ajuste:

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `API_PROXY_TARGET` | `http://localhost:8080` | Endereço da API, se você mudou `SERVER_PORT` |
| `DEV_ALLOWED_HOSTS` | vazio | Acessar o Vite por outro nome de host (outra máquina da rede) |

Como definir uma variável de ambiente no terminal:

```bash
export DB_PORT=5433            # Linux, macOS, Git Bash
$env:DB_PORT = "5433"          # Windows PowerShell
set DB_PORT=5433               # Windows cmd
```

## Problemas comuns

| Sintoma | Causa e solução |
| --- | --- |
| `release version 21 not supported` | Falta o JDK (só há JRE) ou o JDK é mais antigo que o 21. Instale o Temurin 21 e confira `javac -version`. Se houver mais de um Java, aponte `JAVA_HOME` para o JDK. |
| `Connection to localhost:5432 refused` ao subir a API | O banco não está rodando. Execute `docker compose up -d` na raiz. |
| `port is already allocated` / `address already in use` na 5432 | Já existe um PostgreSQL na máquina. Defina `DB_PORT=5433` **no terminal do `docker compose` e no terminal da API**. |
| `Port 8080 was already in use` | Outra aplicação usa a porta. Defina `SERVER_PORT=8081` e, no frontend, `API_PROXY_TARGET=http://localhost:8081`. |
| Testes do backend falham com `Could not find a valid Docker environment` | O Docker não está em execução. Os testes de integração sobem um PostgreSQL temporário (Testcontainers). |
| Tela mostra "Sem conexão com o servidor" | A API não está no ar ou está em outra porta. Refaça o passo 4. |
| `pnpm: command not found` | Rode `corepack enable` e abra um novo terminal. |
| `./mvnw: Permission denied` (Linux/macOS) | Rode `chmod +x backend/mvnw`. |
| Erro de migration/validação do Flyway depois de trocar de branch | O banco local está com um esquema diferente. Recrie-o: `docker compose down -v` e `docker compose up -d` (apaga os dados locais). |

## Recomeçar do zero

```bash
docker compose down -v     # apaga o banco local
docker compose up -d
```

Na próxima vez que a API subir, as tabelas e os dados fictícios são recriados.
