import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Tags, Target, Wallet, Landmark, Tags as RulesIcon, Settings, LogOut, Menu, X, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationsBell from './NotificationsBell.jsx';

const NAV = [
  { to: '/', end: true, label: 'Visão geral', icon: LayoutDashboard },
  { to: '/movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
  { to: '/categorias', label: 'Categorias', icon: Tags },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/contas', label: 'Contas', icon: Wallet },
  { to: '/bancos', label: 'Bancos conectados', icon: Landmark },
];

function navClass({ isActive }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-700'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`;
}

function iconNavClass({ isActive }) {
  return `flex items-center justify-center rounded-xl p-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-700'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`;
}

function Brand({ compact = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${compact ? 'flex-col gap-3' : ''}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white shadow-sm">
        F
      </span>
      {!compact && (
        <div>
          <p className="text-base font-bold leading-tight text-slate-900">FinView</p>
          <p className="text-[11px] text-slate-400">Sua vida financeira</p>
        </div>
      )}
    </div>
  );
}

// Navegação completa (desktop e overlay mobile)
function NavFull({ onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={navClass}
          title={item.label}
        >
          <item.icon className="h-[18px] w-[18px]" />
          {item.label}
        </NavLink>
      ))}
      <NavLink to="/regras" onClick={onNavigate} className={navClass} title="Regras automáticas">
        <RulesIcon className="h-[18px] w-[18px]" />
        Regras automáticas
      </NavLink>
    </nav>
  );
}

// Navegação compacta (tablet): só ícones
function NavIcons() {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={iconNavClass} title={item.label}>
          <item.icon className="h-5 w-5" />
        </NavLink>
      ))}
      <NavLink to="/regras" className={iconNavClass} title="Regras automáticas">
        <RulesIcon className="h-5 w-5" />
      </NavLink>
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu mobile ao trocar de página
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Trava o scroll do fundo enquanto o menu está aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar completa (desktop ≥ 1024px) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="px-6 py-6">
          <Brand />
        </div>
        <NavFull />
        <div className="border-t border-slate-100 px-3 py-4">
          <NavLink to="/sobre" className={navClass}>
            <Info className="h-[18px] w-[18px]" />
            Sobre o projeto
          </NavLink>
          <NavLink to="/configuracoes" className={navClass}>
            <Settings className="h-[18px] w-[18px]" />
            Configurações
          </NavLink>
          <div className="mt-1 flex items-center justify-between rounded-xl px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{user?.name || user?.email}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar compacta só com ícones (tablet 768–1023px) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-16 flex-col items-center border-r border-slate-200 bg-white md:flex lg:hidden">
        <div className="flex w-full justify-center py-6">
          <Brand compact />
        </div>
        <NavIcons />
        <div className="flex w-full flex-col items-center border-t border-slate-100 px-2 py-4">
          <NavLink to="/sobre" className={iconNavClass} title="Sobre o projeto">
            <Info className="h-5 w-5" />
          </NavLink>
          <NavLink to="/configuracoes" className={iconNavClass} title="Configurações">
            <Settings className="h-5 w-5" />
          </NavLink>
          <button
            onClick={handleLogout}
            title="Sair"
            className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Menu mobile (overlay animado) */}
      <div className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <div
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <Brand />
            <button
              onClick={() => setMobileOpen(false)}
              title="Fechar menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavFull onNavigate={() => setMobileOpen(false)} />
          <div className="border-t border-slate-100 px-3 py-4">
            <NavLink to="/sobre" className={navClass}>
              <Info className="h-[18px] w-[18px]" />
              Sobre o projeto
            </NavLink>
            <NavLink to="/configuracoes" className={navClass}>
              <Settings className="h-[18px] w-[18px]" />
              Configurações
            </NavLink>
            <div className="mt-1 flex items-center justify-between rounded-xl px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">{user?.name || user?.email}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-16 lg:pl-64">
        {/* Cabeçalho mobile: hambúrguer + marca + sino */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileOpen(true)}
                title="Abrir menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Brand />
            </div>
            <div className="flex items-center gap-1">
              <NotificationsBell />
              <button
                onClick={() => navigate('/configuracoes')}
                title="Configurações"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:text-slate-900"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                title="Sair"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Barra superior (desktop/tablet): sino */}
        <div className="sticky top-0 z-20 hidden items-center justify-end gap-1 border-b border-slate-200 bg-white/80 px-8 py-3 backdrop-blur md:flex">
          <NotificationsBell />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
