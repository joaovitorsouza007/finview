import { useEffect, useState } from 'react';
import { Sparkles, Trash2, Wand2 } from 'lucide-react';
import useAppStore from '../stores/appStore.js';

// Regras automáticas: "se a descrição contém [palavra] → categoria X".
// Têm prioridade sobre as regras padrão do sistema na categorização.
export default function Rules() {
  const rules = useAppStore((s) => s.rules);
  const categories = useAppStore((s) => s.categories);
  const fetchRules = useAppStore((s) => s.fetchRules);
  const fetchCategories = useAppStore((s) => s.fetchCategories);
  const addRule = useAppStore((s) => s.addRule);
  const deleteRule = useAppStore((s) => s.deleteRule);

  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchRules();
    fetchCategories();
  }, [fetchRules, fetchCategories]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!keyword.trim() || !categoryId) return;
    setBusy(true);
    try {
      await addRule({ keyword: keyword.trim(), categoryId });
      setKeyword('');
      setCategoryId('');
    } catch { /* toast já avisou */ } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Regras automáticas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ensine o FinView a categorizar sozinho: quando a descrição contiver a palavra, a categoria é aplicada.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={onSubmit} className="card h-fit lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Wand2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Nova regra</h2>
              <p className="text-sm text-slate-500">Vale para novas movimentações</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Palavra-chave *</label>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ex.: iFood"
                className="input"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Categoria *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
                <option value="">Escolher categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={busy || !keyword.trim() || !categoryId} className="btn-primary w-full">
              {busy ? 'Salvando...' : 'Criar regra'}
            </button>
          </div>
        </form>

        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Suas regras</h2>
              <p className="text-sm text-slate-500">{rules.length} regra{rules.length === 1 ? '' : 's'} configurada{rules.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          {rules.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Nenhuma regra ainda. Crie uma ao lado ou use a opção "Lembrar categoria" ao adicionar uma movimentação.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rules.map((r) => (
                <li key={r.id} className="group flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                      {r.category?.icon || '🏷️'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        descrição contém <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">"{r.keyword}"</span>
                      </p>
                      <p className="text-xs text-slate-400">→ categorizada como {r.category?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => { try { await deleteRule(r.id); } catch { /* toast já avisou */ } }}
                    title="Excluir regra"
                    className="btn-icon hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
