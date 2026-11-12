# Design system

Identidade visual única do sistema. **Toda tela nova é montada com os tokens e os blocos descritos aqui**, para que telas feitas por pessoas diferentes pareçam o mesmo produto.

A tela de referência é `frontend/src/features/clientes/pages/ClientesPage.tsx`: uma tela nova de listagem deve ser uma cópia adaptada dela.

## Princípios

1. **Uma tela por módulo.** Cada módulo tem uma página de listagem. Cadastrar, editar e excluir acontecem **sobre a listagem** (modal e diálogo de confirmação), nunca em outra página ou rota. Uma tela só de consulta pedida por uma história (ex.: Disponibilidade da frota) pode ter rota própria, dentro da pasta do mesmo módulo (`features/veiculos`).
2. **Monte, não estilize.** Uma tela é a combinação dos blocos prontos. Se você está escrevendo muitas classes de cor, borda e espaçamento em uma página, está fazendo errado.
3. **Laranja é ação, vermelho é perigo.** O laranja marca a ação principal da tela (uma por tela). Vermelho aparece só em exclusão e erro.
4. **A página não rola.** A tela ocupa exatamente a altura da janela. Se a lista não couber, quem rola é a área da tabela (com o cabeçalho fixo), nunca a página. Listagens trazem 20 registros por página (`TAMANHO_PAGINA`).
5. **Fundo claro, barra escura.** Conteúdo sobre fundo creme, sem cartões em volta das tabelas; a navegação fica na barra escura do topo.

## Tokens

Definidos em um único lugar: `frontend/src/index.css` (bloco `:root`). Mudar um valor ali muda o sistema inteiro.

### Cores

| Token | Classe Tailwind | Uso |
| --- | --- | --- |
| `--background` | `bg-background` | Fundo da aplicação |
| `--foreground` | `text-foreground` | Texto principal, bordas fortes |
| `--card` | `bg-card` | Superfícies elevadas: campos, modal, diálogo |
| `--muted` | `bg-muted` | Fundos discretos, hover de linha |
| `--muted-foreground` | `text-muted-foreground` | Texto secundário, cabeçalho de tabela |
| `--primary` | `bg-primary`, `text-primary` | Laranja da marca: botão principal |
| `--accent` / `--accent-foreground` | `bg-accent text-accent-foreground` | Selos e destaques suaves |
| `--destructive` | `text-destructive`, `bg-destructive` | Excluir e mensagens de erro |
| `--status-available*` | `bg-status-available text-status-available-foreground` | Selo e destaque de veículo disponível |
| `--status-rented*` | `bg-status-rented text-status-rented-foreground` | Selo e destaque de veículo alugado |
| `--status-maintenance*` | `bg-status-maintenance text-status-maintenance-foreground` | Selo e destaque de veículo em manutenção (cinza: vermelho fica reservado a excluir e erro) |
| `--border` | `border` | Divisórias e linhas de tabela |
| `--input` | `border-input` | Borda de campos |
| `--header*` | `bg-header`, `text-header-foreground`… | Barra superior |

**Proibido:** cor fixa (`#C2410C`, `bg-orange-600`, `text-red-500`, `style={{ color }}`). Sempre a classe do token.
Precisa de uma cor que não existe (ex.: verde para "disponível")? Crie um token novo em `index.css`, documente aqui e use a classe.

### Tipografia

| Uso | Classe |
| --- | --- |
| Títulos (página, modal, diálogo) | `font-heading font-bold` (Sora) |
| Todo o resto | padrão (Inter), `text-sm` |
| Números em tabela (CPF, telefone, valores) | `tabular-nums` (já aplicado por `numerica: true` na `DataTable`) |

Não importe outras fontes.

### Forma e espaçamento

- Raio padrão: `rounded-lg` (8px). Selos: `rounded-full`.
- Altura de botões e campos: 44px (já é o padrão de `Button` e `Input`; não altere com `h-*`).
- Use a escala do Tailwind (`gap-3`, `p-7`…); a página já tem `gap-6` entre seus blocos.

## Blocos

Ficam em `frontend/src/components/`. Use estes antes de criar qualquer coisa.

| Bloco | Para quê |
| --- | --- |
| `PageHeader` | Título da tela, selo de contagem e ações (busca, filtros e botão principal) |
| `SearchInput` | Campo de busca das listagens (use com `useValorAtrasado`) |
| `FilterSelect` | Filtro por opção fixa (situação, categoria…), ao lado do `SearchInput`. Nunca escreva `<select>` direto na página |
| `DataTable` | Tabela de listagem; já trata carregando, erro, vazio e dados; rola por dentro com cabeçalho fixo |
| `BotaoEditar`, `BotaoExcluir` | Ações da linha: lápis e lixeira vermelha |
| `Pagination` | Rodapé "Página X de Y" com Anterior/Próxima |
| `FormModal`, `FormModalBody`, `FormModalRow`, `FormModalFooter` | Modal de cadastro e edição |
| `ConfirmDialog` | Confirmação de ação destrutiva |

