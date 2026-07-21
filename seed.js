/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const alice = await prisma.user.create({
    data: { id: "alice_id", name: "Alice" }
  });
  const bob = await prisma.user.create({
    data: { id: "bob_id", name: "Bob" }
  });
  const carol = await prisma.user.create({
    data: { id: "carol_id", name: "Carol" }
  });
  console.log("Seeded database with Alice, Bob, Carol");
}

main().catch(console.error).finally(() => prisma.$disconnect());
