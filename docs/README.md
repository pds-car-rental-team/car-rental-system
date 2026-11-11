# Padrões do projeto

Estes documentos definem como o sistema é construído. Valem para pessoas e para agentes de IA.
Antes de escrever código, leia o documento da área em que vai mexer.

| Documento | Leia quando for… |
| --- | --- |
| [configuracao.md](configuracao.md) | configurar o projeto na sua máquina ou resolver erro ao rodar |
| [arquitetura.md](arquitetura.md) | começar qualquer história; criar um módulo novo |
| [backend.md](backend.md) | escrever Java (controller, service, repository, DTO) |
| [api.md](api.md) | criar ou alterar um endpoint |
| [banco-de-dados.md](banco-de-dados.md) | criar tabela, coluna, índice ou migration |
| [frontend.md](frontend.md) | escrever React (telas, formulários, chamadas à API) |
| [seguranca.md](seguranca.md) | lidar com entrada do usuário, dados pessoais, configuração |
| [performance.md](performance.md) | escrever consultas, listagens ou telas com muitos dados |
| [testes.md](testes.md) | escrever ou rodar testes |
| [git.md](git.md) | criar branch, commit ou pull request |

## Como estes documentos evoluem

- A implementação de referência é o módulo de **clientes** (`backend/.../cliente` e `frontend/src/features/clientes`). Na dúvida, faça igual a ele.
- Se uma história exigir fugir de um padrão, altere o documento **no mesmo pull request** e explique o motivo. Padrão que não está escrito aqui não existe.
- Decisão que afete todos os módulos (nova biblioteca, mudança de estrutura) deve ser combinada com o grupo antes.
