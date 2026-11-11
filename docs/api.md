# Convenções da API REST

Documentação interativa com a API no ar: `http://localhost:8080/swagger-ui.html`.

## Rotas

- Prefixo fixo: `/api/v1`.
- Recurso no **plural, em português, minúsculas, com hífen**: `/api/v1/clientes`, `/api/v1/movimentacoes-financeiras`.
- Use os verbos HTTP, não verbos na URL:

| Operação | Método e rota | Sucesso |
| --- | --- | --- |
| Listar | `GET /clientes` | 200 + página |
| Consultar | `GET /clientes/{id}` | 200 |
| Cadastrar | `POST /clientes` | 201 + cabeçalho `Location` + recurso criado |
| Atualizar | `PUT /clientes/{id}` | 200 + recurso atualizado |
| Excluir | `DELETE /clientes/{id}` | 204 sem corpo |

- Ações de negócio que não são CRUD viram sub-recurso com `POST`: `POST /locacoes/{id}/devolucao`.

## JSON

- Campos em `camelCase` e em português: `criadoEm`, `valorDiaria`.
- Datas em ISO-8601: `2026-11-11` (data) e `2026-11-11T15:30:00Z` (instante, sempre UTC).
- Documentos e telefones trafegam **somente com dígitos**. A máscara é do frontend. A API aceita entrada com máscara e normaliza.
- Enums em maiúsculas: `DISPONIVEL`, `ALUGADO`, `EM_MANUTENCAO`.

## Listagens

Toda listagem é paginada. Parâmetros: `pagina` (começa em 0) e `tamanho` (padrão 20, máximo 100).
Filtros são parâmetros de consulta (`?busca=maria`, `?situacao=DISPONIVEL`).

```json
{
  "itens": [],
  "pagina": 0,
  "tamanho": 20,
  "totalItens": 0,
  "totalPaginas": 0
}
```

No código: `Paginacao.de(pagina, tamanho, Sort.by(...))` no controller e `PaginaResponse.de(page)` na resposta.
A ordenação é definida pelo backend; não aceite nome de coluna vindo do cliente.

## Erros

Todos os erros seguem o formato Problem Details (RFC 9457), gerado pelo `GlobalExceptionHandler`:

```json
{
  "status": 409,
  "title": "Conflict",
  "detail": "Já existe um cliente cadastrado com este CPF."
}
```

Erro de validação (400) traz também a lista de campos:

```json
{
  "status": 400,
  "detail": "Um ou mais campos são inválidos.",
  "erros": [{ "campo": "cpf", "mensagem": "CPF inválido." }]
}
```

| Status | Quando |
| --- | --- |
| 400 | Dados inválidos (Bean Validation, JSON malformado) |
| 404 | Recurso não existe |
| 409 | Duplicidade ou estado que impede a operação |
| 500 | Erro inesperado (mensagem genérica; detalhes só no log) |

## Documentação dos endpoints

- Anote o controller com `@Tag(name = "…")` e cada método com `@Operation(summary = "…")`.
- Coloque `@Schema(example = "…")` nos campos do `Request`, para o Swagger já vir preenchido com um exemplo válido.
