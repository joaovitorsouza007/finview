import { useEffect, useMemo, useState } from 'react';
import { Upload, Trash2, Pencil, Search, Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import toast from 'react-hot-toast';
import { formatMoney, formatDate } from '../lib/format.js';
import useAppStore from '../stores/appStore.js';
import Fab from '../components/Fab.jsx';
import TransactionModal from '../components/TransactionModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const PERIODS = [
  { value: 'all', label: 'Todo o período' },
  { value: 'month', label: 'Último mês' },
  { value: 'year', label: 'Último ano' },
];

const TYPES = [
  { value: '', label: 'Receitas e despesas' },
  { value: 'INCOME', label: 'Somente receitas' },
  { value: 'EXPENSE', label: 'Somente despesas' },
];

// Aplica os filtros escolhidos sobre a lista completa (lado do cliente,
// para dar resposta instantânea ao digitar/selecionar)
function filterList(transactions, { period, categoryId, type, search }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = period === 'month' ? new Date(today.getTime() - 29 * 86400000)
    : period === 'year' ? new Date(today.getTime() - 364 * 86400000)
      : null;

  const q = search.trim().toLowerCase();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    if (from && d < from) return false;
    if (categoryId && t.categoryId !== categoryId) return false;
    if (type && t.type !== type) return false;
    if (q && !t.description.toLowerCase().includes(q)) return false;
    return true;
  });
}

export default function Transactions() {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const fetchCategories = useAppStore((s) => s.fetchCategories);
  const fetchTransactions = useAppStore((s) => s.fetchTransactions);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);

  const [filters, setFilters] = useState({ period: 'all', categoryId: '', type: '', search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  // Lista já filtrada, recalculada só quando os filtros ou os dados mudam
  const filtered = useMemo(
    () => filterList(transactions, filters),
    [transactions, filters]
  );

  const incomes = filtered.filter((t) => t.type === 'INCOME').length;
  const expenses = filtered.filter((t) => t.type === 'EXPENSE').length;

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post('/transactions/import', form);
      await fetchTransactions();
      await fetchCategories();
      toast.success(`${res.data.created} movimentações importadas.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Falha ao importar o arquivo.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const resetFilters = () => setFilters({ period: 'all', categoryId: '', type: '', search: '' });

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Movimentações</h1>
          <p className="mt-1 text-sm text-slate-500">Registre o que entrou e o que saiu.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="btn-primary hidden lg:inline-flex"
        >
          <Plus className="h-4 w-4" /> Nova movimentação
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card h-fit lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <Upload className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Importar de arquivo</h2>
              <p className="text-sm text-slate-500">Extrato em CSV</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Colunas: <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">data, descricao, categoria, valor, tipo</code>.
            A categoria é opcional — sem ela, o app tenta adivinhar pela descrição.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="mt-4 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
          />
          {importing && <p className="mt-2 text-xs text-slate-500">Importando...</p>}
        </div>

        <div className="card lg:col-span-2">
          {/* Barra de filtros: período, categoria, tipo e busca */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 w-full sm:w-auto sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Buscar por descrição..."
                className="input pl-9"
              />
            </div>
            <select value={filters.period} onChange={setFilter('period')} className="input w-full sm:w-auto">
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={filters.categoryId} onChange={setFilter('categoryId')} className="input w-full sm:w-auto">
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
              ))}
            </select>
            <select value={filters.type} onChange={setFilter('type')} className="input w-full sm:w-auto">
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">
              {filtered.length} movimentação{filtered.length === 1 ? '' : 'ões'}
              {incomes > 0 && <> · {incomes} receita{incomes === 1 ? '' : 's'}</>}
              {expenses > 0 && <> · {expenses} despesa{expenses === 1 ? '' : 's'}</>}
            </p>
            {(filters.search || filters.categoryId || filters.type || filters.period !== 'all') && (
              <button onClick={resetFilters} className="text-xs font-semibold text-emerald-600 hover:underline">
                Limpar filtros
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">
                {transactions.length === 0 ? 'Nada por aqui ainda.' : 'Nenhuma movimentação com esses filtros.'}
              </p>
              {transactions.length === 0 ? (
                <button onClick={() => setModalOpen(true)} className="btn-primary mt-4">Adicionar movimentação</button>
              ) : (
                <button onClick={resetFilters} className="btn-secondary mt-4">Limpar filtros</button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <li key={t.id} className="group flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                      {t.category?.icon || '💸'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{t.description}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(t.date)} · {t.category?.name || 'Sem categoria'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`text-sm font-semibold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'INCOME' ? '+' : '−'}{formatMoney(t.amount)}
                    </span>
                    <button
                      onClick={() => { setEditing(t); setModalOpen(true); }}
                      title="Editar"
                      className="btn-icon hover:text-slate-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(t)}
                      title="Excluir"
                      className="btn-icon hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <Fab onClick={() => { setEditing(null); setModalOpen(true); }} label="Nova movimentação" />
      </div>

      {/* Modal compartilhado: cria quando `editing` é null, edita caso contrário */}
      <TransactionModal open={modalOpen} transaction={editing} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          try { await deleteTransaction(toDelete.id); } catch { /* toast já avisou */ }
          setToDelete(null);
        }}
        title="Excluir movimentação"
        message={`Excluir "${toDelete?.description}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
