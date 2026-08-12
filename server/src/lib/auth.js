import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'finview-dev-secret';

// Gera um token de acesso válido por 7 dias
export function signToken(userId) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: '7d' });
}

// Verifica e retorna o conteúdo de um token
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
