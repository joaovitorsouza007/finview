import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Target, Pencil, Check } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatMoney } from '../lib/format.js';

// Card da meta de investimento: percentual, meta e o que já foi guardado
export default function GoalCard({ goal, onSave }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset } = useForm({ defaultValues: { percent: goal.percent } });

  async function save(data) {
    setError('');
    try {
      const res = await api.put('/goal', { percent: Number(data.percent) });
      reset({ percent: res.data.percent });
      setEditing(false);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível salvar.');
    }
  }

  const pct = Math.max(0, Math.min(100, goal.progress));
  const remaining = Math.max(0, goal.target - goal.invested);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Meta de investimento</h2>
            <p className="text-sm text-slate-500">Quanto do que entrou você quer guardar</p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
          >
            <Pencil className="h-4 w-4" /> Ajustar
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit(save)} className="mt-6">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="label">Percentual do que entrou (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                {...register('percent')}
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary">
              <Check className="h-4 w-4" /> Salvar
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </form>
      ) : (
        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <p className="text-4xl font-bold tracking-tight text-slate-900">{goal.percent}%</p>
            <p className="text-right text-sm text-slate-500">
              Guardado <span className="font-semibold text-slate-800">{formatMoney(goal.invested)}</span>
              <br />Meta {formatMoney(goal.target)}
            </p>
          </div>

          <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {goal.target === 0
                ? 'Adicione receitas (ex.: salário) para calcular a meta.'
                : pct >= 100
                  ? 'Meta atingida. Bom trabalho!'
                  : `Faltam ${formatMoney(remaining)} para a meta deste mês.`}
            </span>
            <span className="font-semibold text-emerald-600">{goal.progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
