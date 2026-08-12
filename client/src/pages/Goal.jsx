import { useEffect, useState } from 'react';
import { HandCoins, TrendingUp, PiggyBank, Plus, Pencil, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatMoney, formatDate } from '../lib/format.js';
import useAppStore from '../stores/appStore.js';
import GoalCard from '../components/GoalCard.jsx';
import SavingsGoalModal from '../components/SavingsGoalModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Fab from '../components/Fab.jsx';

const STEPS = [
  {
    icon: HandCoins,
    title: 'Defina quanto guardar',
    text: 'Escolha um percentual do que entra (ex.: 10%). Não precisa ser alto — constância importa mais.',
  },
  {
    icon: PiggyBank,
    title: 'Registre o que investe',
    text: 'Use a categoria "Investimentos" nas suas movimentações para somar o que já foi guardado.',
  },
  {
    icon: TrendingUp,
    title: 'Acompanhe o progresso',
    text: 'Abra o app uma vez por semana e veja o quanto já avançou em relação à meta do mês.',
  },
];

// Metas: além do percentual de investimento mensal, agora com metas
// personalizadas (ex.: reserva de emergência, viagem, entrada do imóvel).
export default function Goal() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dataVersion = useAppStore((s) => s.dataVersion);
  const savingsGoals = useAppStore((s) => s.savingsGoals);
  const fetchSavingsGoals = useAppStore((s) => s.fetchSavingsGoals);
  const deleteSavingsGoal = useAppStore((s) => s.deleteSavingsGoal);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  async function load() {
    setError('');
    try {
      const [g, m] = await Promise.all([
        api.get('/goal'),
        api.get('/metrics', { params: { period: 'month' } }),
      ]);
      setGoal({
        ...g.data,
        invested: m.data.goal.invested,
        target: m.data.goal.target,
        progress: m.data.goal.progress,
      });
    } catch {
      setError('Não foi possível carregar a meta.');
    } finally {
      setLoading(false);
    }
  }

  // Recarrega também quando movimentações/categorias forem alteradas em outra tela
  useEffect(() => { load(); }, [dataVersion]);
  useEffect(() => { fetchSavingsGoals(); }, [fetchSavingsGoals, dataVersion]);

  if (loading) {
    return <p className="py-24 text-center text-sm text-slate-500">Carregando...</p>;
  }

  if (error) {
    return <p className="py-24 text-center text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Metas</h1>
        <p className="mt-1 text-sm text-slate-500">Estabeleça quanto do que entra você quer guardar para investir.</p>
      </div>

      <GoalCard goal={goal} onSave={load} />

      {/* Metas personalizadas */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Metas personalizadas</h2>
            <p className="text-sm text-slate-500">Reserva de emergência, viagem, entrada do imóvel... o que quiser.</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="btn-primary hidden lg:inline-flex"
          >
            <Plus className="h-4 w-4" /> Nova meta
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Target className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-700">Nenhuma meta personalizada ainda</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Crie uma meta e vincule a uma categoria de gasto para acompanhar o progresso automaticamente.</p>
            <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary mt-5">
              <Plus className="h-4 w-4" /> Criar meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savingsGoals.map((sg) => {
              const pct = sg.targetAmount > 0 ? Math.min(100, Math.round((sg.savedAmount / sg.targetAmount) * 100)) : 0;
              const done = pct >= 100;
              return (
                <div key={sg.id} className="card group">
                  <div className="flex items-start justify-between">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </span>
                    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => { setEditing(sg); setModalOpen(true); }}
                        title="Editar"
                        className="btn-icon hover:text-slate-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setToDelete(sg)}
                        title="Excluir"
                        className="btn-icon hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">{sg.name}</p>
                  <p className="text-xs text-slate-400">
                    {sg.categoryId ? 'Progresso pela soma de gastos da categoria' : 'Já guardado manualmente'}
                    {sg.targetDate && <> · até {formatDate(sg.targetDate)}</>}
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-emerald-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className={`font-bold ${done ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {formatMoney(sg.savedAmount)}
                    </span>
                    <span className="text-slate-400">de {formatMoney(sg.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-bold text-slate-900">Como funciona</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          A meta é calculada sobre o que entrou nos últimos 30 dias.
          {goal.percent > 0 && (
            <> Com <strong>{goal.percent}%</strong>, você precisa guardar{' '}
            <strong>{formatMoney(goal.target)}</strong> por mês.</>
          )}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {savingsGoals.length > 0 && (
        <div className="lg:hidden">
          <Fab onClick={() => { setEditing(null); setModalOpen(true); }} label="Nova meta" />
        </div>
      )}

      <SavingsGoalModal open={modalOpen} goal={editing} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          try { await deleteSavingsGoal(toDelete.id); } catch { /* toast já avisou */ }
          setToDelete(null);
        }}
        title="Excluir meta"
        message={`Excluir "${toDelete?.name}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
