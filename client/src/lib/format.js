const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Converte centavos para "R$ 1.234,56"
export function formatMoney(cents) {
  return brl.format((cents || 0) / 100);
}

// Formata uma data ISO para "DD/MM/AAAA"
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
