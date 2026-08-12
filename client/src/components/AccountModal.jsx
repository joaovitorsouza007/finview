import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAppStore from '../stores/appStore.js';
import Modal from './Modal.jsx';

const COLORS = ['#059669', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b', '#14b8a6', '#f97316'];
const TYPES = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'credit', label: 'Cartão de crédito' },
  { value: 'other', label: 'Outra' },
];

// Cria ou edita uma conta. O saldo inicial só é informado na criação;
// na edição, o saldo é recalculado automaticamente pelas movimentações.
export default function AccountModal({ open, onClose, account }) {
  const addAccount = useAppStore((s) => s.addAccount);
  const updateAccount = useAppStore((s) => s.updateAccount);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { name: '', type: 'checking', initialBalance: '', color: COLORS[0] },
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const color = watch('color');

  useEffect(() => {
    if (open) {
      reset({
        name: account?.name || '',
        type: account?.type || 'checking',
        initialBalance: account ? (account.initialBalance / 100).toFixed(2) : '',
        color: account?.color || COLORS[0],
      });
      setError('');
    }
  }, [open, account, reset]);

  async function onSubmit(data) {
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance ? Number(data.initialBalance) : 0,
        color: data.color,
      };
      if (account) {
        await updateAccount(account.id, payload);
      } else {
        await addAccount(payload);
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
      title={account ? 'Editar conta' : 'Nova conta'}
      subtitle="Acompanhe o saldo em cada lugar"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Nome da conta *</label>
          <input
            {...register('name', { required: true })}
            placeholder="Ex.: Conta do Nubank"
            className="input"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tipo</label>
            <select {...register('type')} className="input">
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{account ? 'Saldo inicial (R$)' : 'Saldo inicial (R$) *'}</label>
            <input
              {...register('initialBalance')}
              type="number"
              step="0.01"
              placeholder="0,00"
              className="input"
            />
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
                className="h-8 w-8 rounded-full ring-offset-2 transition"
                style={{ backgroundColor: c, ...(color === c ? { boxShadow: '0 0 0 2px white, 0 0 0 4px ' + c } : {}) }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Salvando...' : account ? 'Salvar alterações' : 'Criar conta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
