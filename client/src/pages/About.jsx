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
  Info,
} from 'lucide-react';
import Logo from '../components/brand/Logo.jsx';
import { GithubIcon, LinkedinIcon } from '../components/brand/SocialIcons.jsx';
import joao from '../assets/joao.jpeg';

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
      { name: 'Vercel', color: '#000000', url: 'https://vercel.com' },
      { name: 'Railway', color: '#7C3AED', url: 'https://railway.app' },
    ],
  },
];

const FEATURES = [
  { icon: Zap, label: 'Dashboard com gráficos' },
  { icon: Target, label: 'Metas de investimento' },
  { icon: Database, label: 'Importação de CSV' },
  { icon: Smartphone, label: 'PWA instalável e responsivo' },
  { icon: Sparkles, label: 'Categorização inteligente' },
];

function Badge({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
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
          <Link to="/" className="flex items-center">
            <Logo size={36} variant="horizontal" tone="color" />
          </Link>
          <Link to={user ? '/dashboard' : '/login'} className="btn-primary">
            {user ? 'Abrir o app' : 'Entrar no app'}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 md:px-6">
        {/* Hero */}
        <section className="py-14 text-center md:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Info className="h-3.5 w-3.5" /> Case de portfólio · Open Source
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Sua vida financeira em um só lugar
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 md:text-lg">
            O FinView é um organizador de vida financeira: dashboard com gráficos, metas e
            categorização inteligente — simples o bastante para abrir uma vez por semana e entender
            tudo em um minuto.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={user ? '/dashboard' : '/login'} className="btn-primary w-full sm:w-auto">
              {user ? 'Voltar ao dashboard' : 'Experimentar a demo'} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-secondary w-full sm:w-auto">
              <GithubIcon className="h-4 w-4" /> Ver o código
            </a>
          </div>
        </section>

        {/* Funcionalidades em destaque */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <div key={f.label} className="card flex flex-col items-center gap-2 py-4 text-center">
              <f.icon className="h-5 w-5 text-blue-600" />
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
              existiam eram cheios de termos técnicos, exigiam conexão com banco ou cobravam para
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
        <Section id="solucao" title="A solução" subtitle="Clareza em uma só tela. Sem planilhas, sem notificações infinitas.">
          <div className="card space-y-4">
            <p className="text-slate-600">
              O FinView resolve isso com uma única tela que responde: <strong>o que entrou, o que
              saiu, para onde o dinheiro foi e quanto está guardado para os seus objetivos.</strong> Em vez
              de cadastrar lançamento por lançamento, a categoria é sugerida automaticamente; em vez de
              digitar extrato, o CSV é importado de uma vez.
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

        {/* Autor */}
        <Section id="autor" title="O autor" subtitle="Quem construiu o FinView.">
          <div className="card flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <img
              src={joao}
              alt="João Vitor Souza da Silva"
              className="h-24 w-24 shrink-0 rounded-3xl border border-slate-200 object-cover shadow-sm"
            />
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-slate-900">João Vitor Souza da Silva</h3>
              <p className="mt-0.5 text-sm font-medium text-blue-700">Estudante de programação</p>
              <p className="mt-3 max-w-xl text-slate-600">
                Construir o FinView foi a forma que encontrei de unir duas coisas: resolver a minha
                própria dor financeira e aprender, na prática, a desenvolver um produto completo —
                do frontend ao banco de dados, da autenticação à importação de dados.
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
            <Sparkles className="h-4 w-4 text-blue-500" /> FinView · clareza em um minuto
          </p>
          <div className="flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition hover:text-slate-600">
              GitHub
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="transition hover:text-slate-600">
              LinkedIn
            </a>
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
