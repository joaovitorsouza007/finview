import { execSync } from 'node:child_process';

// Antes dos testes: usa um banco separado e garante que o schema existe
export default function setup() {
  process.env.DATABASE_URL = 'file:./test.db';
  execSync('npx prisma db push --schema prisma/schema.prisma', { stdio: 'ignore' });
}
