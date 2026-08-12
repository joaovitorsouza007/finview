import crypto from 'crypto';

// Cliente do Pluggy (Open Finance).
// ---------------------------------------------------------------
// Modo real: usa a API do Pluggy com as credenciais do .env
//   PLUGGY_CLIENT_ID / PLUGGY_CLIENT_SECRET
// Modo demonstração (sem credenciais): gera bancos, contas e transações
// fictícias para o fluxo funcionar de ponta a ponta localmente.
// O usuário final nunca vê nada disso — só a interface amigável.

const API = 'https://api.pluggy.ai';
const CONNECT = 'https://connect.pluggy.ai';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const isDemo = () =>
  !process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET;

// Minúsculas e sem acentos (para a busca casar "itau" com "Itaú")
function normalizeText(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Bancos fictícios usados no modo demonstração
const DEMO_INSTITUTIONS = [
  { id: 'nubank', name: 'Nubank', logo: 'https://logos-world.net/wp-content/uploads/2021/02/Nubank-Logo.png' },
  { id: 'itau', name: 'Itaú', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Itaú-Logo.png' },
  { id: 'bradesco', name: 'Bradesco', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Bradesco-Logo.png' },
  { id: 'santander', name: 'Santander', logo: 'https://logos-world.net/wp-content/uploads/2021/10/Santander-Logo.png' },
  { id: 'caixa', name: 'Caixa', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Caixa-Econômica-Logo.png' },
  { id: 'inter', name: 'Inter', logo: 'https://logos-world.net/wp-content/uploads/2021/02/Inter-Logo.png' },
  { id: 'bb', name: 'Banco do Brasil', logo: 'https://logos-world.net/wp-content/uploads/2020/11/Banco-do-Brasil-Logo.png' },
  { id: 'sicoob', name: 'Sicoob', logo: 'https://logos-world.net/wp-content/uploads/2022/02/Sicoob-Logo.png' },
];

let cachedKey = null;
let cachedExpires = 0;

// Obtém a apiKey do Pluggy (válida por algumas horas) e guarda em memória
async function getApiKey() {
  if (cachedKey && Date.now() < cachedExpires) return cachedKey;
  const res = await fetch(`${API}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error('pluggy_auth_failed');
  const data = await res.json();
  cachedKey = data.accessToken;
  cachedExpires = Date.now() + (data.expiresAt ? (new Date(data.expiresAt) - Date.now()) * 0.8 : 1000 * 60 * 60);
  return cachedKey;
}

async function request(path, opts = {}) {
  const apiKey = await getApiKey();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = new Error('pluggy_request_failed');
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Hash simples para "semear" os dados fictícios de forma estável por item
function seed(itemId) {
  const h = crypto.createHash('sha256').update(itemId).digest();
  let a = h.readUInt32LE(0);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------
// Dados fictícios do modo demonstração
// ---------------------------------------------------------------

function demoAccounts(itemId) {
  const rand = seed(itemId);
  return [
    {
      name: 'Conta Corrente',
      type: 'checking',
      balance: Math.round((1500 + rand() * 6500) * 100) / 100,
      currencyCode: 'BRL',
    },
    {
      name: 'Cartão de Crédito',
      type: 'credit',
      balance: Math.round((200 + rand() * 1800) * 100) / 100,
      currencyCode: 'BRL',
    },
  ];
}

const DEMO_TX = [
  { description: 'iFood *Pedido', amount: 59.9, category: 'restaurant', type: 'debit' },
  { description: 'Mercado do bairro', amount: 187.45, category: 'groceries', type: 'debit' },
  { description: 'Uber *Viagem', amount: 24.8, category: 'transport', type: 'debit' },
  { description: 'Netflix.com', amount: 55.9, category: 'subscriptions', type: 'debit' },
  { description: 'Energia ELETROPAULO', amount: 142.3, category: 'utilities', type: 'debit' },
  { description: 'Farmacia Drogasil', amount: 38.2, category: 'health', type: 'debit' },
  { description: 'Amazon.com.br', amount: 89.99, category: 'shopping', type: 'debit' },
  { description: 'Spotify', amount: 21.9, category: 'subscriptions', type: 'debit' },
  { description: 'Posto Shell', amount: 180.0, category: 'transport', type: 'debit' },
  { description: 'Restaurante Sabor Caseiro', amount: 64.5, category: 'restaurant', type: 'debit' },
  { description: 'Cinema Cinemark', amount: 48.0, category: 'entertainment', type: 'debit' },
  { description: 'Academia SmartFit', amount: 89.9, category: 'health', type: 'debit' },
  { description: 'PIX Recebido - Cliente', amount: 450.0, category: 'salary', type: 'credit' },
  { description: 'Salário Mensal', amount: 5200.0, category: 'salary', type: 'credit' },
  { description: 'Internet Vivo', amount: 109.9, category: 'utilities', type: 'debit' },
  { description: 'Aluguel', amount: 1800.0, category: 'housing', type: 'debit' },
  { description: 'Farmácia Pague Menos', amount: 52.1, category: 'health', type: 'debit' },
  { description: 'Shopee Compra', amount: 129.9, category: 'shopping', type: 'debit' },
  { description: 'Uber Eats *Lanche', amount: 42.5, category: 'restaurant', type: 'debit' },
  { description: 'Curso Online Alura', amount: 75.0, category: 'education', type: 'debit' },
  { description: 'PIX Enviado - Loja A', amount: 220.0, category: 'other', type: 'debit' },
  { description: 'Cinema IMAX', amount: 72.0, category: 'entertainment', type: 'debit' },
  { description: 'Supermercado Extra', amount: 215.3, category: 'groceries', type: 'debit' },
  { description: 'Estacionamento', amount: 15.0, category: 'transport', type: 'debit' },
  { description: 'Farmacia RaiaDrogasil', amount: 33.7, category: 'health', type: 'debit' },
  { description: 'PIX Recebido - Reembolso', amount: 120.0, category: 'other', type: 'credit' },
];

// Categoria do Pluggy -> nome de categoria do FinView (mapeamento)
export const CATEGORY_MAP = {
  food: 'Alimentação',
  groceries: 'Alimentação',
  restaurant: 'Alimentação',
  transport: 'Transporte',
  gas: 'Transporte',
  housing: 'Moradia',
  utilities: 'Serviços',
  leisure: 'Lazer',
  entertainment: 'Lazer',
  travel: 'Lazer',
  health: 'Saúde',
  education: 'Educação',
  shopping: 'Compras',
  clothing: 'Compras',
  subscriptions: 'Serviços',
  investments: 'Investimentos',
  salary: 'Salário',
  income: 'Salário',
  other: 'Outros',
};

function demoTransactions(itemId, from, to) {
  const rand = seed(itemId + '-tx');
  const result = [];
  const total = 24 + Math.floor(rand() * 6);
  for (let i = 0; i < total; i++) {
    const tpl = DEMO_TX[Math.floor(rand() * DEMO_TX.length)];
    const dayMs = from.getTime() + rand() * (to.getTime() - from.getTime());
    const date = new Date(dayMs);
    result.push({
      id: `demo-${itemId}-${i}`,
      description: tpl.description,
      amount: tpl.type === 'debit' ? -tpl.amount : tpl.amount,
      date: date.toISOString(),
      type: tpl.type,
      categoryId: `demo-cat-${tpl.category}`,
    });
  }
  return result;
}

// ---------------------------------------------------------------
// Interface pública (idêntica para os dois modos)
// ---------------------------------------------------------------

// Lista de bancos disponíveis para conexão
export async function listInstitutions({ search = '' } = {}) {
  if (isDemo()) {
    const q = normalizeText(search);
    const list = q
      ? DEMO_INSTITUTIONS.filter((b) => normalizeText(b.name).includes(q))
      : DEMO_INSTITUTIONS;
    return list.map((b) => ({ id: b.id, name: b.name, logo: b.logo || null }));
  }
  const data = await request(`/institutions?search=${encodeURIComponent(search)}`);
  return (data.results || []).map((b) => ({ id: b.id, name: b.name, logo: b.logoUrl || null }));
}

// Inicia o fluxo seguro: devolve a URL para onde o usuário será redirecionado
export async function createConnectUrl({ institutionId, callbackUrl }) {
  if (isDemo()) {
    const params = new URLSearchParams({ institutionId, callbackUrl });
    return `${FRONTEND_URL}/bancos/demo-auth?${params.toString()}`;
  }
  const data = await request('/connect_token', {
    method: 'POST',
    body: JSON.stringify({ institutionId, callbackUrl }),
  });
  return `${CONNECT}/${data.accessToken}`;
}

// Consulta o status do item autorizado
export async function getItemStatus(itemId) {
  if (isDemo()) return 'UPDATED'; // no modo demo a conexão sempre está ok
  const data = await request(`/items/${itemId}`);
  return data.status; // UPDATED | LOGIN_IN_PROGRESS | LOGIN_ERROR | LOGIN_REQUIRED | ...
}

// Contas encontradas no banco (para exibir saldo e no resumo da conexão)
export async function getItemAccounts(itemId) {
  if (isDemo()) return demoAccounts(itemId);
  const data = await request(`/items/${itemId}/accounts`);
  return (data.results || []).map((a) => ({
    name: a.name || a.number,
    type: a.type, // CHECKING | CREDIT_CARD | ...
    balance: a.balance?.current ?? 0,
    currencyCode: a.currencyCode,
  }));
}

// Transações do item no intervalo [from, to]
export async function getItemTransactions(itemId, from, to) {
  if (isDemo()) return demoTransactions(itemId, from, to);
  const result = [];
  let page = 1;
  const query = `itemId=${itemId}&from=${from.toISOString()}&to=${to.toISOString()}&pageSize=200`;
  for (;;) {
    const data = await request(`/transactions?${query}&page=${page}`);
    for (const tx of data.results || []) {
      result.push({
        id: tx.id,
        description: tx.description || tx.title || 'Sem descrição',
        amount: typeof tx.amount === 'number' ? tx.amount : Number(tx.amount),
        date: tx.date || tx.operationDate,
        type: tx.type, // DEBIT | CREDIT
        categoryId: tx.categoryId,
      });
    }
    if (!data.page || data.page >= data.totalPages) break;
    page++;
  }
  return result;
}

// Nome da categoria da transação no Pluggy
export async function getCategoryName(categoryId) {
  if (isDemo() || !categoryId) {
    const key = String(categoryId || '').replace('demo-cat-', '');
    return CATEGORY_MAP[key] || null;
  }
  try {
    const data = await request(`/categories/${categoryId}`);
    return data.name || null;
  } catch {
    return null;
  }
}
