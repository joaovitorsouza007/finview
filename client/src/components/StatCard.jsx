const iconTones = {
  default: 'bg-slate-100 text-slate-500',
  green: 'bg-emerald-100 text-emerald-600',
  red: 'bg-red-100 text-red-500',
  blue: 'bg-sky-100 text-sky-600',
};

const textTones = {
  default: 'text-slate-900',
  green: 'text-emerald-600',
  red: 'text-red-500',
  blue: 'text-sky-600',
};

export default function StatCard({ label, value, icon: Icon, hint, tone = 'default', delta, invert }) {
  const good = delta !== undefined && delta !== null && (invert ? delta >= 0 : delta <= 0);
  const hasDelta = delta !== undefined && delta !== null;
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 truncate text-2xl font-bold tracking-tight ${textTones[tone]}`}>{value}</p>
          {(hint || hasDelta) && (
            <p className="mt-1 flex items-center gap-1.5 text-xs">
              {hasDelta ? (
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-semibold ${
                  good ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}>
                  {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
                </span>
              ) : null}
              {hint && <span className="text-slate-400">{hint}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTones[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
