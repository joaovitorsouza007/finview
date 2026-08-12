# FinView — Case de Portfólio

> Documento completo com a história, a persona, a stack justificada e os desafios técnicos do
> projeto. Complementa a página [`/sobre`](https://finview-ivory.vercel.app/sobre) do app e o
> [README](../README.md).

---

## 1. História do projeto

Por muito tempo, eu não fazia ideia de para onde meu dinheiro ia. O salário caía, o mês passava e,
no fim, a mesma pergunta de sempre: *"mas para onde foi tudo?"*. Comecei com planilhas — todas
abandonadas depois de duas semanas. Os aplicativos que existiam eram cheios de jargão financeiro,
exigiam conexão com banco ou cobravam para fazer algo que parecia simples.

Foi essa **dor pessoal** que me levou a construir o FinView: uma ferramenta que eu gostaria de ter.
Não uma planilha eletrônica, não um app de banco com cinquenta telas, mas um lugar simples para
abrir uma vez por semana e enxergar, em um minuto, o que entrou, o que saiu, para onde o dinheiro
foi e quanto está separado para os meus objetivos.

Conforme o projeto cresceu, ele virou também um grande exercício de engenharia: autenticação, API,
banco de dados, gráficos, PWA e uma integração real de Open Finance. O que começou como uma solução
para a minha própria vida virou um produto completo — e este repositório documenta essa jornada.

## 2. Persona

FinView é para pessoas **entre 22 e 35 anos**, com renda variável ou o primeiro salário estável,
que querem organizar as próprias finanças, mas não têm paciência nem tempo para planilhas. Elas já
tentaram "começar a controlar" várias vezes, desistiram na segunda semana e hoje vivem no escuro
sobre o próprio dinheiro: gastam sem saber para onde vai, adiam o primeiro investimento e se sentem
perdidas quando o mês aperta. O que procuram não é um sistema de contabilidade — é **clareza**:
saber que estão no controle, mesmo que não sejam "boas de número".

## 3. Stack e justificativa

### Frontend

| Tecnologia        | Por que foi escolhida                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| **React 18**      | Componentização e ecossistema maduro; base sólida para evoluir sem reescrever      |
| **Vite 7**        | Dev server instantâneo (HMR) e build de produção otimizado por padrão              |
| **Tailwind CSS**  | Design rápido e consistente com utilitários; sem CSS solto e sem naming wars       |
| **Recharts 3**    | Gráficos declarativos em SVG, leves e fáceis de combinar com o estado do app       |
| **Zustand 5**     | Estado global simples, sem boilerplate; qualquer tela atualiza o dashboard          |
| **React Router 7**| Navegação declarativa com rotas protegidas e públicas                               |
| **Lucide**        | Ícones consistentes e acessíveis, em todo o app                                    |
| **React Hook Form** | Formulários performáticos com menos re-renders                                    |
| **Axios**         | Cliente HTTP com interceptors (token JWT automático e logout em 401)               |
| **vite-plugin-pwa** | App instalável e offline — FinView no celular, como um app nativo                |

### Backend

| Tecnologia        | Por que foi escolhida                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| **Node.js**       | Mesma linguagem do frontend; alto desempenho para I/O e API REST                   |
| **Express 4**     | Framework enxuto e amplamente conhecido; fácil de testar e estender                 |
| **Prisma 5**      | Schema declarativo, migrations e client type-safe                                  |
| **JWT + bcryptjs**| Autenticação stateless com hash de senha seguro                                     |
| **csv-parse**     | Importação de extratos com parsing robusto                                         |
| **multer**        | Upload de arquivos (CSV) com multipart                                              |

### Dados, integrações e infra

| Tecnologia            | Por que foi escolhida                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| **PostgreSQL/Supabase** | Banco relacional gerenciado com backups; ideal para produção multi-usuário  |
| **Pluggy (Open Finance)** | Integração com o Open Finance brasileiro real (Nubank, Itaú, Bradesco...)  |
| **Vitest + Supertest** | Testes de API rápidos e legíveis (51 testes)                                |
| **Vercel**            | Deploy estático simples para o frontend (SPA + PWA)                         |
| **Railway**           | Deploy contínuo da API Node sem complexidade de infra                        |

## 4. Desafios técnicos

### 4.1 Open Finance com token criptografado

- **Problema:** para ler contas bancárias reais, o app precisa guardar o token de sessão do OAuth.
  Persistir esse token em texto puro seria uma falha de segurança grave.
- **Abordagem:** criptografar o token com **AES-256-GCM** (chave `ENCRYPTION_KEY` de 32 bytes)
  antes de salvar. Sem chaves de API configuradas, o sistema cai em **modo demonstração**: o fluxo
  completo (buscar banco → autorizar → importar) funciona com dados fictícios.
- **Solução:** conexão real com bancos, sincronização manual e automática (webhook), deduplicação
  por `externalId` e categorização automática das movimentações importadas.

### 4.2 Migração SQLite → PostgreSQL e o deploy em nuvem

- **Problema:** o MVP rodava em SQLite local — inviável para produção multi-usuário. Ao migrar para
  o PostgreSQL (Supabase) e publicar a API no Railway, o servidor **não conseguia alcançar o banco**.
- **Abordagem:** a investigação começou no schema (troca de `provider` em uma linha), mas o erro de
  conexão persistia. Analisando o DNS, descobri que projetos novos do Supabase expõem a conexão
  direta **apenas via IPv6** — e o Railway não tem rota IPv6. A saída foi o **pooler dual-stack** do
  Supabase.
- **Solução:** identificar a região correta do projeto (us-east-2), usar o pooler na `DATABASE_URL`
  e publicar backend (Railway) + frontend (Vercel) + banco (Supabase) de ponta a ponta.

### 4.3 Categorização automática + interface 100% responsiva

- **Problema:** duas frentes delicadas. (1) Sugerir a categoria certa em **toda** entrada de dados
  (digitação, importação CSV e transações do banco) sem criar regras duplicadas. (2) Manter
  usabilidade confortável em qualquer tela, de um iPhone SE a um desktop 1920px.
- **Abordagem:** categorização centralizada no servidor com ordem de prioridade clara
  (*regras do usuário → regras padrão → "Outros"*) e criação de regra em um clique. Para
  responsividade: grids adaptativos (dashboard 4/2/1 colunas), sidebar em hambúrguer no mobile,
  modais em tela cheia e área de toque mínima de 44px.
- **Solução:** categorização inteligente consistente em todas as entradas e uma interface sem
  overflow horizontal, validada em múltiplas resoluções.

## 5. Aprendizados

- **Segurança não é opcional:** criptografar dados sensíveis desde o início evita retrabalho.
- **Ambientes diferentes têm comportamentos diferentes:** o mesmo banco que funciona na sua rede
  pode não ser alcançável do servidor em nuvem (IPv4 × IPv6).
- **Responsividade é disciplina:** testar em resoluções reais e definir áreas de toque mínimas faz a
  diferença entre um app "que abre no celular" e um app que é confortável no celular.
- **Projeto pessoal é o melhor laboratório:** aprender autenticação, API, banco, PWA e integração
  externa em um produto que resolve um problema real.

## 6. Próximos passos

- Refresh token e validação de e-mail
- Backup e exportação completa dos dados
- Relatórios avançados (por categoria/período) e recomendações de economia
- Testes de frontend (componentes) e cobertura E2E
