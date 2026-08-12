# FinView

Organizador de vida financeira para quem não tem nenhum controle sistematizado.
Abra uma vez por semana e enxergue toda a sua vida financeira em um minuto: o que
entrou, o que saiu, para onde o dinheiro foi e quanto está guardado para investir.

> **Proposta de valor:** clareza, não jargão. Sem planilhas, sem notificações,
> sem gamificação — só visualização simples.

## Funcionalidades (MVP + V2 + V3 + V4)

- Cadastro e login com e-mail e senha (JWT + bcrypt)
- **Onboarding em 3 passos** (1ª vez): renda mensal, objetivo principal e
  progresso salvo no servidor (`onboardingStep`); pode ser pulado
- **Design moderno**: sidebar, cartões com sombra suave, tipografia Inter,
  ícones (Lucide) e hierarquia visual clara
- **Dashboard** com gráficos em cartões independentes:
  - **Gastos por categoria** (pizza + legenda com valores)
  - **Saldo ao longo do tempo** (linha acumulada)
  - **Entrou vs. saiu nos últimos 6 meses** (barras mês a mês)
  - **Comparativo com o período anterior** (delta % nos cartões + tabela por
    categoria: agora vs. antes)
  - **Saldo por conta** (donut consolidado, quando há contas)
  - **Relatório em PDF** gerado no navegador (nada sai do seu computador)
- Filtros por **período** (última semana / mês / ano) e por **categoria** com
  atualização dinâmica dos gráficos
- **Estado global (Zustand)**: categorias, movimentações, contas, notificações,
  regras, metas e compartilhamento em uma fonte única de verdade — qualquer
  alteração em uma tela atualiza o dashboard e as metas automaticamente
  (`dataVersion`)
- **Movimentações**: botão flutuante **"+ Nova movimentação"** abre um modal
  para criar; também é possível **editar** e **excluir** cada lançamento
- **Categorização inteligente**: ao digitar a descrição, o FinView sugere a
  categoria (regras do usuário > regras padrão > "Outros") e oferece criar uma
  **regra automática** ("Lembrar categoria") em um clique
- **Regras automáticas** (`/regras`): "se a descrição contém X → categoria Y",
  com prioridade sobre as regras padrão
- **Notificações** (sino no topo): alertas de limite de categoria, saldo baixo
  e lembrete de meta — gerados no servidor e marcados como lidos
- **Múltiplas contas** (`/contas`): conta corrente, poupança, cartão e outras,
  com saldo inicial + movimentações por conta (donut consolidado no dashboard)
- **Metas personalizadas** (`/metas`): além do percentual de investimento,
  metas com nome, valor, data alvo e vínculo opcional a uma categoria (o
  progresso soma os gastos dela automaticamente)
- **Compartilhamento** (`/configuracoes`): convide por e-mail; o convidado vê e
  edita os mesmos dados (indicador no dashboard)
- **PWA**: instalável no celular/desktop com service worker (funciona offline
  após o primeiro acesso)
- **Importação de extrato em CSV** com categorização automática
- **Seção de categorias** (`/categorias`): criar, **editar** (nome + ícone + cor)
  e excluir categorias. Ao excluir, as movimentações são movidas para "Outros"
- **Toasts (react-hot-toast)**: feedback visual para salvar, excluir e erros
- **Conta demo** criada por seed (`demo@finview.app` / `demo123`)
- **Bancos conectados** (`/bancos`): o usuário escolhe o banco (Nubank, Itaú,
  Bradesco, Santander...) numa busca, autoriza o acesso e as **movimentações dos
  últimos 90 dias** são importadas automaticamente — com sincronização manual
  (botão "Sincronizar"), automática (webhook), deduplicação por `externalId`,
  categorização automática e "Reconectar" quando a sessão expira. O token de
  acesso fica **criptografado (AES-256-GCM)** no banco
