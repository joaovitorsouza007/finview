import { useEffect, useState } from 'react';
import { Users, Check, X, Trash2, Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import toast from 'react-hot-toast';
import useAppStore from '../stores/appStore.js';
import { formatDate } from '../lib/format.js';

// Configurações: acesso e compartilhamento.
export default function Settings() {
  const sharing = useAppStore((s) => s.sharing);
  const fetchSharing = useAppStore((s) => s.fetchSharing);

  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchSharing();
  }, [fetchSharing]);

  async function invite(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      await api.post('/sharing/invite', { email: email.trim() });
      toast.success(`Convite enviado para ${email.trim()}.`);
      setEmail('');
      await fetchSharing();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível enviar o convite.');
    } finally {
      setInviting(false);
    }
  }

  async function accept(id) {
    try {
      await api.post(`/sharing/${id}/accept`);
      toast.success('Você agora tem acesso às finanças compartilhadas.');
      await fetchSharing();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível aceitar o convite.');
    }
  }

  async function revoke(id) {
    try {
      await api.delete(`/sharing/${id}`);
      await fetchSharing();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível remover.');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Configurações</h1>
        <p className="mt-1 text-sm text-slate-500">Acesso e compartilhamento.</p>
      </div>

      {/* Compartilhamento */}
        <div className="card">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Compartilhar finanças</h2>
              <p className="text-sm text-slate-500">A outra pessoa vê e edita os mesmos dados</p>
            </div>
          </div>

          <form onSubmit={invite} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e-mail da pessoa"
              className="input flex-1"
            />
            <button type="submit" disabled={inviting || !email.trim()} className="btn-primary w-full sm:w-auto sm:shrink-0">
              <Plus className="h-4 w-4" /> Convidar
            </button>
          </form>

          <div className="mt-5 space-y-5">
            {sharing.active.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Compartilhado com</p>
                <ul className="divide-y divide-slate-100">
                  {sharing.active.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                          {(a.guest?.name || a.guest?.email || '?')[0]?.toUpperCase()}
                        </span>
                        <span className="min-w-0 truncate text-sm text-slate-700">
                          {a.guest?.name || a.guest?.email}
                        </span>
                      </div>
                      <button
                        onClick={() => revoke(a.id)}
                        title="Remover acesso"
                        className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sharing.sent.filter((s) => !s.acceptedAt).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Convites enviados</p>
                <ul className="divide-y divide-slate-100">
                  {sharing.sent.filter((s) => !s.acceptedAt).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                        <span className="truncate">{s.email}</span>
                        <span className="shrink-0 text-xs text-slate-400">· {formatDate(s.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => revoke(s.id)}
                        title="Cancelar convite"
                        className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sharing.received.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Convites recebidos</p>
                <ul className="divide-y divide-slate-100">
                  {sharing.received.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0 text-sm text-slate-700">
                        <p className="truncate">{s.owner?.email || s.email}</p>
                        <p className="text-xs text-slate-400">quer compartilhar as finanças com você</p>
                      </div>
                      <button onClick={() => accept(s.id)} className="btn-primary shrink-0 px-3 py-1.5 text-xs">
                        <Check className="h-3.5 w-3.5" /> Aceitar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sharing.active.length === 0 && sharing.sent.filter((s) => !s.acceptedAt).length === 0 && sharing.received.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                Nenhum compartilhamento ainda. Convide alguém para acompanhar as finanças juntos.
              </p>
            )}
          </div>
        </div>
    </div>
  );
}