Base (shadcn/ui), em `frontend/src/components/ui/`: `Button`, `Input`, `Field`/`FieldLabel`/`FieldError`, `Skeleton`, `Dialog`, `AlertDialog`, `Toaster`.

### Botões

| Situação | Como |
| --- | --- |
| Ação principal da tela ou do formulário | `<Button>` (laranja). **Uma por contexto.** |
| Ação secundária, cancelar | `<Button variant="outline">` |
| Confirmar exclusão | `<Button variant="destructive">` (já usado pelo `ConfirmDialog`) |
| Editar / excluir em linha de tabela | `<BotaoEditar>` / `<BotaoExcluir>` — sempre ícones, nunca texto |
| Botão com ícone e texto | ícone do `lucide-react` antes do texto: `<Button><PlusIcon /> Novo cliente</Button>` |

### Anatomia de uma tela de listagem

```tsx
<>
  <PageHeader titulo="Veículos" contagem="12 cadastrados">
    <SearchInput rotulo="Buscar por placa ou modelo" valor={busca} aoMudar={...} />
    <Button onClick={...}><PlusIcon /> Novo veículo</Button>
  </PageHeader>

  <DataTable colunas={COLUNAS} dados={data?.itens} chave={(v) => v.id}
    carregando={isPending} erro={error} aoTentarNovamente={() => refetch()}
    vazio="Nenhum veículo cadastrado ainda."
    acoes={(v) => (<>
      <BotaoEditar rotulo={`Editar ${v.placa}`} onClick={...} />
      <BotaoExcluir rotulo={`Excluir ${v.placa}`} onClick={...} />
    </>)} />

  <Pagination pagina={data.pagina} totalPaginas={data.totalPaginas} aoMudar={setPagina} />

  {/* modal de formulário (lazy) e ConfirmDialog */}
</>
```

### Formulários

- Sempre dentro de `FormModal` (modal centralizado sobre a listagem). Não use painel lateral nem página separada.
- Cada campo com `Field` + `FieldLabel` + `Input` + `FieldError`. Campos em uma coluna; dois campos curtos relacionados podem ficar lado a lado com `FormModalRow` (ex.: CPF e telefone).
- O `<form>` tem a classe `flex min-h-0 flex-1 flex-col` e contém `FormModalBody` (campos) e `FormModalFooter` (Cancelar + enviar).
- O mesmo modal serve para cadastrar e editar; mudam o título e o rótulo do botão ("Cadastrar cliente" / "Salvar alterações").
- O componente do modal é carregado sob demanda com `lazy()` + `Suspense`, como em `ClientesPage`, para não pesar a listagem.
- Erro de campo aparece abaixo do campo; erro geral, no fim do formulário. Sucesso: `toast.success` e o modal fecha.

### Exclusão

- Sempre pela lixeira vermelha (`BotaoExcluir`) + `ConfirmDialog`.
- Título em forma de pergunta ("Excluir cliente?"); o texto diz o que será removido, com o nome em `<strong>`, e que não pode ser desfeito.

### Menu

Itens da barra superior ficam em `MENU`, em `frontend/src/app/layout/AppLayout.tsx`. Um item por módulo, só texto.

## Textos

- Português do Brasil, frases curtas, sem ponto final em rótulos e botões.
- Botões dizem a ação com verbo: "Novo cliente", "Cadastrar cliente", "Salvar alterações", "Excluir".
- Mensagens de sucesso no passado e com ponto: "Cliente cadastrado."

## Como evoluir

- **Novo bloco reutilizável:** crie em `frontend/src/components/`, com comentário de uso, e acrescente à tabela de blocos acima no mesmo pull request.
- **Novo componente base:** `pnpm dlx shadcn@latest add <componente>`. Ele já herda os tokens.
- **Ajuste visual de um componente base** (`components/ui`): só como mudança do design system, combinada com o grupo, porque afeta todas as telas.
- **Mudança de identidade** (cor, fonte, raio): somente em `index.css`.
- Referência visual original das telas: https://claude.ai/artifact/Ugaqq2jrgt2f2yWo8ZgTJo (direção "C · Laranja Pista", com o formulário em modal central no lugar do painel lateral; acesso restrito a quem recebeu o compartilhamento).
