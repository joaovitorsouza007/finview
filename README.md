# FinView

**Sua vida financeira em um só lugar.** Um organizador completo — dashboard, metas, categorias
inteligentes e conexão real com bancos via Open Finance — feito para quem quer entender o próprio
dinheiro sem viver de planilhas.

> **Proposta de valor:** clareza, não jargão. Sem planilhas, sem notificações infinitas, sem
> gamificação — só uma visualização simples que responde, em um minuto: *o que entrou, o que saiu,
> para onde o dinheiro foi e quanto está guardado para os seus objetivos.*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-5A67D8?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Open Finance](https://img.shields.io/badge/Open_Finance-Pluggy-14B8A6?style=flat-square&logoColor=white)](https://pluggy.ai)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**Live:** [Frontend (Vercel)](https://finview-ivory.vercel.app) · [API (Railway)](https://finview-server-production.up.railway.app) · [Repositório](https://github.com/joaovitorsouza007/finview)

---

## Sobre o projeto

### O problema

A maioria das pessoas não sabe para onde o dinheiro vai. Planilhas são abandonadas em duas semanas,
apps de banco mostram só o que o banco quer mostrar e ferramentas "completas" são chatas demais para
abrir mais de uma vez. O resultado: gastos no escuro, investimento sempre adiado e ansiedade quando o
mês aperta.

### Para quem é

FinView é para adultos jovens (22–35 anos) com renda variável ou o primeiro salário estável, que
querem se organizar, mas não têm paciência nem tempo para planilhas. Pessoas que já tentaram
"começar a controlar" várias vezes e querem uma ferramenta que funcione de verdade — uma vez por
semana, em um minuto.

### A solução

- **Dashboard com gráficos** que respondem o que entrou, o que saiu e para onde o dinheiro foi;
- **Categorização inteligente** — a categoria certa é sugerida automaticamente ao lançar ou importar;
- **Conexão com bancos via Open Finance (Pluggy)** — os últimos 90 dias de movimentações chegam sozinhos;
- **Metas** de investimento e metas personalizadas com progresso automático;
- **PWA instalável**, offline e 100% responsivo.

## Screenshots

![Dashboard do FinView](docs/dashboard.png)

> Adicione um print do dashboard em `docs/dashboard.png`.

## Funcionalidades principais

- 📊 **Dashboard com gráficos** — gastos por categoria, saldo ao longo do tempo, entrou vs. saiu
  (6 meses), comparativo com o período anterior e saldo por conta;
- 🏷️ **CRUD de categorias** com ícones, cores e reatribuição automática para "Outros" ao excluir;
- ✨ **Categorização inteligente** — regras do usuário > regras padrão > "Outros", com criação de
  regra em um clique;
- 🎯 **Metas** de investimento (percentual) e metas personalizadas (valor, data e vínculo a categoria);
- 🏦 **Open Finance real (Pluggy)** — conexão, sincronização manual/webhook, deduplicação e token
  criptografado (AES-256-GCM);
- 💾 **Importação de extrato em CSV** com categorização automática;
- 📄 **Relatório em PDF** gerado no navegador;
- 🔐 **Autenticação JWT + bcrypt** e onboarding em 3 passos;
- 👥 **Compartilhamento** com casal/família por convite;
- 🔔 **Notificações** — limite de categoria, saldo baixo e lembrete de meta;
- 📱 **PWA + interface 100% responsiva** (sidebar hambúrguer, modais em tela cheia no mobile);
- 🧪 **51 testes automatizados** no backend (Vitest + Supertest).

## Stack

| Camada            | Tecnologias                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Frontend          | React 18 · Vite 7 · TailwindCSS 3 · Recharts 3 · Zustand 5 · React Router 7 · Lucide · React Hook Form · Axios · vite-plugin-pwa |
| Backend           | Node.js · Express 4 · Prisma 5 · JWT · bcryptjs · csv-parse · multer                                  |
| Banco de dados    | PostgreSQL (Supabase)                                                                                |
| Open Finance      | Pluggy (Open Banking brasileiro)                                                                     |
| Testes            | Vitest + Supertest (51 testes, 10 arquivos)                                                          |
| Deploy            | Vercel (frontend) · Railway (API) · Supabase (banco)                                                  |

## Desafios enfrentados

1. **Open Finance com token criptografado** — o token de sessão OAuth não poderia ficar em texto
   puro. Solução: criptografia **AES-256-GCM** no banco + **modo demonstração** de ponta a ponta
   quando não há chaves de API configuradas.
2. **SQLite → PostgreSQL e o deploy em nuvem** — a API publicada não alcançava o banco: projetos
   novos do Supabase expõem a conexão direta **somente via IPv6**. Solução: migração do schema e uso
   do **pooler dual-stack** do Supabase (us-east-2), com backend no Railway e frontend na Vercel.
3. **Categorização automática + responsividade** — sugerir a categoria certa em toda entrada sem
   regras duplicadas e manter usabilidade em qualquer tela. Solução: categorização centralizada no
   servidor com prioridade clara + grids adaptativos (4/2/1), menu hambúrguer e área de toque ≥ 44px.

## Estrutura do projeto

```
Finview/
├── server/                 # API Express + Prisma
│   ├── prisma/schema.prisma
│   ├── sample.csv          # exemplo de arquivo para importar
│   └── src/
│       ├── routes/         # auth, categories, transactions, goal, metrics, rules, notifications, savings-goals, accounts, sharing, banks
│       ├── services/       # métricas, categorização, alertas, escopo, seed, pluggy (Open Finance)
│       ├── scripts/        # seed-demo (conta demo com dados de exemplo)
│       ├── middleware/     # autenticação e tratamento de erros
│       ├── utils/          # datas e leitura de CSV
│       └── tests/          # testes das rotas (51 testes, 10 arquivos)
└── client/                 # app React (Vite)
    └── src/
        ├── pages/          # Visão geral, Movimentações, Categorias, Metas, Contas, Regras, Bancos, Configurações, Sobre
        ├── components/     # Layout (sidebar), modais, cartões, gráficos, FAB, sino, onboarding, PDF
        ├── stores/         # estado global (Zustand)
        ├── context/        # autenticação (AuthContext)
        └── lib/            # cliente HTTP (axios) e formatação
```

## Como rodar localmente

Requisitos: **Node.js 20.19+** (recomendado 22 LTS ou 24) e **npm 10+**.

```bash
# 1. Instalar dependências (client + server)
npm install

# 2. Configurar o banco
#    Copie server/.env.example para server/.env e defina DATABASE_URL
#    apontando para um PostgreSQL (ex.: Supabase ou um Postgres local).
cp server/.env.example server/.env

# 3. Criar as tabelas e gerar o Prisma Client
npm run setup

# 4. (Opcional) criar a conta demo com dados de exemplo
npm run seed

# 5. Subir API + frontend juntos
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:4000 (health em `/health`)

> Depois do `npm run seed`, entre com **demo@finview.app** / **demo123** e explore o dashboard.

### Variáveis de ambiente (`server/.env`)

| Variável               | Obrigatória | Descrição                                                        |
| ---------------------- | ----------- | ---------------------------------------------------------------- |
| `DATABASE_URL`         | Sim         | URL de conexão do PostgreSQL (ex.: pooler do Supabase)            |
| `JWT_SECRET`           | Sim         | Segredo para assinar os tokens JWT                                |
| `ENCRYPTION_KEY`       | Onde houver Open Finance | Chave de 32 caracteres para AES-256-GCM (tokens do Pluggy) |
| `PORT`                 | Não         | Porta da API (padrão 4000)                                        |
| `PLUGGY_CLIENT_ID`     | Não*        | Client ID do Pluggy (sem isso, o app roda em modo demonstração)   |
| `PLUGGY_CLIENT_SECRET` | Não*        | Client Secret do Pluggy                                           |
| `FRONTEND_URL`         | Onde houver Open Finance | URL do frontend para o redirect do OAuth                |

\* Sem as chaves do Pluggy, o app roda em **modo demonstração**: o fluxo de `/bancos` funciona de
ponta a ponta com dados fictícios.

## Como usar

1. **Cadastre-se** (ou use a conta demo acima).
2. **Onboarding (1ª vez):** informe renda e objetivo (dá para pular).
3. **Visão geral:** escolha o período (Semana/Mês/Ano), filtre por categoria e exporte **PDF**.
4. **Movimentações:** botão flutuante **"+ Nova movimentação"** (categoria sugerida sozinha) ou importe um CSV.
5. **Contas:** crie suas contas para ver o saldo por conta no dashboard.
6. **Metas:** defina o percentual de investimento e crie metas personalizadas.
7. **Regras:** ensine o app a categorizar por palavras-chave.
8. **Bancos:** em `/bancos`, busque seu banco, autorize e veja os últimos 90 dias importados.

## Testes

```bash
npm test
```

51 testes cobrindo cadastro, login, onboarding, CRUD de movimentações, importação CSV, categorias
(com reatribuição para "Outros"), métricas, comparativos, categorização inteligente, notificações,
metas, compartilhamento e conexão de bancos em modo demonstração. Os testes usam um banco SQLite
separado (`server/prisma/test.db`) e rodam em série (`fileParallelism: false`).

## Scripts úteis

| Comando                        | O que faz                                   |
| ------------------------------ | ------------------------------------------- |
| `npm run dev`                  | API (porta 4000) + frontend (porta 5173)    |
| `npm run setup`                | cria o banco e gera o Prisma Client         |
| `npm run seed`                 | cria a conta demo com dados de exemplo      |
| `npm test`                     | roda os testes do backend                   |
| `npm run build`                | gera o build de produção do frontend        |

## API (resumo)

| Método | Rota                          | Descrição                          |
| ------ | ----------------------------- | ---------------------------------- |
| POST   | `/api/auth/register`          | cria conta e devolve token         |
| POST   | `/api/auth/login`             | login e devolve token              |
| GET    | `/api/auth/me`                | dados do usuário logado            |
| PUT    | `/api/auth/onboarding`        | salva progresso do onboarding      |
| GET    | `/api/categories`             | lista categorias (com contagem)    |
| POST   | `/api/categories`             | cria categoria                     |
| PUT    | `/api/categories/:id`         | edita categoria                    |
| DELETE | `/api/categories/:id`         | exclui e reatribui para "Outros"   |
| GET    | `/api/transactions`           | lista movimentações (filtro data)  |
| POST   | `/api/transactions`           | cria movimentação (autocategoriza) |
| PUT    | `/api/transactions/:id`       | edita movimentação                 |
| DELETE | `/api/transactions/:id`       | remove movimentação                |
| POST   | `/api/transactions/import`    | importa CSV (multipart `file`)     |
| GET    | `/api/metrics`                | dados do dashboard (`period`, `categoryId`) |
| GET    | `/api/goal`                   | meta de investimento               |
| PUT    | `/api/goal`                   | atualiza a meta (`percent`)        |
| GET    | `/api/rules`                  | lista regras automáticas           |
| POST   | `/api/rules`                  | cria regra                         |
| DELETE | `/api/rules/:id`              | remove regra                       |
| GET    | `/api/rules/suggest`          | sugere categoria para uma descrição |
| GET    | `/api/notifications`          | lista notificações                 |
| POST   | `/api/notifications/check`    | gera alertas (limite/saldo/meta)   |
| POST   | `/api/notifications/read-all` | marca todas como lidas             |
| GET    | `/api/savings-goals`          | lista metas personalizadas         |
| POST   | `/api/savings-goals`          | cria meta                          |
| PUT    | `/api/savings-goals/:id`      | edita meta                         |
| DELETE | `/api/savings-goals/:id`      | remove meta                        |
| GET    | `/api/accounts`               | lista contas (com saldo calculado) |
| POST   | `/api/accounts`               | cria conta                         |
| PUT    | `/api/accounts/:id`           | edita conta                        |
| DELETE | `/api/accounts/:id`           | remove conta                       |
| GET    | `/api/banks/available`        | lista instituições disponíveis     |
| GET    | `/api/banks`                  | lista bancos conectados            |
| POST   | `/api/banks/connect`          | inicia conexão → `authUrl`         |
| POST   | `/api/banks/claim`            | finaliza conexão com `itemId`      |
| POST   | `/api/banks/:id/sync`         | sincroniza sem duplicar            |
| GET    | `/api/banks/:id/transactions` | movimentações importadas do banco  |
| DELETE | `/api/banks/:id`              | desconecta (mantém as movimentações) |
| POST   | `/api/banks/webhook`          | eventos do Pluggy                  |
| GET    | `/api/sharing`                | convites enviados/recebidos/ativos |
| POST   | `/api/sharing/invite`         | convida por e-mail                 |
| POST   | `/api/sharing/:id/accept`     | convidado aceita                   |
| DELETE | `/api/sharing/:id`            | revoga/cancela compartilhamento    |

## Deploy (produção)

O projeto está publicado:

| Camada   | URL                                                    |
| -------- | ------------------------------------------------------ |
| Frontend | https://finview-ivory.vercel.app                       |
| API      | https://finview-server-production.up.railway.app       |
| Banco    | PostgreSQL gerenciado no Supabase (pooler us-east-2)    |

Para republicar após mudanças:

- **Frontend:** `cd client && npm run build` e `vercel --prod` (env: `VITE_API_URL`).
- **Backend:** na pasta `server`, `railway up` (envs: `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `FRONTEND_URL`).

## Licença

Distribuído sob a **licença MIT**. Veja o arquivo [LICENSE](LICENSE).

## Autor

**João Vitor Souza da Silva** — Estudante de programação.

- GitHub: [joaovitorsouza007](https://github.com/joaovitorsouza007)
- LinkedIn: [joão-vitor-souza-da-silva](https://www.linkedin.com/in/jo%C3%A3o-vitor-souza-da-silva-8b55122ba/)
