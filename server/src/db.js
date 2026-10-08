const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// One client (and connection pool) per process
const createPrisma = (connectionString) =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

module.exports = { createPrisma };
