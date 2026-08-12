import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Convites enviados por mim (dono) e convites recebidos (visitante)
router.get('/', async (req, res, next) => {
  try {
    const [sent, received, active] = await Promise.all([
      prisma.sharedAccess.findMany({
        where: { ownerId: req.user.id },
        include: { guest: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sharedAccess.findMany({
        where: { email: req.user.email, acceptedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sharedAccess.findMany({
        where: { ownerId: req.user.id, acceptedAt: { not: null } },
        include: { guest: { select: { id: true, name: true, email: true } } },
      }),
    ]);
    res.json({ sent, received, active });
  } catch (err) {
    next(err);
  }
});

// Convida outra pessoa por e-mail para compartilhar as finanças
router.post('/invite', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Informe o e-mail da pessoa.' });
    if (email === req.user.email) return res.status(400).json({ error: 'Você não pode compartilhar consigo mesmo.' });

    const existing = await prisma.sharedAccess.findFirst({ where: { ownerId: req.user.id, email } });
    if (existing) return res.status(409).json({ error: 'Convite já enviado para este e-mail.' });

    const invite = await prisma.sharedAccess.create({
      data: { ownerId: req.user.id, email },
    });
    res.status(201).json(invite);
  } catch (err) {
    next(err);
  }
});

// O convidado aceita o convite (passa a ver/editar os dados do dono)
router.post('/:id/accept', async (req, res, next) => {
  try {
    const invite = await prisma.sharedAccess.findFirst({
      where: { id: req.params.id, email: req.user.email, acceptedAt: null },
    });
    if (!invite) return res.status(404).json({ error: 'Convite não encontrado.' });

    const updated = await prisma.sharedAccess.update({
      where: { id: invite.id },
      data: { guestId: req.user.id, acceptedAt: new Date() },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Revoga um compartilhamento (dono)
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await prisma.sharedAccess.deleteMany({
      where: { id: req.params.id, OR: [{ ownerId: req.user.id }, { guestId: req.user.id }] },
    });
    if (deleted.count === 0) return res.status(404).json({ error: 'Compartilhamento não encontrado.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
