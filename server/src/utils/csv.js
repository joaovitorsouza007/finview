import { parse } from 'csv-parse';

// Remove acentos e normaliza o nome da coluna do CSV
function normalizeKey(k) {
  return String(k).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Lê um buffer CSV e devolve uma lista de objetos
export function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    parse(buffer, { columns: true, trim: true, skip_empty_lines: true })
      .on('data', (row) => {
        const norm = {};
        for (const [k, v] of Object.entries(row)) {
          norm[normalizeKey(k)] = v;
        }
        rows.push(norm);
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}
