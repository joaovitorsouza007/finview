import { PrismaClient } from '@prisma/client';

// Instância única do banco de dados
export const prisma = new PrismaClient();
