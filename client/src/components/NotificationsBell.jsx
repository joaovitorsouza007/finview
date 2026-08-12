import { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../stores/appStore.js';
import { formatDate } from '../lib/format.js';

const TYPE_LABEL = {
  category_limit: 'Limite de categoria',
  low_balance: 'Saldo baixo',
  goal_reminder: 'Meta de investimento',
  system: 'FinView',
};

// Sino de notificações: badge com o total não lido e uma lista suspensa.
// Ao abrir, roda a checagem de alertas no servidor para gerar novas regras.
export default function NotificationsBell() {
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications);
  const fetchNotifications = useAppStore((s) => s.fetchNotifications);
  const checkAlerts = useAppStore((s) => s.checkAlerts);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function onOpen() {
    const next = !open;
    setOpen(next);
    if (next && !busy) {
      setBusy(true);
      try { await checkAlerts(); } catch { /* opcional */ } finally { setBusy(false); }
    }
  }

  async function openItem(n) {
    if (!n.read) { try { await markNotificationRead(n.id); } catch { /* opcional */ } }
    if (n.type === 'category_limit') navigate('/categorias');
    else if (n.type === 'goal_reminder') navigate('/metas');
    else navigate('/');
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onOpen}
        title="Notificações"
        className="btn-icon hover:text-slate-900"
      >
        {unread > 0 ? <BellRing className="h-5 w-5 text-emerald-600" /> : <Bell className="h-5 w-5" />}
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Notificações</p>
            {unread > 0 && (
              <button
                onClick={async () => { try { await markAllNotificationsRead(); } catch { /* opcional */ } }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                {busy ? 'Verificando...' : 'Nenhuma notificação por aqui. 🎉'}
              </p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => openItem(n)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        n.read ? 'opacity-60' : ''
                      }`}
                    >
                      <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-200' : 'bg-emerald-500'}`} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                          {TYPE_LABEL[n.type] || 'FinView'}
                          <span>·</span>
                          <span>{formatDate(n.createdAt)}</span>
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-slate-800">{n.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{n.message}</span>
                      </span>
                      {!n.read && <Check className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
