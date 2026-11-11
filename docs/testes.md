# Padrões de testes

## O que cada história precisa entregar

| Tipo | Onde | Obrigatório? |
| --- | --- | --- |
| Unitário do service (JUnit 5 + Mockito) | `backend/src/test/.../<modulo>/<X>ServiceTest.java` | **Sim**, para todo service |
| Integração do controller (Testcontainers) | `backend/src/test/.../<modulo>/<X>ControllerIntegrationTest.java` | Sim, cobrindo o caminho feliz e os erros principais |
| Unitário de funções do frontend (Vitest) | ao lado do arquivo: `formatters.test.ts` | Sim, para toda função com lógica (formatação, validação, cálculo) |
| Componente (Testing Library) | ao lado do componente: `ClienteForm.test.tsx` | Sim, para formulários |

## Como rodar

```bash
# backend (os testes de integração precisam do Docker em execução)
cd backend && ./mvnw test

# frontend
cd frontend && pnpm test
```

## Regras gerais

- Teste **comportamento**, não implementação: dado uma entrada, qual o resultado ou o erro esperado.
- Um teste verifica uma coisa. O nome descreve o cenário em português: `criarBloqueiaCpfDuplicado`, `'rejeita CPF com dígito verificador errado'`.
- Toda regra de negócio tem, no mínimo, um teste do caso de sucesso e um de cada caso de erro.
- Corrigiu um bug? Primeiro escreva o teste que falha por causa dele.
- Use apenas dados fictícios. CPFs válidos para teste: `529.982.247-25` e `111.444.777-35`.
- Teste não depende de outro teste nem de ordem de execução.
- Nunca apague ou desative um teste para "fazer passar". Se o teste está errado, corrija-o e explique no pull request.

## Backend

**Unitário do service** (modelo: `ClienteServiceTest`)
- `@ExtendWith(MockitoExtension.class)`, repository com `@Mock`, service com `@InjectMocks`. Sem Spring, sem banco.
- Verifique o que foi salvo (`ArgumentCaptor`) e o que **não** foi chamado em caso de erro (`verify(repository, never())`).
- Asserções com AssertJ (`assertThat`, `assertThatThrownBy`).

**Integração** (modelo: `ClienteControllerIntegrationTest`)
- `@SpringBootTest` + `@AutoConfigureMockMvc` + `@Import(TestcontainersConfiguration.class)`: sobe um PostgreSQL real e descartável, com as migrations aplicadas.
- Limpe as tabelas no `@BeforeEach`.
- Confira status HTTP e corpo JSON, incluindo os erros (400, 404, 409).
- Não use banco em memória (H2): o comportamento difere do PostgreSQL.

## Frontend

- Procure elementos como o usuário faria: `getByLabelText`, `getByRole`, `getByText`. Evite `data-testid` e seletores de classe.
- Simule interação com `userEvent`, não com `fireEvent`.
- Componentes que usam rotas são renderizados dentro de `<MemoryRouter>`.
- Não chame a API real: passe funções simuladas (`vi.fn()`) por propriedade, como em `ClienteForm.test.tsx`.
