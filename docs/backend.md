# Padrões do backend

Referência: pacote `br.com.carrental.cliente`.

## Responsabilidade de cada classe

| Classe | Faz | Não faz |
| --- | --- | --- |
| `XController` | Mapeia rota, valida entrada com `@Valid`, chama **um** método do service, define o status HTTP | Regra de negócio, acesso a repository, `try/catch` |
| `XService` | Regras de negócio, transações, conversão entidade ↔ DTO | Conhecer HTTP (`ResponseEntity`, status) |
| `XRepository` | Consultas (interface `JpaRepository`) | Regra de negócio |
| `X` (entidade) | Estado e invariantes do próprio objeto | Aparecer em controller ou JSON |
| `XRequest` / `XResponse` | Contrato da API (records) | Lógica além de validação e conversão |

## Regras

**Injeção de dependência**
- Sempre por construtor, com campos `private final`. Nunca `@Autowired` em campo.

**DTOs**
- São `record`. Entrada termina em `Request`, saída em `Response`.
- Validação com Bean Validation no `Request`, com **mensagem em português** em cada anotação (`@NotBlank(message = "Informe o nome.")`).
- O `Response` tem um método estático `de(entidade)` para a conversão.
- Nunca use a entidade como corpo de requisição ou resposta.

**Entidades**
- Sem Lombok. Construtor com os campos obrigatórios, construtor `protected` vazio para o JPA, getters, e métodos de negócio no lugar de setters (`cliente.atualizar(...)`).
- `criadoEm` e `atualizadoEm` (`Instant`) em toda tabela, preenchidos por `@PrePersist`/`@PreUpdate`.
- Relacionamentos `@ManyToOne` sempre com `fetch = FetchType.LAZY`.
- Situações e categorias são `enum` gravado com `@Enumerated(EnumType.STRING)`.

**Services**
- A classe é anotada com `@Transactional(readOnly = true)`; todo método que grava recebe `@Transactional`.
- Normalize os dados antes de salvar: `trim()` em textos, e-mail em minúsculas, documentos e telefones somente com dígitos (`Texto.apenasDigitos`).
- Regra que envolve mais de uma tabela (ex.: registrar locação e mudar a situação do veículo) acontece em **um único método transacional**.

**Erros**
- Para falhar, lance uma exceção de `shared/exception`:
  - `RecursoNaoEncontradoException` → 404
  - `ConflitoException` → 409 (duplicidade ou estado inválido, ex.: veículo já alugado)
- A mensagem da exceção é mostrada ao usuário: escreva em português, clara e sem detalhe técnico.
- O `GlobalExceptionHandler` é o único lugar que transforma exceção em resposta HTTP. Não use `try/catch` para montar resposta de erro e não retorne `null` para indicar "não encontrado".
- Precisa de um novo tipo de erro? Crie uma subclasse de `ApiException`.

**Unicidade (CPF, placa…)**
- Verifique no service (`existsBy…`) para dar uma mensagem clara **e** crie a constraint `UNIQUE` no banco. As duas coisas, sempre.

**Dinheiro e datas**
- Valores monetários: `BigDecimal` no Java e `NUMERIC(12,2)` no banco. Nunca `double`/`float`.
- Datas sem hora: `LocalDate`. Instantes: `Instant`.

**Configuração**
- Tudo que varia por ambiente vem de variável de ambiente em `application.yaml` (`${DB_URL:valor-local}`).
- `spring.jpa.hibernate.ddl-auto` fica em `validate`. Quem cria e altera tabela é o Flyway.

**Estilo**
- Java 21: use `record`, `var` quando o tipo for óbvio, `switch` com padrões, `Optional` só como retorno.
- Métodos curtos, nomes que dizem o que fazem; comentário apenas para explicar um *porquê* que o código não mostra.
- Logs com SLF4J (`LoggerFactory`), nunca `System.out`. Não registre dados pessoais em log.
