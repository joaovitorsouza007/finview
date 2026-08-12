import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ExternalLink,
  ArrowRight,
  Sparkles,
  Target,
  ShieldCheck,
  Zap,
  Smartphone,
  Database,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Info,
} from 'lucide-react';

function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

const GITHUB_URL = 'https://github.com/joaovitorsouza007/finview';
const LINKEDIN_URL = 'https://www.linkedin.com/in/jo%C3%A3o-vitor-souza-da-silva-8b55122ba/';

const STACK = [
  {
    group: 'Frontend',
    items: [
      { name: 'React 18', color: '#61DAFB', url: 'https://react.dev' },
      { name: 'Vite 7', color: '#646CFF', url: 'https://vitejs.dev' },
      { name: 'Tailwind CSS', color: '#38BDF8', url: 'https://tailwindcss.com' },
      { name: 'Recharts 3', color: '#22B8CF', url: 'https://recharts.org' },
      { name: 'Zustand 5', color: '#8B5CF6', url: 'https://github.com/pmndrs/zustand' },
      { name: 'React Router 7', color: '#CA4245', url: 'https://reactrouter.com' },
      { name: 'Lucide', color: '#1793D1', url: 'https://lucide.dev' },
      { name: 'React Hook Form', color: '#EC5990', url: 'https://react-hook-form.com' },
      { name: 'Axios', color: '#5A29E4', url: 'https://axios-http.com' },
    ],
  },
  {
    group: 'Backend',
    items: [
      { name: 'Node.js', color: '#3C873A', url: 'https://nodejs.org' },
      { name: 'Express', color: '#000000', url: 'https://expressjs.com' },
      { name: 'Prisma 5', color: '#5A67D8', url: 'https://prisma.io' },
      { name: 'JWT', color: '#000000', url: 'https://jwt.io' },
      { name: 'bcryptjs', color: '#2C3E50', url: 'https://github.com/dcodeIO/bcrypt.js' },
      { name: 'Vitest + Supertest', color: '#FCC72B', url: 'https://vitest.dev' },
    ],
  },
  {
    group: 'Dados & Deploy',
    items: [
      { name: 'PostgreSQL', color: '#4169E1', url: 'https://www.postgresql.org' },
      { name: 'Supabase', color: '#3ECF8E', url: 'https://supabase.com' },
      { name: 'Pluggy (Open Finance)', color: '#14B8A6', url: 'https://pluggy.ai' },
      { name: 'Vercel', color: '#000000', url: 'https://vercel.com' },
      { name: 'Railway', color: '#7C3AED', url: 'https://railway.app' },
    ],
  },
];

const CHALLENGES = [
  {
    title: 'Open Finance com token criptografado',
    problem:
      'Integrar a leitura de contas bancárias reais exigia guardar o token de acesso da sessão OAuth. Guardá-lo em texto puro no banco seria um risco de segurança inaceitável.',
    approach:
      'Usei o Open Finance brasileiro (Pluggy) e criptografei o token com AES-256-GCM antes de persistir. Sem chaves da API configuradas, o sistema opera em modo demonstração — o fluxo completo funciona de ponta a ponta com dados fictícios.',
    solution:
      'Conexão real com bancos (Nubank, Itaú, Bradesco...), sincronização manual e via webhook, deduplicação de movimentações por externalId e categorização automática do que chega do banco.',
  },
  {
    title: 'Migração SQLite → PostgreSQL e o deploy em nuvem',
    problem:
      'Produção multi-usuário não poderia rodar em SQLite local. Ao migrar para o PostgreSQL (Supabase) e publicar a API, o servidor não conseguia alcançar o banco de dados.',
    approach:
      'Migrei o schema do Prisma em uma linha, mas o erro de conexão persistia. Investigando o DNS, descobri que projetos novos do Supabase só expõem a conexão direta via IPv6 — e o provedor de deploy não tinha rota IPv6. A solução foi usar o pooler dual-stack do Supabase.',
    solution:
      'Backend publicado no Railway, frontend na Vercel e banco no Supabase via pooler — com PostgreSQL de verdade e o app funcionando de ponta a ponta em produção.',
  },
  {
    title: 'Categorização automática + interface 100% responsiva',
    problem:
      'Duas frentes delicadas: sugerir a categoria certa a cada lançamento (e na importação de CSV) sem criar regras duplicadas, e manter a usabilidade confortável em qualquer tamanho de tela.',
    approach:
      'Centralizei a categorização no servidor com uma ordem de prioridade clara: regras do usuário → regras padrão → "Outros", com criação de regra em um clique. Para responsividade, reestruturei grids (4/2/1 colunas), sidebar em hambúrguer no mobile e botões com área de toque mínima de 44px.',
    solution:
      'Categorização inteligente funcionando em todas as entradas de dados e uma interface sem overflow horizontal em celulares, tablets e desktops.',
  },
];

