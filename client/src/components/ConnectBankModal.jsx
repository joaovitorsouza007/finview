import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, ShieldCheck, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { api } from '../lib/api.js';

// Modal que lista os bancos disponíveis e inicia a conexão.
// Em modo demonstração a conexão cai numa página simulada do banco.
export default function ConnectBankModal({ open, onClose }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    api
      .get('/banks/available')
      .then((res) => {
        if (active) {
          setInstitutions(res.data.institutions);
          setSearch('');
        }
      })
      .catch(() => {
        if (active) toast.error('Não foi possível carregar os bancos disponíveis.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const filtered = institutions.filter((b) =>
    b.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleConnect = async (bank) => {
    setConnecting(bank.id);
    try {
      const res = await api.post('/banks/connect', { institutionId: bank.id });
      // Redireciona para o banco (ou a página simulada, em modo demo)
      window.location.href = res.data.authUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível iniciar a conexão.');
      setConnecting(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conectar um banco"
      subtitle="Selecione sua instituição. Depois, é só autorizar o acesso — sem digitar senha aqui."
      maxWidth="max-w-xl"
    >
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar instituição..."
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando bancos...
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          Nenhuma instituição encontrada para "{search}".
        </p>
      ) : (
        <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto pr-1 lg:grid-cols-3">
          {filtered.map((bank) => (
            <button
              key={bank.id}
              onClick={() => handleConnect(bank)}
              disabled={connecting !== null}
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-60"
            >
              {bank.logo ? (
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="h-9 w-9 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500">
                  {bank.name[0]}
                </span>
              )}
              <span className="text-sm font-medium text-slate-700">{bank.name}</span>
              {connecting === bank.id && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        Sua conexão é protegida e criptografada. Você pode desconectar a conta a qualquer momento.
      </div>
    </Modal>
  );
}
