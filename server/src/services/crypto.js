import crypto from 'crypto';

// Criptografia do token de acesso do Pluggy (AES-256-GCM com IV aleatório).
// A chave vem do ENCRYPTION_KEY; em desenvolvimento, usa uma padrão (documentado
// no README para nunca ser usada em produção).
const KEY = crypto.createHash('sha256').update(
  process.env.ENCRYPTION_KEY || 'finview-dev-encryption-key',
).digest();

const ALGO = 'aes-256-gcm';

export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text) {
  try {
    const [ivHex, tagHex, dataHex] = String(text).split(':');
    const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}
