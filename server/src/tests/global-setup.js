import 'dotenv/config';
import { execSync } from 'node:child_process';

// Antes dos testes: usa um banco PostgreSQL separado (finview_test) e garante
// que o schema existe. A URL é derivada da DATABASE_URL de produção apenas
// trocando o nome do banco — evita guardar credenciais no código.
export default function setup() {
  const prodUrl = process.env.DATABASE_URL;
  if (!prodUrl) throw new Error('DATABASE_URL não encontrada (confira o server/.env).');
  process.env.DATABASE_URL = prodUrl.replace(/\/[^/?#]+(\?|$)/, '/finview_test$1');
  execSync('npx prisma db push --schema prisma/schema.prisma', { stdio: 'ignore' });
}
