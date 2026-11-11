# Padrões de segurança

## Estado atual (importante)

O sistema **ainda não tem login nem controle de acesso**: qualquer pessoa que alcance a API consegue ler e alterar os dados.
Enquanto isso não existir:

- rode o sistema apenas em máquina local ou rede privada; **não publique na internet**;
- não cadastre dados reais de pessoas. Use dados fictícios (há geradores de CPF válido para teste).

Quando a história de autenticação entrar no backlog, este documento deve ser atualizado com as regras de perfis (funcionário e administrador).

## Segredos e configuração

- Nenhuma senha, token ou chave no código ou no Git. Configuração sensível vem de variável de ambiente.
- Arquivos `.env` e `.env.local` nunca são versionados. Só o `.env.example`, sem valores reais.
- As credenciais `car_rental/car_rental` do `docker-compose.yml` e do `application.yaml` existem só para o banco local. Qualquer outro ambiente define `DB_URL`, `DB_USER` e `DB_PASSWORD`.

## Entrada de dados

- **Toda entrada é validada no backend**, com Bean Validation no `Request` (`@Valid` no controller). A validação do frontend é só conveniência e pode ser burlada.
- Limite de tamanho em todo campo de texto (`@Size`), igual ao tamanho da coluna.
- Listagens têm tamanho máximo de página (`Paginacao`). Não aceite nome de coluna para ordenação vindo do cliente.

## Banco de dados

- Consultas apenas por Spring Data (métodos derivados) ou `@Query` com parâmetros nomeados (`:nome`).
  **Nunca monte SQL ou JPQL concatenando texto** vindo do usuário: isso abre brecha para SQL injection.
- O banco de desenvolvimento escuta só em `127.0.0.1`.

## Respostas e erros

- A API devolve DTOs (`Response`), nunca a entidade: assim nenhum campo interno vaza por acidente.
- Mensagens de erro ao usuário não trazem stack trace, SQL, nome de tabela ou de classe. O detalhe técnico vai só para o log (já é o comportamento do `GlobalExceptionHandler`).

## Dados pessoais (LGPD)

CPF, e-mail e telefone são dados pessoais.

- Não escreva dados pessoais em logs, mensagens de exceção ou commits.
- Peça e guarde apenas os dados que a funcionalidade precisa.
- Em testes e exemplos, use somente dados fictícios.

## Frontend

- Nunca use `dangerouslySetInnerHTML`. O React já escapa o texto exibido.
- Não guarde dados pessoais em `localStorage`/`sessionStorage`.
- Variáveis `VITE_*` vão para o navegador: nunca coloque segredo nelas.

## Dependências

- Não adicione dependência sem necessidade e sem combinar com o grupo. Prefira bibliotecas conhecidas e mantidas.
- Mantenha os arquivos de lock versionados (`pnpm-lock.yaml`) e use as versões gerenciadas pelo Spring Boot no `pom.xml`.
