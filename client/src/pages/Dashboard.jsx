import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight, FileDown, Landmark, Users } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatMoney, formatDate } from '../lib/format.js';
import useAppStore from '../stores/appStore.js';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PERIODS = [
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mês' },
  { value: 'year', label: 'Último ano' },
];

function deltaBadge(pct) {
  if (pct === null || pct === undefined) return 'sem período anterior para comparar';
  return '';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('month');
  const [categoryId, setCategoryId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Dados compartilhados vêm do store: mudanças feitas em outras telas
  // refletem aqui automaticamente (o `dataVersion` sobe a cada alteração)
  const categories = useAppStore((s) => s.categories);
  const recent = useAppStore((s) => s.recent);
  const sharing = useAppStore((s) => s.sharing);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const fetchCategories = useAppStore((s) => s.fetchCategories);
  const fetchTransactions = useAppStore((s) => s.fetchTransactions);
  const fetchSharing = useAppStore((s) => s.fetchSharing);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
    fetchSharing();
  }, [fetchCategories, fetchTransactions, fetchSharing]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/metrics', {
        params: { period, ...(categoryId ? { categoryId } : {}) },
      });
      setData(res.data);
    } catch {
      setError('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [period, categoryId]);

  // Refaz as métricas quando o período/filtro muda OU quando dados foram alterados
  useEffect(() => { load(); }, [load, dataVersion]);

  async function exportPDF() {
    if (!data || exporting) return;
    setExporting(true);
    try {
      // Import dinâmico: o gerador de PDF só é baixado quando usado
      const [{ pdf }, { default: ReportPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../components/ReportPDF.jsx'),
      ]);
      const periodLabel = PERIODS.find((p) => p.value === period)?.label || 'Período';
      const blob = await pdf(<ReportPDF data={data} user={user} periodLabel={periodLabel} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finview-relatorio-${period}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Não foi possível gerar o PDF.');
    } finally {
      setExporting(false);
    }
  }

  if (loading && !data) {
    return <p className="py-24 text-center text-sm text-slate-500">Carregando...</p>;
  }

  if (error) {
    return <p className="py-24 text-center text-sm text-red-500">{error}</p>;
  }

  const empty = data.summary.count === 0;
  const hasAccounts = data.accounts.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Visão geral</h1>
          <p className="mt-1 text-sm text-slate-500">Seu dinheiro explicado em um minuto.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportPDF} disabled={exporting || empty} className="btn-secondary">
            <FileDown className="h-4 w-4" /> {exporting ? 'Gerando...' : 'Relatório em PDF'}
          </button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-full sm:w-auto"
          >
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Compartilhamento ativo: finança compartilhada com outra pessoa */}
      {sharing.active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <Users className="h-4 w-4 shrink-0" />
          <span>
            Finanças compartilhadas com{' '}
            <strong>{sharing.active.map((a) => a.guest?.name || a.guest?.email).join(', ')}</strong>.
          </span>
        </div>
      )}

      {/* Open Banking: importação automática de saldos e movimentações */}
      {!hasAccounts && (
        <Link
          to="/bancos"
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 transition hover:bg-emerald-100"
        >
          <Landmark className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            <strong>Conecte seu banco</strong> para importar saldos automaticamente — ou crie contas manualmente.
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      )}

      {empty ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">🧾</span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Nenhuma movimentação neste período</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Adicione suas movimentações para ver os gráficos, ou importe um extrato em CSV.
          </p>
          <Link to="/movimentacoes" className="btn-primary mt-5">Adicionar movimentação</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 max-[399px]:grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="O que entrou"
              value={formatMoney(data.summary.income)}
              icon={TrendingUp}
              tone="green"
              invert
              delta={data.compare.incomeDeltaPct}
              hint={data.compare.incomeDeltaPct === null || data.compare.incomeDeltaPct === undefined ? deltaBadge(data.compare.incomeDeltaPct) : undefined}
            />
            <StatCard
              label="O que saiu"
              value={formatMoney(data.summary.expense)}
              icon={TrendingDown}
              tone="red"
              delta={data.compare.expenseDeltaPct}
              hint={data.compare.expenseDeltaPct === null || data.compare.expenseDeltaPct === undefined ? deltaBadge(data.compare.expenseDeltaPct) : undefined}
            />
            <StatCard
              label="Sobrou"
              value={formatMoney(data.summary.balance)}
              icon={Wallet}
              tone={data.summary.balance >= 0 ? 'green' : 'red'}
            />
            <StatCard
              label="Guardado para investir"
              value={formatMoney(data.goal.invested)}
              icon={PiggyBank}
              hint={`Meta: ${formatMoney(data.goal.target)}`}
              tone="blue"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="font-bold text-slate-900">Para onde vai o dinheiro</h2>
              <p className="mb-2 mt-0.5 text-sm text-slate-500">Saídas por categoria</p>
              {data.byCategory.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">Sem saídas neste período.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data.byCategory}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                      >
                        {data.byCategory.map((c) => (
                          <Cell key={c.name} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatMoney(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {data.byCategory.map((c) => (
                      <li key={c.name} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.icon && <span>{c.icon}</span>}
                          {c.name}
                        </span>
                        <span className="font-semibold text-slate-800">{formatMoney(c.total)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="card">
              <h2 className="font-bold text-slate-900">Saldo ao longo do tempo</h2>
              <p className="mb-4 mt-0.5 text-sm text-slate-500">Soma de tudo que entrou menos o que saiu</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.balanceOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    width={75}
                    tickFormatter={(v) => (v / 100).toLocaleString('pt-BR')}
                  />
                  <Tooltip formatter={(v) => formatMoney(v)} />
                  <Line type="monotone" dataKey="saldo" stroke="#059669" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Entrou vs. saiu nos últimos 6 meses</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Mês a mês</p>
                </div>
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      width={75}
                      tickFormatter={(v) => (v / 100).toLocaleString('pt-BR')}
                    />
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Legend />
                    <Bar dataKey="income" name="Entrou" fill="#059669" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Saiu" fill="#f87171" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h2 className="font-bold text-slate-900">Comparativo com o período anterior</h2>
              <p className="mb-4 mt-0.5 text-sm text-slate-500">Gastos por categoria: agora vs. antes</p>
              {data.compareByCategory.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">Sem gastos para comparar.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.compareByCategory.map((c) => (
                    <li key={c.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-slate-600">
                        {c.icon && <span>{c.icon}</span>}
                        <span className="truncate">{c.name}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className="text-slate-400">{formatMoney(c.current)}</span>
                        {c.deltaPct !== null && c.deltaPct !== undefined ? (
                          <span className={`w-14 text-right font-semibold ${c.deltaPct <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {c.deltaPct > 0 ? '+' : ''}{c.deltaPct}%
                          </span>
                        ) : (
                          <span className="w-14 text-right text-slate-300">—</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {hasAccounts && (
              <div className="card">
                <h2 className="font-bold text-slate-900">Saldo por conta</h2>
                <p className="mb-2 mt-0.5 text-sm text-slate-500">Consolidado: {formatMoney(data.accountsTotal)}</p>
                {data.accounts.length === 1 ? (
                  <ul className="mt-2 space-y-2">
                    {data.accounts.map((a) => (
                      <li key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                        <span className="font-medium text-slate-700">{a.name}</span>
                        <span className="font-bold text-slate-900">{formatMoney(a.balance)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.accounts}
                          dataKey="balance"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                        >
                          {data.accounts.map((a) => (
                            <Cell key={a.id} fill={a.color || '#059669'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatMoney(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {data.accounts.map((a) => (
                        <li key={a.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm">
                          <span className="flex items-center gap-2 text-slate-600">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color || '#059669' }} />
                            {a.name}
                          </span>
                          <span className="font-semibold text-slate-800">{formatMoney(a.balance)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Últimas movimentações</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Mais recentes primeiro</p>
                </div>
                <Link
                  to="/movimentacoes"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline"
                >
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Sem movimentações.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recent.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                          {t.category?.icon || '💸'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{t.description}</p>
                          <p className="text-xs text-slate-400">
                            {formatDate(t.date)} · {t.category?.name || 'Sem categoria'}
                            {t.account?.name && <> · {t.account.name}</>}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-sm font-semibold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {t.type === 'INCOME' ? '+' : '−'}{formatMoney(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
