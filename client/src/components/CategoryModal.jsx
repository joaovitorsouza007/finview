import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAppStore from '../stores/appStore.js';
import Modal from './Modal.jsx';

const EMOJIS = ['🍽️', '🚗', '🏠', '💊', '🎬', '🛍️', '💡', '📚', '📈', '💵', '📦', '✈️', '☕', '🎁', '🐾', '🧾', '🎮', '🏋️', '🌴', '👶'];

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#6366f1', '#a855f7', '#10b981', '#22c55e', '#0ea5e9', '#6b7280'];

// Modal usado para criar ou editar uma categoria (nome + emoji + cor).
// Com a prop `category` presente, entra no modo de edição.
export default function CategoryModal({ open, onClose, category }) {
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { name: '', icon: EMOJIS[0], color: COLORS[0] },
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const icon = watch('icon');
  const color = watch('color');

  // Preenche o formulário ao abrir
  useEffect(() => {
    if (open) {
      reset(
        category
          ? { name: category.name, icon: category.icon || EMOJIS[0], color: category.color || COLORS[0] }
          : { name: '', icon: EMOJIS[0], color: COLORS[0] }
      );
      setError('');
    }
  }, [open, category, reset]);

  async function onSubmit(data) {
    setBusy(true);
    setError('');
    try {
      const payload = { name: data.name, icon: data.icon, color: data.color };
      if (category) {
        await updateCategory(category.id, payload);
      } else {
        await addCategory(payload);
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
      title={category ? 'Editar categoria' : 'Nova categoria'}
      subtitle="Organize seus gastos do seu jeito"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Nome *</label>
          <input
            {...register('name', { required: true })}
            placeholder="Ex.: Pets, Presentes, Viagem..."
            className="input"
            autoFocus
            disabled={category?.name === 'Outros'}
          />
        </div>

        <div>
          <label className="label">Ícone</label>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setValue('icon', e)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
                  icon === e
                    ? 'bg-emerald-50 ring-2 ring-emerald-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Cor</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`h-8 w-8 rounded-full transition ${
                  color === c ? 'ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Salvando...' : category ? 'Salvar alterações' : 'Criar categoria'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
