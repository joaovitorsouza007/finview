import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { encrypt, decrypt } from '../services/crypto.js';
import { listInstitutions, createConnectUrl, getItemStatus, isDemo, getItemAccounts } from '../services/pluggy.js';
import { syncConnection, getConnectionDetail } from '../services/bank-sync.js';

const router = Router();

// URL do frontend para onde o Pluggy redireciona após a autorização
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---------------------------------------------------------------
// Webhook do Pluggy (público): avisa quando há transações novas.
// O webhook só carrega o itemId; buscamos a conexão correspondente.
// ---------------------------------------------------------------
router.post('/webhook', async (req, res) => {
  const { event = '', data = {} } = req.body || {};
  const itemId = data?.itemId || data?.item_id || data?.id;

  res.status(200).json({ ok: true });

  if (!itemId) return;
  const connection = await prisma.bankConnection.findFirst({ where: { itemId } }).catch(() => null);
  if (!connection) return;

  try {
    if (String(event).toUpperCase() === 'LOGIN_ERROR') {
      await prisma.bankConnection.update({
        where: { id: connection.id },
        data: { status: 'ERROR', lastError: 'Não foi possível entrar no seu banco. Autorize novamente.' },
      });
    } else if (connection.status === 'ACTIVE') {
      await syncConnection(connection.id);
    }
  } catch {
    /* erros de sincronização ficam no log; o agendador tenta de novo */
  }
});

// A partir daqui, tudo exige login
router.use(requireAuth);

// ---------------------------------------------------------------
// Bancos disponíveis para conexão (vêm da lista do Pluggy)
// ---------------------------------------------------------------
router.get('/available', async (req, res, next) => {
  try {
    const institutions = await listInstitutions({ search: req.query.search || '' });
    res.json({ institutions, demoMode: isDemo() });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// Lista os bancos já conectados pelo usuário
// ---------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const connections = await prisma.bankConnection.findMany({
      where: { userId: req.user.id, status: { not: 'DISCONNECTED' } },
      orderBy: { createdAt: 'desc' },
    });
    const detail = await Promise.all(connections.map((c) => getConnectionDetail(c)));
    res.json(detail);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// Inicia a conexão: cria a "conexão pendente" e devolve a URL segura
// para onde o usuário será levado (ambiente do banco / demo).
// ---------------------------------------------------------------
router.post('/connect', async (req, res, next) => {
  try {
    const institutionId = String(req.body?.institutionId || '');
    if (!institutionId) return res.status(400).json({ error: 'Escolha um banco.' });

    const institutions = await listInstitutions({ search: institutionId });
    const institution = institutions.find((i) => i.id === institutionId);
    if (!institution) return res.status(400).json({ error: 'Banco não encontrado.' });

    const connection = await prisma.bankConnection.create({
      data: {
        userId: req.user.id,
        institution: institution.id,
        institutionName: institution.name,
        status: 'CONNECTING',
      },
    });

    const callbackUrl = `${FRONTEND_URL}/bancos/callback?ref=${connection.id}`;
    const url = await createConnectUrl({ institutionId, callbackUrl });

    res.json({ authUrl: url, connectionId: connection.id, demoMode: isDemo() });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// Finaliza a conexão após o usuário voltar do banco com o itemId.
// Liga o item do Pluggy à conexão pendente e define o status.
// ---------------------------------------------------------------
router.post('/claim', async (req, res, next) => {
  try {
    const itemId = String(req.body?.itemId || '');
    const ref = String(req.body?.ref || '');
    if (!itemId) return res.status(400).json({ error: 'Não foi possível completar a conexão. Tente novamente.' });

    // Prioriza a conexão pendente do redirect (ref); senão, a mais recente
    let connection = null;
    if (ref) {
      connection = await prisma.bankConnection.findFirst({ where: { id: ref, userId: req.user.id } });
    }
    if (!connection) {
      connection = await prisma.bankConnection.findFirst({
        where: { userId: req.user.id, status: 'CONNECTING' },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (!connection) {
      // Sem pendente: registra uma nova conexão direta pelo item
      connection = await prisma.bankConnection.create({
        data: {
          userId: req.user.id,
          institution: 'banco',
          institutionName: 'Banco',
          status: 'CONNECTING',
        },
      });
    }

    const accessToken = encrypt(itemId);
    let status = 'ACTIVE';
    try {
      const itemStatus = await getItemStatus(itemId);
      if (itemStatus === 'LOGIN_ERROR') status = 'ERROR';
      else if (itemStatus === 'LOGIN_REQUIRED') status = 'EXPIRED';
    } catch {
      status = 'ERROR';
    }

    const updated = await prisma.bankConnection.update({
      where: { id: connection.id },
      data: { itemId, accessToken, status },
    });

    res.json({ connection: await getConnectionDetail(updated), demoMode: isDemo() });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// Sincronização manual: importa as transações novas agora
// ---------------------------------------------------------------
router.post('/:id/sync', async (req, res, next) => {
  try {
    const connection = await prisma.bankConnection.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!connection) return res.status(404).json({ error: 'Banco não encontrado.' });
    if (connection.status === 'DISCONNECTED') return res.status(400).json({ error: 'Este banco está desconectado.' });

    const result = await syncConnection(connection.id);
    res.json({ ...result, connection: await getConnectionDetail(connection) });
  } catch (err) {
    if (err.message) return res.status(400).json({ error: err.message });
    next(err);
  }
});

// ---------------------------------------------------------------
// Transações importadas de um banco (para conferência)
// ---------------------------------------------------------------
router.get('/:id/transactions', async (req, res, next) => {
  try {
    const connection = await prisma.bankConnection.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!connection) return res.status(404).json({ error: 'Banco não encontrado.' });

    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id, bankConnectionId: connection.id },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
      orderBy: { date: 'desc' },
      take: 200,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// Desconecta o banco: mantém as transações já importadas
// ---------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const updated = await prisma.bankConnection.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { status: 'DISCONNECTED', accessToken: '', lastError: null },
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Banco não encontrado.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
