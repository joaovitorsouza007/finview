import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { DEFAULT_CATEGORIES } from '../services/categorize.js';

const router = Router();

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    monthlyIncome: user.monthlyIncome,
    primaryGoal: user.primaryGoal,
    onboardingStep: user.onboardingStep,
    onboardedAt: user.onboardedAt,
  };
}

// Cadastro de novo usuário (cria categorias padrão e a meta inicial)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();

    if (!normalized || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    const exists = await prisma.user.findUnique({ where: { email: normalized } });
    if (exists) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
        name: name?.trim() || null,
        categories: { create: DEFAULT_CATEGORIES },
        goal: { create: { percent: 10 } },
      },
    });

    res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalized = String(email || '').trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    const ok = await bcrypt.compare(String(password || ''), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// Dados do usuário logado
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// Onboarding: salva o progresso (passo atual) e/ou conclui o fluxo.
// - monthlyIncome: renda mensal aproximada (em reais)
// - primaryGoal: objetivo principal (investir, quitar_dividas, viajar, ...)
// - step: passo atual (1..3)
// - complete: true encerra o onboarding
router.put('/onboarding', requireAuth, async (req, res, next) => {
  try {
    const { monthlyIncome, primaryGoal, step, complete } = req.body || {};
    const data = {};

    if (monthlyIncome !== undefined && monthlyIncome !== null && monthlyIncome !== '') {
      const cents = Math.round(Number(monthlyIncome) * 100);
      data.monthlyIncome = Number.isFinite(cents) && cents > 0 ? cents : null;
    }
    if (primaryGoal !== undefined) data.primaryGoal = String(primaryGoal);
    if (step !== undefined) {
      const n = Math.round(Number(step));
      data.onboardingStep = Number.isFinite(n) ? Math.min(3, Math.max(0, n)) : 0;
    }
    if (complete) {
      data.onboardingStep = 3;
      data.onboardedAt = new Date();
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