const FEATURES = [
  { icon: Zap, label: 'Dashboard com gráficos' },
  { icon: Target, label: 'Metas de investimento' },
  { icon: Database, label: 'Importação de CSV' },
  { icon: ShieldCheck, label: 'Conexão com bancos (Open Finance)' },
  { icon: Smartphone, label: 'PWA instalável e responsivo' },
  { icon: Sparkles, label: 'Categorização inteligente' },
];

function Badge({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
      {item.name}
    </a>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-12 md:py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function About() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white shadow-sm">
              F
            </span>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900">FinView</p>
              <p className="text-[11px] text-slate-400">Sobre o projeto</p>
            </div>
          </Link>
          <Link to={user ? '/' : '/login'} className="btn-primary">
            {user ? 'Abrir o app' : 'Entrar no app'}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 md:px-6">
        {/* Hero */}
        <section className="py-14 text-center md:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Info className="h-3.5 w-3.5" /> Case de portfólio · Open Source
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Sua vida financeira em um só lugar
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 md:text-lg">
            O FinView é um organizador de vida financeira: dashboard com gráficos, metas,
            categorização inteligente e conexão real com bancos via Open Finance — simples o
            bastante para abrir uma vez por semana e entender tudo em um minuto.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={user ? '/' : '/login'} className="btn-primary w-full sm:w-auto">
              {user ? 'Voltar ao dashboard' : 'Experimentar a demo'} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-secondary w-full sm:w-auto">
              <GithubIcon className="h-4 w-4" /> Ver o código
            </a>
          </div>
        </section>

        {/* Funcionalidades em destaque */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURES.map((f) => (
            <div key={f.label} className="card flex flex-col items-center gap-2 py-4 text-center">
              <f.icon className="h-5 w-5 text-emerald-600" />
              <p className="text-xs font-medium leading-tight text-slate-600">{f.label}</p>
            </div>
          ))}
        </section>

        {/* O problema */}
        <Section id="problema" title="O problema" subtitle="A dor que deu origem ao projeto.">
          <div className="card space-y-4">
            <p className="text-slate-600">
              Por muito tempo, eu não fazia ideia de para onde meu dinheiro ia. O salário caía,
              o mês passava e, no fim, a mesma pergunta de sempre: <em>"mas para onde foi tudo?"</em>.
              Comecei com planilhas — todas abandonadas depois de duas semanas. Os aplicativos que
              existiam eram cheios de jargão financeiro, exigiam conexão com banco ou cobravam para
              fazer algo que parecia simples.
            </p>
            <p className="text-slate-600">
              A dor não era de quem não entende de finanças. Era de quem quer entender, mas não
              encontra uma ferramenta que não cobre o preço de ser chata. Sem controle, o dinheiro
              some, o primeiro investimento fica sempre para depois e qualquer imprevisto vira
              ansiedade.
            </p>
          </div>
        </Section>

        {/* A solução */}
        <Section id="solucao" title="A solução" subtitle="Clareza, não jargão. Sem planilhas, sem notificações infinitas.">
          <div className="card space-y-4">
            <p className="text-slate-600">
              O FinView resolve isso com uma única tela que responde: <strong>o que entrou, o que
              saiu, para onde o dinheiro foi e quanto está guardado para os seus objetivos.</strong> Em vez
              de cadastrar lançamento por lançamento, a categoria é sugerida automaticamente; em vez de
              digitar extrato, o banco é conectado e os últimos 90 dias chegam sozinhos.
            </p>
            <p className="text-slate-600">
              É um produto pensado para constância, não para gamificação: você abre uma vez por
              semana, enxerga sua vida financeira em um minuto e fecha o app. Nada de notificações
              empurrando seu mês para baixo.
            </p>
          </div>
        </Section>

        {/* Para quem é */}
        <Section id="persona" title="Para quem é" subtitle="FinView é para pessoas que...">
          <div className="card">
            <p className="text-slate-600">
              ...têm entre 22 e 35 anos, com renda variável ou o primeiro salário estável, e querem
              organizar as próprias finanças, mas não têm paciência nem tempo para planilhas. Já
              tentaram "começar a controlar" várias vezes, desistiram na segunda semana e hoje vivem
              no escuro sobre o próprio dinheiro: gastam sem saber para onde vai, adiam o primeiro
              investimento e se sentem perdidas quando o mês aperta.
            </p>
          </div>
        </Section>

        {/* Stack */}
        <Section id="stack" title="Tecnologias" subtitle="Escolhidas por produtividade, ecossistema e facilidade de evoluir.">
          <div className="space-y-6">
            {STACK.map((group) => (
              <div key={group.group}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{group.group}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <Badge key={item.name} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Desafios */}
        <Section id="desafios" title="Desafios enfrentados" subtitle="Três problemas reais e como foram resolvidos.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {CHALLENGES.map((c) => (
              <div key={c.title} className="card flex flex-col">
                <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                <dl className="mt-4 flex flex-1 flex-col gap-4 text-sm">
                  <div>
                    <dt className="mb-1 flex items-center gap-1.5 font-semibold text-red-500">
                      <AlertTriangle className="h-4 w-4" /> O problema
                    </dt>
                    <dd className="text-slate-500">{c.problem}</dd>
                  </div>
                  <div>
                    <dt className="mb-1 flex items-center gap-1.5 font-semibold text-amber-600">
                      <Wrench className="h-4 w-4" /> A abordagem
                    </dt>
                    <dd className="text-slate-500">{c.approach}</dd>
                  </div>
                  <div>
                    <dt className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> A solução
                    </dt>
                    <dd className="text-slate-500">{c.solution}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Section>

        {/* Autor */}
        <Section id="autor" title="O autor" subtitle="Quem construiu o FinView.">
          <div className="card flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-3xl font-bold text-white shadow-lg shadow-emerald-600/20">
              JV
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-slate-900">João Vitor Souza da Silva</h3>
              <p className="mt-0.5 text-sm font-medium text-emerald-700">Estudante de programação</p>
              <p className="mt-3 max-w-xl text-slate-600">
                Construir o FinView foi a forma que encontrei de unir duas coisas: resolver a minha
                própria dor financeira e aprender, na prática, a desenvolver um produto completo —
                do frontend ao banco de dados, da autenticação à integração com Open Finance.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <LinkedinIcon className="h-4 w-4" /> LinkedIn
                </a>
                <a
                  href="https://github.com/joaovitorsouza007"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <GithubIcon className="h-4 w-4" /> GitHub
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* Repositório + Licença */}
        <Section id="repositorio" title="Repositório e licença">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="card">
              <h3 className="text-base font-bold text-slate-900">Código aberto</h3>
              <p className="mt-2 text-sm text-slate-500">
                Todo o código está disponível no GitHub, com documentação, testes automatizados e
                instruções de como rodar localmente.
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-4 w-full"
              >
                <GithubIcon className="h-4 w-4" /> Visitar repositório
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="card">
              <h3 className="text-base font-bold text-slate-900">Licença MIT</h3>
              <p className="mt-2 text-sm text-slate-500">
                Você pode usar, copiar, modificar e distribuir o FinView livremente, inclusive em
                projetos comerciais — basta manter o aviso de copyright.
              </p>
              <a
                href={`${GITHUB_URL}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary mt-4 w-full"
              >
                <ShieldCheck className="h-4 w-4" /> Ver a licença
              </a>
            </div>
          </div>
        </Section>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400 md:flex-row md:px-6">
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-500" /> FinView · clareza, não jargão
          </p>
          <div className="flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition hover:text-slate-600">
              GitHub
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="transition hover:text-slate-600">
              LinkedIn
            </a>
            <Link to="/login" className="font-medium text-emerald-600 hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
