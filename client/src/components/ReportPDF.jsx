import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatMoney } from '../lib/format.js';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: '#0f172a', fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brand: { fontSize: 20, fontWeight: 'bold', color: '#059669' },
  subtitle: { fontSize: 9, color: '#64748b', marginTop: 2 },
  h1: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  h2: { fontSize: 11, fontWeight: 'bold', color: '#059669', marginTop: 18, marginBottom: 8 },
  grid: { flexDirection: 'row', gap: 8, marginTop: 6 },
  card: { flex: 1, border: '1pt solid #e2e8f0', borderRadius: 6, padding: 10 },
  label: { fontSize: 8, color: '#64748b' },
  value: { fontSize: 14, fontWeight: 'bold', marginTop: 3 },
  table: { width: '100%', marginTop: 4 },
  row: { flexDirection: 'row', borderBottom: '0.5pt solid #e2e8f0', paddingVertical: 5 },
  th: { fontSize: 8, color: '#64748b', flex: 1 },
  td: { fontSize: 9, flex: 1 },
  right: { textAlign: 'right' },
  footer: { marginTop: 28, fontSize: 8, color: '#94a3b8', textAlign: 'center' },
});

function Row({ cells, bold }) {
  return (
    <View style={[styles.row, bold && { backgroundColor: '#f1f5f9' }]}>
      {cells.map((c, i) => (
        <Text key={i} style={[styles.td, c.align === 'right' && styles.right, bold && { fontWeight: 'bold' }]}>
          {c.text}
        </Text>
      ))}
    </View>
  );
}

function deltaText(pct) {
  if (pct === null || pct === undefined) return '—';
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

// Relatório mensal em PDF, gerado no navegador (PDF dinâmico, sem envio de dados).
export default function ReportPDF({ data, user, periodLabel }) {
  const { summary, compare, byCategory, compareByCategory, monthly, accounts, accountsTotal, goal } = data;
  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>FinView</Text>
            <Text style={styles.subtitle}>Relatório gerado em {today}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.subtitle}>{user?.name || user?.email}</Text>
            <Text style={styles.subtitle}>{periodLabel}</Text>
          </View>
        </View>

        <Text style={styles.h1}>Resumo do período</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>O que entrou</Text>
            <Text style={styles.value}>{formatMoney(summary.income)}</Text>
            <Text style={styles.subtitle}>vs. período anterior: {deltaText(compare.incomeDeltaPct)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>O que saiu</Text>
            <Text style={styles.value}>{formatMoney(summary.expense)}</Text>
            <Text style={styles.subtitle}>vs. período anterior: {deltaText(compare.expenseDeltaPct)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Sobrou</Text>
            <Text style={styles.value}>{formatMoney(summary.balance)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Meta de investimento</Text>
            <Text style={styles.value}>{formatMoney(goal.invested)}</Text>
            <Text style={styles.subtitle}>de {formatMoney(goal.target)}</Text>
          </View>
        </View>

        <Text style={styles.h2}>Gastos por categoria</Text>
        <View style={styles.table}>
          <Row bold cells={[{ text: 'Categoria' }, { text: 'Atual', align: 'right' }, { text: 'Anterior', align: 'right' }, { text: 'Variação', align: 'right' }]} />
          {compareByCategory.length === 0 && <Row cells={[{ text: 'Nenhum gasto no período.', align: 'right' }]} />}
          {compareByCategory.map((c) => (
            <Row
              key={c.name}
              cells={[
                { text: c.name },
                { text: formatMoney(c.current), align: 'right' },
                { text: formatMoney(c.previous), align: 'right' },
                { text: deltaText(c.deltaPct), align: 'right' },
              ]}
            />
          ))}
        </View>

        <Text style={styles.h2}>Últimos 6 meses</Text>
        <View style={styles.table}>
          <Row bold cells={[{ text: 'Mês' }, { text: 'Entrou', align: 'right' }, { text: 'Saiu', align: 'right' }]} />
          {monthly.map((m) => (
            <Row key={m.label} cells={[{ text: m.label }, { text: formatMoney(m.income), align: 'right' }, { text: formatMoney(m.expense), align: 'right' }]} />
          ))}
        </View>

        {accounts.length > 0 && (
          <>
            <Text style={styles.h2}>Saldo por conta</Text>
            <View style={styles.table}>
              <Row bold cells={[{ text: 'Conta' }, { text: 'Saldo', align: 'right' }]} />
              {accounts.map((a) => (
                <Row key={a.id} cells={[{ text: a.name }, { text: formatMoney(a.balance), align: 'right' }]} />
              ))}
              <Row bold cells={[{ text: 'Total', align: 'right' }, { text: formatMoney(accountsTotal), align: 'right' }]} />
            </View>
          </>
        )}

        {byCategory.length > 0 && (
          <Text style={styles.footer}>Parte do que foi investido pode ter sido considerado "Sobrou" — confira suas categorias.</Text>
        )}
      </Page>
    </Document>
  );
}
