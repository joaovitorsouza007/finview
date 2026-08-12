import { verifyToken } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

// Middleware que exige um usuário autenticado
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Não autenticado.' });

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Sessão expirada, faça login novamente.' });
  }
}