- **Open Banking real (Pluggy)**: basta configurar `PLUGGY_CLIENT_ID` e
  `PLUGGY_CLIENT_SECRET` **uma única vez** no `.env` (seção abaixo). Sem as
  chaves, o app roda em **modo demonstração** com bancos, contas e movimentações
  fictícias — o fluxo completo funciona localmente de ponta a ponta
- **Interface 100% responsiva**: sidebar completa no desktop, só ícones no
  tablet e menu hambúrguer no celular; grids que se reorganizam (dashboard 4/2/1
  colunas, categorias 3/2/1, bancos 2/1); modais em tela cheia no mobile;
  botões com área de toque ≥ 44px e sem overflow horizontal
- Linguagem simples em toda a interface, sem termos técnicos (API, token, OAuth)

## Stack

| Camada    | Tecnologia                                        |
| --------- | ------------------------------------------------- |
| Frontend  | React 18 + Vite 7 + TailwindCSS + Recharts 3 + Lucide + Zustand + react-hot-toast + React Hook Form + React Router + vite-plugin-pwa + @react-pdf/renderer |
| Backend   | Node.js + Express + Prisma                        |
| Banco     | SQLite (fácil migrar para PostgreSQL depois)      |
| Auth      | JWT + bcryptjs                                    |
| Testes    | Vitest + Supertest (backend)                      |

## Estrutura do projeto

```
Finview/
├── server/                 # API Express
│   ├── prisma/schema.prisma
│   ├── sample.csv          # exemplo de arquivo para importar
│   └── src/
│       ├── routes/         # auth, categories, transactions, goal, metrics, rules, notifications, savings-goals, accounts, sharing, bank
│       ├── services/       # métricas, categorização, alertas, escopo (compartilhado), seed
│       ├── scripts/        # seed-demo (conta demo com dados de exemplo)
│       ├── middleware/     # autenticação e tratamento de erros
│       ├── utils/          # datas e leitura de CSV
│       └── tests/          # testes das rotas (43 testes, 9 arquivos)
└── client/                 # app React (Vite)
    └── src/
        ├── pages/          # Login, Cadastro, Visão geral, Movimentações, Categorias, Metas, Contas, Regras, Bancos, Configurações
        ├── components/     # Layout (sidebar), modais, cartões, gráficos, FAB, sino de notificações, onboarding, PDF
        ├── stores/         # estado global (Zustand)
        ├── context/        # autenticação (AuthContext)
        └── lib/            # cliente HTTP (axios) e formatação
```

## Requisitos

- Node.js 20.19+ (recomendado 22 LTS ou 24)
- npm 10+

## Como rodar localmente

```bash
# 1. Instalar dependências (client + server + ferramentas)
npm install

# 2. Criar o banco SQLite e gerar o Prisma Client
npm run setup

# 3. (Opcional) criar a conta demo com dados de exemplo
npm run seed

# 4. Subir API + frontend juntos
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:4000 (health em `/health`)

> Depois do `npm run seed`, entre com **demo@finview.app** / **demo123** e explore
> o dashboard. Sem integração bancária ou chaves de API.

### Conectar o banco do usuário (Open Banking)

Por padrão o app roda em **modo demonstração**: o fluxo de `/bancos` funciona de
ponta a ponta com dados fictícios, sem depender de nenhuma chave externa. Para
usar o **Open Banking real** via Pluggy, copie `server/.env.example` para
`server/.env` e defina as variáveis **uma única vez**:

```
JWT_SECRET=troque-por-um-segredo-longo
ENCRYPTION_KEY=troque-por-32-caracteres-de-criptografia
PLUGGY_CLIENT_ID=seu-client-id
PLUGGY_CLIENT_SECRET=seu-client-secret
```

- **`ENCRYPTION_KEY`** deve ter **exatamente 32 caracteres** (AES-256). É usada
  para criptografar o `accessToken` do Pluggy antes de salvar no banco.
- Sem `PLUGGY_CLIENT_ID`/`PLUGGY_CLIENT_SECRET`, o serviço segue em
  **modo demonstração** (`server/src/services/pluggy.js`) e a página de
  autorização simulada fica em `/bancos/demo-auth`.
- **Webhook (opcional):** cadastre no painel do Pluggy a URL do seu domínio
  `https://seu-dominio/api/banks/webhook` para sincronização automática quando o
  Pluggy notificar mudanças nas contas. Sem ele, basta clicar em "Sincronizar".

