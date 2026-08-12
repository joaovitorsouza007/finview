import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAppStore from '../stores/appStore.js';
import Modal from './Modal.jsx';

// Cria ou edita uma meta personalizada. Se ligada a uma categoria, o
// "já guardado" é a soma automática dos gastos daquela categoria.
export default function SavingsGoalModal({ open, onClose, goal }) {
  const categories = useAppStore((s) => s.categories);
  const addSavingsGoal = useAppStore((s) => s.addSavingsGoal);
  const updateSavingsGoal = useAppStore((s) => s.updateSavingsGoal);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { name: '', targetAmount: '', savedAmount: '', targetDate: '', categoryId: '' },
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const categoryId = watch('categoryId');

  useEffect(() => {
    if (open) {
      reset({
        name: goal?.name || '',
        targetAmount: goal ? (goal.targetAmount / 100).toFixed(2) : '',
        savedAmount: goal && !goal.categoryId ? (goal.savedAmount / 100).toFixed(2) : '',
        targetDate: goal?.targetDate ? goal.targetDate.slice(0, 10) : '',
        categoryId: goal?.categoryId || '',
      });
      setError('');
    }
  }, [open, goal, reset]);

  async function onSubmit(data) {
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: data.name,
        targetAmount: Number(data.targetAmount),
        savedAmount: data.categoryId ? undefined : Number(data.savedAmount || 0),
        targetDate: data.targetDate || null,
        categoryId: data.categoryId || null,
      };
      if (goal) {
        await updateSavingsGoal(goal.id, payload);
      } else {
        await addSavingsGoal(payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal ? 'Editar meta' : 'Nova meta'}
      subtitle="Guarde para o que importa"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Nome da meta *</label>
          <input
            {...register('name', { required: true })}
            placeholder="Ex.: Viagem para o Chile"
            className="input"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Valor total (R$) *</label>
            <input
              {...register('targetAmount', { required: true })}
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="input"
            />
          </div>
          <div>
            <label className="label">Data alvo</label>
            <input {...register('targetDate')} type="date" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Vincular a uma categoria de gasto (opcional)</label>
          <select {...register('categoryId')} className="input">
            <option value="">Sem vínculo — eu informo o quanto guardei</option>
            {categories.filter((c) => !c.isIncome).map((c) => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
            ))}
          </select>
          {categoryId && (
            <p className="mt-1 text-xs text-slate-400">
              O progresso será calculado pela soma dos gastos dessa categoria.
            </p>
          )}
        </div>

        {!categoryId && (
          <div>
            <label className="label">Já guardado (R$)</label>
            <input
              {...register('savedAmount')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="input"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Salvando...' : goal ? 'Salvar alterações' : 'Criar meta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
