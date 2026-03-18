import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    select: { email: true, role: true }
  });
  console.log('Current Users in DB:', JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
