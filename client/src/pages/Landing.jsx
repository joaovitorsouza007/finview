import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Database,
  LayoutDashboard,
  LineChart,
  Menu,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tags,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import Logo from '../components/brand/Logo.jsx';
import { GithubIcon } from '../components/brand/SocialIcons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Visão geral em um minuto',
    text: 'Tudo o que importa em uma só tela: saldo, entradas, saídas e metas. Abra uma vez por semana.',
  },
  {
    icon: Tags,
    title: 'Categorias que se explicam',
    text: 'Cada gasto recebe uma categoria na hora. Crie regras simples e deixe o resto por conta.',
  },
  {
    icon: Target,
    title: 'Metas com progresso real',
    text: 'Defina um objetivo, aporte todo mês e veja a barra de progresso encher.',
  },
  {
    icon: TrendingUp,
    title: 'Tendência, não susto',
    text: 'Gráficos que mostram a evolução mês a mês — sem surpresa no fim do mês.',
  },
  {
    icon: Database,
    title: 'Importe seu extrato em CSV',
    text: 'Já tem os dados em uma planilha? Importe um CSV e comece de onde parou.',
  },
  {
    icon: Users,
    title: 'Feito para dividir',
    text: 'Finanças de casal ou família? Convide, organize e acompanhe juntos.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: Smartphone,
    title: 'Crie sua conta',
    text: 'Cadastro gratuito em menos de um minuto. Sem cartão de crédito.',
  },
  {
    num: '02',
    icon: Wallet,
    title: 'Cadastre ou importe seus dados',
    text: 'Adicione contas e movimentações manualmente ou importe um extrato CSV.',
  },
  {
    num: '03',
    icon: LineChart,
    title: 'Enxergue e acompanhe',
    text: 'Veja para onde seu dinheiro vai e acompanhe suas metas com clareza.',
  },
];

function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="FinView — página inicial">
          <Logo size={32} tone="color" />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/sobre" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Sobre o projeto
          </Link>
          {user ? (
            <Link to="/dashboard" className="btn-primary !px-4">
              Abrir o app
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn-primary !px-4">
                Criar conta grátis
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/sobre" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Sobre o projeto
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Abrir o app
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Entrar
                </Link>
                <Link to="/cadastro" className="btn-primary">
                  Criar conta grátis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function HeroMockup() {
  const bars = [38, 55, 42, 70, 48, 62, 88, 52, 66, 44, 74, 92];
  const cats = [
    { label: 'Alimentação', pct: 78, color: 'bg-blue-500' },
    { label: 'Transporte', pct: 45, color: 'bg-blue-400' },
    { label: 'Moradia', pct: 62, color: 'bg-emerald-400' },
    { label: 'Lazer', pct: 30, color: 'bg-slate-200' },
  ];

  return (
    <div className="relative mx-auto mt-16 max-w-3xl">
      <div className="absolute -inset-x-8 -top-6 -bottom-6 rounded-3xl bg-gradient-to-r from-blue-600/10 via-emerald-400/10 to-blue-600/10 blur-2xl" />
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-medium text-slate-400">Visão geral · Agosto 2025</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Saldo total', value: 'R$ 12.480', up: '+8,2%' },
            { label: 'Gastos do mês', value: 'R$ 3.210', up: '-4,1%' },
            { label: 'Investido', value: 'R$ 1.500', up: '+12%' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
              <p className="mt-0.5 truncate text-sm font-bold text-slate-900 sm:text-lg">{s.value}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" /> {s.up}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end gap-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4" style={{ height: '8.5rem' }}>
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-blue-500/85" style={{ height: `${h}%` }} />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
          {cats.map((c) => (
            <div key={c.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">{c.label}</span>
                <span className="font-semibold text-slate-700">{c.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  {
    q: 'Quanto custa?',
    a: 'Nada. O FinView é gratuito e open source (MIT). Cadastro em menos de um minuto, sem cartão de crédito.',
  },
  {
    q: 'Preciso conectar meu banco?',
    a: 'Não. Você cadastra suas contas e movimentações manualmente ou importa um extrato CSV. Seus dados ficam só com você.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. As informações são protegidas e acessíveis apenas com a sua senha. Nada é compartilhado com terceiros.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Sim. O FinView é um PWA: você pode instalá-lo como um app na tela inicial e usar a qualquer momento.',
  },
  {
    q: 'Posso dividir as finanças com alguém?',
    a: 'Sim. O FinView foi pensado para casais e famílias — dá para organizar as finanças de quem divide a vida com você.',
  },
];

function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Perguntas frequentes
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Ainda com dúvidas?
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => (
            <div key={item.q} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/40">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                <Plus
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-45' : ''}`}
                />
              </button>
              {open === i && (
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 pb-10 pt-20 text-center sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" /> Organizador de vida financeira · Open Source
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Enxergue suas finanças{' '}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              de verdade
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Entradas, saídas, categorias e metas em um só painel — abra uma vez por semana e
            entenda tudo em um minuto.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link to="/dashboard" className="btn-primary w-full sm:w-auto">
                Abrir o app <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/cadastro" className="btn-primary w-full sm:w-auto">
                  Começar agora <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-secondary w-full sm:w-auto">
                  Testar a demo
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" /> Grátis e open source (MIT)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Seus dados protegidos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-emerald-500" /> Instalável no celular
            </span>
          </div>
        </div>

        <HeroMockup />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Recursos</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tudo o que você precisa para ter controle
          </h2>
          <p className="mt-3 text-slate-600">
            Foco no essencial: ver seu dinheiro, entender seus gastos e avançar nas metas.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-slate-100 bg-white p-6 transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Como funciona</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Três passos para sair do escuro
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.num} className="relative rounded-2xl border border-slate-100 bg-white p-6">
                <span className="text-5xl font-extrabold text-slate-100">{s.num}</span>
                <div className="-mt-8 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 px-6 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-blue-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Pronto para enxergar suas finanças?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-blue-100">
            Crie sua conta grátis agora. Você também pode testar a demo completa sem cadastro.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link to="/dashboard" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                Abrir o app <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/cadastro" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                  Criar conta grátis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Testar a demo
                </Link>
              </>
            )}
          </div>
          <p className="relative mt-4 text-xs text-blue-200/80">
            Demo: demo@finview.app · senha demo123
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo size={26} tone="color" />
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} FinView · open source (MIT)</p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/joaovitorsouza007/finview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition hover:text-slate-700"
              aria-label="Repositório no GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <Link to="/sobre" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
              Sobre o projeto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
