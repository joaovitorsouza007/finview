import { RefreshCw, Link2, Trash2, AlertTriangle } from 'lucide-react';
import { formatMoney } from '../lib/format.js';

const STATUS_META = {
  ACTIVE: { label: 'Conectado', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  CONNECTING: { label: 'Conectando...', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  EXPIRED: { label: 'Reconectar', cls: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  ERROR: { label: 'Erro na sincronização', cls: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  DISCONNECTED: { label: 'Desconectado', cls: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
};

const AVATAR_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-indigo-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
];

// Avatar com as iniciais do banco (evita depender de logos externos)
function BankAvatar({ name }) {
  const initials = (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  const color = AVATAR_COLORS[(name || '').length % AVATAR_COLORS.length];
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-sm font-bold text-white shadow-sm`}>
      {initials}
    </span>
  );
}

function formatSync(iso) {
  if (!iso) return 'Nunca sincronizado';
  return `Sincronizado em ${new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
}

export default function BankCard({ bank, syncing, onSync, onDisconnect, onReconnect }) {
  const meta = STATUS_META[bank.status] || STATUS_META.ACTIVE;
  const needsAttention = bank.status === 'EXPIRED' || bank.status === 'ERROR';

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BankAvatar name={bank.institutionName} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{bank.institutionName}</p>
          <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs text-slate-500">Saldo atual</p>
          <p className="text-xl font-bold text-slate-900">{formatMoney(bank.balance)}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-slate-500">Movimentações</p>
          <p className="text-xl font-bold text-slate-900">{bank.transactionCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-xs text-slate-400">{formatSync(bank.lastSync)}</span>
        {needsAttention && <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />}
      </div>

      {bank.lastError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{bank.lastError}</p>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
        {needsAttention ? (
          <button onClick={onReconnect} className="btn-primary w-full sm:flex-1">
            <Link2 className="h-4 w-4" />
            Reconectar
          </button>
        ) : (
          <button onClick={onSync} disabled={syncing} className="btn-secondary w-full sm:flex-1">
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        )}
        <button
          onClick={onDisconnect}
          title="Desconectar"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
