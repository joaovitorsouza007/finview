import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import useAppStore from '../stores/appStore.js';
import CategoryModal from '../components/CategoryModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Categories() {
  const categories = useAppStore((s) => s.categories);
  const fetchCategories = useAppStore((s) => s.fetchCategories);
  const deleteCategory = useAppStore((s) => s.deleteCategory);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Categorias</h1>
          <p className="mt-1 text-sm text-slate-500">Organize seus gastos do seu jeito.</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Nova categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="py-24 text-center text-sm text-slate-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card flex items-center gap-4 transition hover:shadow-lg hover:shadow-slate-200/50">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: `${c.color}1a` }}
              >
                {c.icon || '🏷️'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-slate-900">{c.name}</p>
                  {c.name === 'Outros' && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      padrão
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {c._count.transactions} movimentação{c._count.transactions === 1 ? '' : 'ões'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  onClick={() => { setEditing(c); setModalOpen(true); }}
                  title={`Editar ${c.name}`}
                  className="btn-icon hover:text-slate-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {c.name !== 'Outros' && (
                  <button
                    onClick={() => setToDelete(c)}
                    title={`Excluir ${c.name}`}
                    className="btn-icon hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal compartilhado: cria ou edita conforme a prop `editing` */}
      <CategoryModal open={modalOpen} category={editing} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          try { await deleteCategory(toDelete.id); } catch { /* toast já avisou */ }
          setToDelete(null);
        }}
        title="Excluir categoria"
        message={`Excluir "${toDelete?.name}"? As movimentações desta categoria serão movidas para "Outros".`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
