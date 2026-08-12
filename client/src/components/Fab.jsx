import { Plus } from 'lucide-react';

// Botão flutuante de ação (canto inferior direito)
export default function Fab({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-emerald-600/40"
    >
      <Plus className="h-5 w-5" />
      {label}
    </button>
  );
}
