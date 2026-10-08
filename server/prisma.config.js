// Prisma CLI configuration (migrations, seeding, Studio).
require('dotenv/config');
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    // Migrations need a direct connection (Supabase: the session pooler on port 5432).
    // The app itself connects through DATABASE_URL (Supabase: the transaction pooler).
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
