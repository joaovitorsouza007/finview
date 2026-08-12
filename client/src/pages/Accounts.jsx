import { useEffect, useState } from 'react';
import { Wallet, Plus, Pencil, Trash2, Link2, CreditCard, PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../stores/appStore.js';
import AccountModal from '../components/AccountModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Fab from '../components/Fab.jsx';
import { formatMoney } from '../lib/format.js';

const TYPE_LABEL = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  credit: 'Cartão de crédito',
  other: 'Outra',
};

const TYPE_ICON = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  other: Wallet,
};

// Múltiplas contas: cada uma tem saldo inicial e recebe o saldo de suas
// movimentações. O total consolida tudo no dashboard.
export default function Accounts() {
  const navigate = useNavigate();
  const accounts = useAppStore((s) => s.accounts);
  const fetchAccounts = useAppStore((s) => s.fetchAccounts);
  const deleteAccount = useAppStore((s) => s.deleteAccount);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Contas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {accounts.length === 0
              ? 'Crie contas para acompanhar onde o dinheiro está.'
              : `Saldo consolidado: ${formatMoney(total)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary hidden lg:inline-flex">
            <Plus className="h-4 w-4" /> Nova conta
          </button>
          <button onClick={() => navigate('/bancos')} className="btn-secondary">
            <Link2 className="h-4 w-4" /> Conectar conta bancária
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Wallet className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Nenhuma conta ainda</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Crie uma conta manual ou conecte seu banco para importar os saldos automaticamente.
          </p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
              <Plus className="h-4 w-4" /> Criar conta
            </button>
            <button onClick={() => navigate('/bancos')} className="btn-secondary">Conectar banco</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const Icon = TYPE_ICON[a.type] || Wallet;
            return (
              <div key={a.id} className="card group">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: a.color || '#059669' }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => { setEditing(a); setModalOpen(true); }}
                      title="Editar"
                      className="btn-icon hover:text-slate-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(a)}
                      title="Excluir"
                      className="btn-icon hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">{a.name}</p>
                <p className="text-xs text-slate-400">{TYPE_LABEL[a.type] || a.type}</p>
                <p className={`mt-2 text-xl font-bold ${a.balance >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
                  {formatMoney(a.balance)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="lg:hidden">
        <Fab onClick={() => { setEditing(null); setModalOpen(true); }} label="Nova conta" />
      </div>

      <AccountModal open={modalOpen} account={editing} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          try { await deleteAccount(toDelete.id); } catch { /* toast já avisou */ }
          setToDelete(null);
        }}
        title="Excluir conta"
        message={`Excluir "${toDelete?.name}"? As movimentações da conta são mantidas.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
