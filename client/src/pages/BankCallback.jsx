import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, XCircle, ArrowRight, Landmark } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatMoney } from '../lib/format.js';

// Página de retorno após autorização no banco: recebe o `item_id` do
// serviço de conexão e finaliza o acesso, sincronizando as primeiras contas.
export default function BankCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState('loading'); // loading | done | error
  const [connection, setConnection] = useState(null);
  const [sync, setSync] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const itemId = params.get('item_id');
        const ref = params.get('ref');
        if (!itemId || !ref) throw new Error('Parâmetros de retorno inválidos.');

        // 1) Finaliza a conexão com o token do banco
        const claim = await api.post('/banks/claim', { itemId, ref });
        if (!active) return;
        setConnection(claim.data.connection);

        // 2) Sincroniza as contas e movimentações iniciais
        const res = await api.post(`/banks/${claim.data.connection.id}/sync`);
        if (!active) return;
        setSync(res.data);
        setState('done');
      } catch (err) {
        if (active) {
          setState('error');
          toast.error(err.response?.data?.error || 'Não foi possível concluir a conexão.');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white shadow-sm">
            F
          </span>
          <p className="text-lg font-bold text-slate-900">FinView</p>
        </div>

        <div className="card text-center">
          {state === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm text-slate-500">Conectando sua conta e importando seus dados...</p>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <XCircle className="h-10 w-10 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-900">Não foi possível conectar</h2>
              <p className="text-sm text-slate-500">
                Ocorreu um erro ao finalizar a autorização. Tente novamente.
              </p>
              <button onClick={() => navigate('/bancos')} className="btn-primary mt-2">
                Voltar para bancos conectados
              </button>
            </div>
          )}

          {state === 'done' && connection && (
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{connection.institutionName} conectado!</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Suas contas e movimentações foram importadas com sucesso.
                </p>
              </div>

              <div className="w-full space-y-2 rounded-xl bg-slate-50 p-4 text-left">
                {sync?.accounts.map((acc) => (
                  <div key={acc.externalId} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {acc.name} <span className="text-slate-400">· {acc.bankName}</span>
                    </span>
                    <span className="font-semibold text-slate-900">{formatMoney(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                  <span className="text-slate-600">Movimentações importadas</span>
                  <span className="font-semibold text-slate-900">{sync?.created ?? 0}</span>
                </div>
              </div>

              <div className="mt-1 flex w-full flex-col gap-2">
                <button onClick={() => navigate('/')} className="btn-primary">
                  Ir para a visão geral
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/bancos')} className="btn-secondary">
                  <Landmark className="h-4 w-4" />
                  Ver bancos conectados
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