## Como usar

1. **Cadastre-se** em *Criar conta* (ou use a conta demo acima).
2. **Onboarding (1ª vez):** informe renda e objetivo para ajustar o app (dá para pular).
3. **Visão geral:** escolha o período (Semana/Mês/Ano) e filtre por categoria;
   exporte um **PDF** com o resumo.
4. **Movimentações:** clique no botão flutuante **"+ Nova movimentação"** para
   registrar o que entrou/saiu (a categoria é sugerida automaticamente), ou
   importe um CSV.
5. **Contas:** crie suas contas para ver o saldo por conta no dashboard.
6. **Metas:** defina o percentual de investimento e crie metas personalizadas.
7. **Regras:** ensine o app a categorizar sozinho por palavras-chave.
8. **Bancos:** em `/bancos`, busque seu banco, autorize e veja as movimentações
   dos últimos 90 dias importadas automaticamente (ou use a conta demo).

### Formato do CSV

Colunas: `data, descricao, categoria, valor, tipo`

```
data,descricao,categoria,valor,tipo
01/08/2026,Supermercado do bairro,Alimentação,"187,90",EXPENSE
05/08/2026,Salário do mês,,"5200,00",INCOME
07/08/2026,Remédio na farmácia,,"35,50",EXPENSE
```

- `data`: `DD/MM/AAAA` ou `AAAA-MM-DD`
- `valor`: número (ex.: `45.90` ou `45,90`)
- `categoria`: opcional. Se vazia, o app tenta adivinhar pela descrição
  (ex.: "farmacia" → Saúde, "netflix" → Lazer)
- `tipo`: `EXPENSE` ou `INCOME` (opcional — se vazio, valor negativo = entrada)

Exemplo completo: [`server/sample.csv`](server/sample.csv)

## Testes

```bash
npm test
```

Cobre cadastro, login, onboarding, criação/edição/remoção/lista de transações,
importação CSV, CRUD de categorias (com reatribuição para "Outros" ao excluir),
cálculo de métricas, comparativo com período anterior, saldo por conta,
categorização inteligente (regras), alertas/notificações, metas personalizadas,
compartilhamento e conexão de bancos com dados demonstração
(51 testes, 10 arquivos). Os testes usam um banco SQLite
separado (`server/prisma/test.db`) e rodam em série (`fileParallelism: false`).

## Scripts úteis

| Comando                        | O que faz                                   |
| ------------------------------ | ------------------------------------------- |
| `npm run dev`                  | API (porta 4000) + frontend (porta 5173)    |
| `npm run setup`                | cria o banco e gera o Prisma Client         |
| `npm run seed`                 | cria a conta demo com dados de exemplo      |
| `npm test`                     | roda os testes do backend                   |
| `npm run build`                | gera o build de produção do frontend        |
| `npm run dev -w finview-server`| roda apenas a API                           |
| `npm run dev -w finview-client`| roda apenas o frontend                      |

## API (resumo)

