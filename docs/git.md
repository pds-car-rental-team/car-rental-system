# Fluxo de Git

## Branches

- `main` é a branch estável: o que está nela precisa rodar e passar nos testes.
- O caminho recomendado é uma branch por história do Jira, criada a partir da `main` atualizada, e pull request para revisão. Commit direto na `main` é permitido quando o grupo combinar, desde que as validações do `AGENTS.md` tenham passado.
- Nome das branches:

```
feat/SCRUM-11-cadastro-clientes
fix/SCRUM-40-cpf-duplicado-na-edicao
chore/atualizar-dependencias
docs/padroes-de-teste
```

## Commits

Mensagens em **português**, no padrão Conventional Commits, dizendo o propósito da mudança:

```
<tipo>(<escopo>): <descrição no infinitivo> (SCRUM-<n>)
```

| Tipo | Uso |
| --- | --- |
| `feat` | funcionalidade nova |
| `fix` | correção de bug |
| `test` | apenas testes |
| `docs` | apenas documentação |
| `refactor` | mudança interna sem alterar comportamento |
| `chore` | configuração, dependências, build |

Exemplos:

```
feat(clientes): bloquear cadastro com CPF duplicado (SCRUM-22)
test(clientes): cobrir regras do ClienteService (SCRUM-26)
chore(backend): configurar conexão com PostgreSQL (SCRUM-19)
```

- Commits pequenos, de preferência um por subtarefa do Jira.
- Evite mensagens vagas: "ajustes", "update", "correções".
- Nunca versione `.env`, senhas, `node_modules`, `target` ou arquivos da IDE.

## Pull request

1. Atualize a branch com a `main` e resolva conflitos (atenção ao número das migrations — veja [banco-de-dados.md](banco-de-dados.md)).
2. Rode as validações da seção "Antes de concluir" do `AGENTS.md`. Todas precisam passar.
3. Abra o PR para a `main` com: o que foi feito, o número da história (SCRUM-xx) e como testar.
4. Pelo menos um colega revisa antes do merge.

## Proibido sem combinar com o grupo

- `git push --force` em branch compartilhada e qualquer reescrita de histórico da `main`.
- Merge com teste falhando.
