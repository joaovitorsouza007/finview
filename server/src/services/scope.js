import { prisma } from '../lib/prisma.js';

// Resolve qual usuário "dono dos dados" deve ser usado nas consultas.
// Quando o usuário logado é convidado de um compartilhamento já aceito,
// ele passa a ver/editar os dados do dono (casal/família).
export async function resolveScope(userId) {
  const share = await prisma.sharedAccess.findFirst({
    where: { guestId: userId, acceptedAt: { not: null } },
  });
  if (!share) return { effectiveUserId: userId, ownerId: null, shared: false };
  return { effectiveUserId: share.ownerId, ownerId: share.ownerId, shared: true };
}