| Método | Rota                          | Descrição                          |
| ------ | ----------------------------- | ---------------------------------- |
| POST   | `/api/auth/register`          | cria conta e devolve token         |
| POST   | `/api/auth/login`             | login e devolve token              |
| GET    | `/api/auth/me`                | dados do usuário logado            |
| PUT    | `/api/auth/onboarding`        | salva progresso do onboarding (`monthlyIncome`, `primaryGoal`, `step`, `complete`) |
| GET    | `/api/categories`             | lista categorias (com contagem)    |
| POST   | `/api/categories`             | cria categoria (`name`, `icon`, `color`) |
| PUT    | `/api/categories/:id`         | edita categoria (nome/ícone/cor)   |
| DELETE | `/api/categories/:id`         | exclui e reatribui para "Outros"   |
| GET    | `/api/transactions`           | lista movimentações (filtro data)  |
| POST   | `/api/transactions`           | cria movimentação (autocategoriza) |
| PUT    | `/api/transactions/:id`       | edita movimentação                 |
| DELETE | `/api/transactions/:id`       | remove movimentação                |
| POST   | `/api/transactions/import`    | importa CSV (multipart `file`)     |
| GET    | `/api/metrics`                | dados do dashboard (`period`, `categoryId`): summary, compare, byCategory, balanceOverTime, monthly, compareByCategory, accounts |
| GET    | `/api/goal`                   | meta de investimento               |
| PUT    | `/api/goal`                   | atualiza a meta (`percent`)        |
| GET    | `/api/rules`                  | lista regras automáticas           |
| POST   | `/api/rules`                  | cria regra (`keyword`, `categoryId`) |
| DELETE | `/api/rules/:id`              | remove regra                       |
| GET    | `/api/rules/suggest`          | sugere categoria para uma descrição |
| GET    | `/api/notifications`          | lista notificações                 |
| POST   | `/api/notifications/check`    | gera alertas (limite/saldo/meta)   |
| PATCH  | `/api/notifications/:id/read` | marca uma como lida                |
| POST   | `/api/notifications/read-all` | marca todas como lidas             |
| GET    | `/api/savings-goals`          | lista metas personalizadas (com "guardado" computado) |
| POST   | `/api/savings-goals`          | cria meta (`name`, `targetAmount`, `savedAmount`, `targetDate`, `categoryId`) |
| PUT    | `/api/savings-goals/:id`      | edita meta                         |
| DELETE | `/api/savings-goals/:id`      | remove meta                        |
| GET    | `/api/accounts`               | lista contas (com saldo calculado) |
| POST   | `/api/accounts`               | cria conta (`name`, `type`, `initialBalance`, `color`) |
| PUT    | `/api/accounts/:id`           | edita conta                        |
| DELETE | `/api/accounts/:id`           | remove conta                       |
| GET    | `/api/banks/available`        | lista instituições disponíveis (busca opcional) |
| GET    | `/api/banks`                  | lista bancos conectados (com saldo e nº de movimentações) |
| POST   | `/api/banks/connect`          | inicia conexão → devolve `authUrl` + `connectionId` |
| POST   | `/api/banks/claim`            | finaliza conexão com `itemId` + `ref` |
| POST   | `/api/banks/:id/sync`         | sincroniza contas e movimentações (sem duplicar) |
| GET    | `/api/banks/:id/transactions` | movimentações importadas do banco |
| DELETE | `/api/banks/:id`              | desconecta (mantém as movimentações) |
| POST   | `/api/banks/webhook`          | recebe eventos do Pluggy (sincroniza em background) |
| GET    | `/api/sharing`                | convites enviados/recebidos/ativos |
| POST   | `/api/sharing/invite`         | convida por e-mail                 |
| POST   | `/api/sharing/:id/accept`     | convidado aceita                   |
| DELETE | `/api/sharing/:id`            | revoga/cancela compartilhamento    |

## Deploy em nuvem

O MVP usa SQLite, que não é ideal para produção multi-usuário. Recomendação:

1. **Migre o banco para PostgreSQL** (1 linha no schema + `DATABASE_URL`):
   troque `provider = "sqlite"` por `provider = "postgresql"` e rode
   `npm run setup` apontando para o Postgres (Ex.: Supabase, Neon, Railway).
   Não rode `npm run seed` em produção (a conta demo é só para testes locais).

