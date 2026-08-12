import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Wand2 } from 'lucide-react';
import useAppStore from '../stores/appStore.js';
import Modal from './Modal.jsx';
import { api } from '../lib/api.js';

// Modal usado tanto para criar quanto para editar uma movimentação.
// Quando a prop `transaction` existe, o formulário é preenchido e o envio
// chama o PUT; caso contrário cria uma nova.
//
// V4: ao digitar a descrição, o FinView sugere a categoria (regras do
// usuário + regras padrão) e oferece criar uma regra automática.
export default function TransactionModal({ open, onClose, transaction }) {
  const categories = useAppStore((s) => s.categories);
  const accounts = useAppStore((s) => s.accounts);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const addRule = useAppStore((s) => s.addRule);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      description: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      type: 'EXPENSE',
      categoryId: '',
      accountId: '',
    },
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [createRule, setCreateRule] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const type = watch('type');
  const description = watch('description');
  const categoryId = watch('categoryId');

  // Preenche o formulário ao abrir (novo = vazio, edição = dados atuais)
  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          description: transaction.description,
          amount: (transaction.amount / 100).toFixed(2),
          date: transaction.date.slice(0, 10),
          type: transaction.type,
          categoryId: transaction.categoryId || '',
          accountId: transaction.accountId || '',
        });
      } else {
        reset({
          description: '',
          amount: '',
          date: new Date().toISOString().slice(0, 10),
          type: 'EXPENSE',
          categoryId: '',
          accountId: accounts.length === 1 ? accounts[0].id : '',
        });
      }
      setError('');
      setCreateRule(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction, reset]);

  // Sugere a categoria pela descrição quando o usuário sai do campo
  async function suggestCategory() {
    const desc = description?.trim();
    if (!desc || categoryId) return;
    setSuggesting(true);
    try {
      const res = await api.get('/rules/suggest', { params: { description: desc } });
      if (res.data.categoryId && !transaction) {
        setValue('categoryId', res.data.categoryId, { shouldValidate: true });
      }
    } catch { /* sem sugestão */ } finally {
      setSuggesting(false);
    }
  }

  async function onSubmit(data) {
    setBusy(true);
    setError('');
    try {
      const payload = {
        description: data.description,
        amount: Number(data.amount),
        type: data.type,
        date: data.date,
        categoryId: data.categoryId || null,
        accountId: data.accountId || null,
      };
      if (transaction) {
        await updateTransaction(transaction.id, payload);
      } else {
        await addTransaction(payload);
        // A pedido do usuário, vira uma regra para próximas movimentações
        if (createRule && data.categoryId && data.description.trim()) {
          try {
            await addRule({ keyword: data.description.trim(), categoryId: data.categoryId });
          } catch { /* regra é opcional */ }
        }
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
      title={transaction ? 'Editar movimentação' : 'Nova movimentação'}
      subtitle="Registre o que entrou ou o que saiu"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Descrição *</label>
          <input
            {...register('description', { required: true })}
            placeholder="Ex.: Supermercado"
            className="input"
            autoFocus
            onBlur={suggestCategory}
          />
          {suggesting && <p className="mt-1 text-xs text-slate-400">Analisando a descrição...</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Valor (R$) *</label>
            <input
              {...register('amount', { required: true })}
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="input"
            />
          </div>
          <div>
            <label className="label">Data</label>
            <input {...register('date')} type="date" className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tipo</label>
            <select {...register('type')} className="input">
              <option value="EXPENSE">Despesa (saiu)</option>
              <option value="INCOME">Receita (entrou)</option>
            </select>
          </div>
          <div>
            <label className="label">Conta</label>
            <select {...register('accountId')} className="input">
              <option value="">Sem conta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Categoria</label>
          <select {...register('categoryId')} className="input">
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}{c.name}
              </option>
            ))}
          </select>
          {type === 'INCOME' && categories.filter((c) => c.isIncome).length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Sugestões de receita:{' '}
              {categories.filter((c) => c.isIncome).map((c) => c.name).join(', ')}.
            </p>
          )}
        </div>

        {!transaction && description.trim() && categoryId && (
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <input
              type="checkbox"
              checked={createRule}
              onChange={(e) => setCreateRule(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm text-slate-700">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <Wand2 className="h-3.5 w-3.5" /> Lembrar categoria
              </span>
              <span className="block text-xs text-slate-500">
                Toda descrição com "{description.trim()}" passará a ser categorizada automaticamente.
              </span>
            </span>
          </label>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Salvando...' : transaction ? 'Salvar alterações' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
