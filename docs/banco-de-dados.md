# Padrões de banco de dados

Banco: PostgreSQL 17. Migrations: Flyway, em `backend/src/main/resources/db/migration`.

## Migrations

- Nome: `V<número>__<descricao_em_snake_case>.sql` (dois sublinhados). Exemplo: `V2__criar_tabela_veiculo.sql`.
- O número é sequencial. Antes de criar a sua, atualize a branch com a `main` e use o próximo número livre.
  Se duas pessoas usarem o mesmo número, quem fizer merge depois renumera a sua.
- **Nunca edite uma migration que já foi para a `main`.** Para corrigir, crie uma nova migration.
- Uma migration por mudança lógica (uma tabela, um conjunto de colunas relacionadas).
- SQL explícito e em maiúsculas nas palavras-chave, como em `V1__criar_tabela_cliente.sql`.

## Nomes

| Item | Padrão | Exemplo |
| --- | --- | --- |
| Tabela | singular, `snake_case`, português | `cliente`, `movimentacao_financeira` |
| Coluna | `snake_case` | `valor_diaria`, `criado_em` |
| Chave estrangeira (coluna) | `<tabela>_id` | `cliente_id` |
| Constraint única | `uk_<tabela>_<coluna>` | `uk_cliente_cpf` |
| Chave estrangeira (constraint) | `fk_<tabela>_<referenciada>` | `fk_locacao_cliente` |
| Check | `ck_<tabela>_<regra>` | `ck_veiculo_situacao` |
| Índice | `ix_<tabela>_<coluna>` | `ix_cliente_nome` |

## Toda tabela tem

- `id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
- `criado_em TIMESTAMPTZ NOT NULL` e `atualizado_em TIMESTAMPTZ NOT NULL`
- `NOT NULL` em tudo que é obrigatório: a regra vale no banco, não só na aplicação.

## Tipos

| Dado | Tipo |
| --- | --- |
| Texto | `VARCHAR(n)` com o mesmo limite da validação do DTO |
| Dinheiro | `NUMERIC(12,2)` |
| Data sem hora | `DATE` |
| Instante | `TIMESTAMPTZ` |
| Situação/categoria (enum) | `VARCHAR(n)` + constraint `CHECK` com os valores permitidos |
| Documento, telefone, placa | `VARCHAR`, sem máscara |

## Integridade

- Toda regra de unicidade do negócio (CPF, placa) é uma constraint `UNIQUE`.
- Todo relacionamento tem chave estrangeira. Não use `ON DELETE CASCADE` em dados de negócio:
  cliente com locação não pode simplesmente sumir junto com o histórico.
- Crie índice nas colunas de chave estrangeira e nas usadas em filtro e ordenação de listagens.

## Ambiente local

`docker compose up -d` sobe o banco com usuário, senha e base `car_rental`, acessível só em `localhost:5432`.
Para recomeçar do zero: `docker compose down -v` (apaga os dados locais).
