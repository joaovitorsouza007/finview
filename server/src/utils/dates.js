// Helpers de data usados nos cálculos do dashboard

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

// Intervalo de datas conforme o período escolhido
export function dateRange(period) {
  const today = startOfDay(new Date());
  const to = new Date(today);
  switch (period) {
    case 'week':
      return { from: addDays(today, -6), to };
    case 'month':
      return { from: addDays(today, -29), to };
    case 'year':
      return { from: addDays(today, -364), to };
    default:
      return { from: startOfMonth(addMonths(today, -11)), to };
  }
}
