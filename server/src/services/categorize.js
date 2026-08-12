import { prisma } from '../lib/prisma.js';

// Categorias criadas automaticamente para todo usuário novo
export const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', color: '#f59e0b', icon: '🍽️', isIncome: false, isInvestment: false },
  { name: 'Transporte', color: '#3b82f6', icon: '🚗', isIncome: false, isInvestment: false },
  { name: 'Moradia', color: '#8b5cf6', icon: '🏠', isIncome: false, isInvestment: false },
  { name: 'Saúde', color: '#ef4444', icon: '💊', isIncome: false, isInvestment: false },
  { name: 'Lazer', color: '#ec4899', icon: '🎬', isIncome: false, isInvestment: false },
  { name: 'Compras', color: '#14b8a6', icon: '🛍️', isIncome: false, isInvestment: false },
  { name: 'Serviços', color: '#6366f1', icon: '💡', isIncome: false, isInvestment: false },
  { name: 'Educação', color: '#a855f7', icon: '📚', isIncome: false, isInvestment: false },
  { name: 'Investimentos', color: '#10b981', icon: '📈', isIncome: false, isInvestment: true },
  { name: 'Salário', color: '#22c55e', icon: '💵', isIncome: true, isInvestment: false },
  { name: 'Outros', color: '#6b7280', icon: '📦', isIncome: false, isInvestment: false },
];

// Regras simples de categorização automática por palavras-chave
const KEYWORD_RULES = [
  {
    keywords: ['mercado', 'supermercado', 'padaria', 'acougue', 'hortifruti', 'ifood', 'restaurante', 'bar', 'lanche', 'feira'],
    category: 'Alimentação',
  },
  {
    keywords: ['uber', 'taxi', 'gasolina', 'posto', 'onibus', 'metro', 'transporte', 'combustivel', 'estacionamento', 'pedagio', '99'],
    category: 'Transporte',
  },
  { keywords: ['aluguel', 'condominio', 'imovel', 'iptu', 'casa', 'apartamento'], category: 'Moradia' },
  { keywords: ['farmacia', 'medico', 'hospital', 'dentista', 'clinica', 'plano de saude', 'psicologo'], category: 'Saúde' },
  { keywords: ['netflix', 'spotify', 'cinema', 'jogo', 'festa', 'show', 'prime video', 'disney'], category: 'Lazer' },
  { keywords: ['amazon', 'shopee', 'magalu', 'mercado livre', 'loja', 'roupa', 'eletronicos', 'tecnico'], category: 'Compras' },
  { keywords: ['luz', 'energia', 'agua', 'internet', 'telefone', 'celular', 'assinatura', 'streaming', 'app'], category: 'Serviços' },
  { keywords: ['academia', 'escola', 'faculdade', 'curso', 'livro', 'professor', 'aula'], category: 'Educação' },
  {
    keywords: ['invest', 'tesouro', 'cdb', 'lci', 'lca', 'fundo', 'acao', 'acoes', 'fiis', 'renda fixa', 'poupanca', 'rendimento'],
    category: 'Investimentos',
  },
  { keywords: ['salario', 'honorarios', 'freela', 'freelance', 'pagamento', 'pix recebido', 'bonus', 'reembolso'], category: 'Salário' },
];

// Normaliza texto: minúsculas e sem acentos (para casar palavras-chave)
export function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Retorna a categoria provável a partir da descrição (regras do sistema)
export function categorize(description = '') {
  const text = normalize(description);
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) return rule.category;
  }
  return 'Outros';
}

// Prioridade de categorização: 1) regras do usuário > 2) regras do sistema > 3) "Outros"
export async function matchCategoryId(userId, description = '') {
  const text = normalize(description);
  if (!text) return null;

  // 1) Regras criadas pelo próprio usuário (ex.: "netflix" → Assinaturas)
  const rules = await prisma.rule.findMany({ where: { userId } });
  for (const rule of rules) {
    if (rule.keyword && text.includes(normalize(rule.keyword))) return rule.categoryId;
  }

  // 2) Regras do sistema (palavras-chave padrão)
  const systemName = categorize(description);
  const systemCat = await prisma.category.findFirst({ where: { userId, name: systemName } });
  if (systemCat) return systemCat.id;

  // 3) Categoria padrão "Outros"
  const outros = await prisma.category.findFirst({ where: { userId, name: 'Outros' } });
  return outros?.id || null;
}
