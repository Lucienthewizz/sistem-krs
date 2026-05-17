const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.mahasiswa.deleteMany();
  await prisma.dosen.deleteMany();

  const dosen1 = await prisma.dosen.create({
    data: {
      nama: 'Dr. Budi Santoso',
      nidn: '1122334455'
    }
  });

  const dosen2 = await prisma.dosen.create({
    data: {
      nama: 'Prof. Siti Aminah',
      nidn: '9988776655'
    }
  });

  await prisma.mahasiswa.createMany({
    data: [
      {
        nama: 'Andi Wijaya',
        nim: '210001',
        dosen_pembimbing_id: dosen1.id
      },
      {
        nama: 'Rina Melati',
        nim: '210002',
        dosen_pembimbing_id: dosen1.id
      },
      {
        nama: 'Bambang Pamungkas',
        nim: '210003',
        dosen_pembimbing_id: dosen2.id
      }
    ]
  });

  console.log('Database seeded successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
