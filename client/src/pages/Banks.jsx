import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Landmark, Plus, Loader2 } from 'lucide-react';
import useAppStore from '../stores/appStore.js';
import BankCard from '../components/BankCard.jsx';
import ConnectBankModal from '../components/ConnectBankModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { api } from '../lib/api.js';

export default function Banks() {
  const { banks, dataVersion, fetchBanks, refresh } = useAppStore();
  const [connectOpen, setConnectOpen] = useState(false);
  const [syncing, setSyncing] = useState(null);
  const [disconnectTarget, setDisconnectTarget] = useState(null);

  useEffect(() => {
    fetchBanks();
  }, [dataVersion, fetchBanks]);

  const handleSync = async (bank) => {
    setSyncing(bank.id);
    try {
      const res = await api.post(`/banks/${bank.id}/sync`);
      await refresh();
      if (res.data.created === 0) {
        toast.success('Contas atualizadas. Nenhuma movimentação nova.');
      } else {
        toast.success(`${res.data.created} movimentação(ões) importada(s) do ${bank.institutionName}.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível sincronizar. Tente novamente.');
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (bank) => {
    try {
      await api.delete(`/banks/${bank.id}`);
      await refresh();
      toast.success(`${bank.institutionName} desconectado. Suas movimentações foram mantidas.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível desconectar.');
    }
  };

  const handleReconnect = async (bank) => {
    try {
      const res = await api.post('/banks/connect', { institutionId: bank.institution });
      window.location.href = res.data.authUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível reiniciar a conexão.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Bancos conectados</h1>
          <p className="mt-1 text-sm text-slate-500">
            Importe automaticamente suas contas e movimentações bancárias.
          </p>
        </div>
        <button onClick={() => setConnectOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Conectar novo banco
        </button>
      </div>

      {banks.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <Landmark className="h-7 w-7 text-emerald-600" />
          </span>
          <h2 className="text-lg font-semibold text-slate-800">Nenhum banco conectado ainda</h2>
          <p className="max-w-sm text-sm text-slate-500">
            Conecte seu banco para importar contas e movimentações automaticamente — sem digitar
            cada gasto manualmente.
          </p>
          <button onClick={() => setConnectOpen(true)} className="btn-primary mt-2">
            <Plus className="h-4 w-4" />
            Conectar meu primeiro banco
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {banks.map((bank) => (
            <BankCard
              key={bank.id}
              bank={bank}
              syncing={syncing === bank.id}
              onSync={() => handleSync(bank)}
              onDisconnect={() => setDisconnectTarget(bank)}
              onReconnect={() => handleReconnect(bank)}
            />
          ))}
        </div>
      )}

      {syncing && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sincronizando com o banco...
        </p>
      )}

      <ConnectBankModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      <ConfirmDialog
        open={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={() => disconnectTarget && handleDisconnect(disconnectTarget)}
        title="Desconectar banco"
        message={`Deseja desconectar ${disconnectTarget?.institutionName || 'este banco'}? As movimentações já importadas serão mantidas.`}
        confirmLabel="Desconectar"
      />
    </div>
  );
}
