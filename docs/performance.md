# Padrões de performance

O sistema é pequeno, então a regra é: **não otimize por antecipação, mas não cometa os erros clássicos abaixo.**

## Backend e banco

- **Toda listagem é paginada** (`Paginacao` + `PaginaResponse`). Nunca devolva `findAll()` sem paginação em um endpoint.
- **Filtre e ordene no banco**, não em memória. Nada de `findAll()` seguido de `stream().filter(...)`.
- **Evite N+1 consultas.** Relacionamentos são `LAZY`; quando a listagem precisar do dado relacionado
  (ex.: nome do cliente na lista de locações), busque junto com `@EntityGraph` ou `join fetch`, ou use uma projeção.
- **Contagens e somas são feitas pelo banco** (`count`, `sum`, `group by`), como nos indicadores do painel e no saldo financeiro.
  Não carregue as entidades para somar no Java.
- **Verificar existência** é `existsBy…`, não `findBy…` seguido de teste de nulo.
- **Índices**: crie para colunas de chave estrangeira e para as usadas em filtro ou ordenação de listagem. Unicidade já cria índice.
- **Transações curtas**: `@Transactional(readOnly = true)` nas leituras; nada de chamada externa ou processamento demorado dentro de transação de escrita.
- `spring.jpa.open-in-view` fica `false`: tudo que a resposta precisa é carregado dentro do service.

## Frontend

- **Cache de servidor é do TanStack Query.** Não copie dados da API para `useState` nem refaça requisição que já está em cache.
- **Busca digitada tem atraso** (debounce de ~300 ms) antes de chamar a API, como em `ClientesListPage`.
- Use `placeholderData: keepPreviousData` em listagens paginadas, para a tabela não piscar ao trocar de página.
- Não use `useMemo`/`useCallback` por padrão; só quando houver um problema medido.
- Listas sempre com `key` estável (o `id` do registro), nunca o índice quando os itens podem mudar.
- Importe só o que usa (`import { PlusIcon } from 'lucide-react'`), para o bundle não crescer à toa.

## Quando algo estiver lento

Meça antes de mudar: veja a consulta SQL gerada (propriedade `spring.jpa.show-sql=true` localmente) e a aba Network do navegador.
Corrija a causa (consulta, índice, N+1) em vez de adicionar cache.