2. **Backend → Render ou Railway**
   - Root dir: `server`
   - Build: `npm install && npm run db:setup`
   - Start: `npm start`
   - Env: `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `PORT=4000` (e,
     para Open Banking real: `PLUGGY_CLIENT_ID`, `PLUGGY_CLIENT_SECRET`)

3. **Frontend → Vercel**
   - Root dir: `client`
   - Build: `npm run build`
   - Env: `VITE_API_URL=https://sua-api.onrender.com/api`

> Localmente, o frontend já aponta para `http://localhost:4000/api` por padrão.
> Em produção, defina `VITE_API_URL` no build.

## Próximos passos (fora do V5)

- Migração do SQLite para PostgreSQL
- Refresh token e validação de e-mail
- Backup/exportação completa dos dados

## Critérios de aceite

### MVP
- [x] Usuário consegue se cadastrar e logar
- [x] Usuário consegue importar transações (CSV)
- [x] Dashboard mostra gráfico de gastos por categoria automaticamente
- [x] Dashboard mostra evolução de saldo ao longo do tempo
- [x] Usuário filtra por categoria e vê o gráfico atualizar
- [x] Usuário define um percentual para investimentos
- [x] O sistema mostra quanto já está reservado vs. a meta

### V2
- [x] Design moderno, limpo e agradável (sidebar, cards, ícones, Inter)
- [x] Não há botão para gerar dados falsos (dados vêm do seed)
- [x] Categorias têm ícones únicos e visuais
- [x] É possível criar e excluir categorias
- [x] Ao excluir categoria, movimentações são reatribuídas para "Outros"
- [x] Modal é utilizado para criação/edição (não páginas separadas)

### V3
- [x] É possível **editar** categorias (nome, ícone, cor) e movimentações
- [x] Dashboard atualiza automaticamente após qualquer alteração (estado global
  + `dataVersion`)
- [x] Notificações por toast para salvo/excluído/erro (react-hot-toast)
- [x] Filtros de período e categoria (além de tipo e busca) na listagem
- [x] Interface responsiva (desktop e mobile)
- [x] Código comentado em português (ou inglês simples)
- [x] README com instruções claras de instalação e execução

### V4
- [x] Onboarding em 3 passos na primeira entrada (renda, objetivo, progresso salvo)
- [x] Categorização inteligente (regras do usuário > padrão > "Outros") com
  sugestão no modal e criação de regra em um clique
- [x] Alertas no servidor: limite de categoria, saldo baixo e lembrete de meta
  (sino com badge + listagem + marcar como lida)
- [x] Comparativo com o período anterior: delta % nos cartões, gráfico de 6 meses
  e tabela de variação por categoria
- [x] Open Banking com fallback documentado (status + conectar, sem chave externa)
- [x] Relatório em PDF gerado no navegador (import dinâmico, nada sai do aparelho)
- [x] Metas personalizadas (nome, valor, data alvo, vínculo a categoria)
- [x] Múltiplas contas com saldo inicial e movimentações por conta
- [x] PWA instalável (manifest + service worker)
- [x] Compartilhamento por convite (ver/editar dados do dono + indicador no dashboard)

### V5
- [x] Conectar banco pela tela `/bancos`: busca por instituição, autorização e
  importação automática das movimentações dos últimos 90 dias
- [x] Sincronização manual (botão) e automática (webhook do Pluggy)
- [x] Deduplicação de movimentações por `externalId`
- [x] Categorização automática das movimentações importadas (regras do usuário)
- [x] Token de acesso criptografado (AES-256-GCM) com `ENCRYPTION_KEY`
- [x] "Reconectar" quando a sessão do banco expira (novo fluxo OAuth)
- [x] Modo demonstração sem chaves externas (dados fictícios, fluxo completo)
- [x] Interface 100% responsiva: sidebar hambúrguer, grids adaptativos, modais
  em tela cheia no mobile e sem overflow horizontal
