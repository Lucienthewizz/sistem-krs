const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const redisClient = require('./redis');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper middleware for caching
const cacheMiddleware = (keyPrefix) => {
  return async (req, res, next) => {
    try {
      const cachedData = await redisClient.get(keyPrefix);
      if (cachedData) {
        console.log(`Cache hit for ${keyPrefix}`);
        return res.json(JSON.parse(cachedData));
      }
      console.log(`Cache miss for ${keyPrefix}`);
      next();
    } catch (err) {
      console.error('Redis error', err);
      next();
    }
  };
};

const invalidateCache = async (keyPrefix) => {
  try {
    if (redisClient.isOpen) {
        await redisClient.del(keyPrefix);
    }
  } catch (err) {
    console.error('Redis invalidate error', err);
  }
};

// ================= DOSEN ROUTES =================
app.get('/api/dosen', cacheMiddleware('dosen_all'), async (req, res) => {
  try {
    const dosen = await prisma.dosen.findMany({
      orderBy: { nama: 'asc' }
    });
    if (redisClient.isOpen) {
        await redisClient.setEx('dosen_all', 3600, JSON.stringify(dosen));
    }
    res.json(dosen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dosen', async (req, res) => {
  try {
    const { nama, nidn } = req.body;
    const dosen = await prisma.dosen.create({ data: { nama, nidn } });
    await invalidateCache('dosen_all');
    res.status(201).json(dosen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/dosen/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nidn } = req.body;
    const dosen = await prisma.dosen.update({
      where: { id },
      data: { nama, nidn }
    });
    await invalidateCache('dosen_all');
    await invalidateCache('mahasiswa_all');
    res.json(dosen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/dosen/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dosen.delete({ where: { id } });
    await invalidateCache('dosen_all');
    await invalidateCache('mahasiswa_all');
    res.json({ message: 'Dosen deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= MAHASISWA ROUTES =================
app.get('/api/mahasiswa', cacheMiddleware('mahasiswa_all'), async (req, res) => {
  try {
    const mahasiswa = await prisma.mahasiswa.findMany({
      include: { dosen_pembimbing: true },
      orderBy: { nama: 'asc' }
    });
    if (redisClient.isOpen) {
        await redisClient.setEx('mahasiswa_all', 3600, JSON.stringify(mahasiswa));
    }
    res.json(mahasiswa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mahasiswa', async (req, res) => {
  try {
    const { nama, nim, dosen_pembimbing_id } = req.body;
    const mahasiswa = await prisma.mahasiswa.create({
      data: { nama, nim, dosen_pembimbing_id }
    });
    await invalidateCache('mahasiswa_all');
    res.status(201).json(mahasiswa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/mahasiswa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nim, dosen_pembimbing_id } = req.body;
    const mahasiswa = await prisma.mahasiswa.update({
      where: { id },
      data: { nama, nim, dosen_pembimbing_id }
    });
    await invalidateCache('mahasiswa_all');
    res.json(mahasiswa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/mahasiswa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mahasiswa.delete({ where: { id } });
    await invalidateCache('mahasiswa_all');
    res.json({ message: 'Mahasiswa deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
