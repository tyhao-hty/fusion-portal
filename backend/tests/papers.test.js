import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import papersRoutes from '../src/routes/papers.js';
import { prisma } from '../src/prisma/client.js';

const app = express();
app.use(express.json());
app.use('/api/papers', papersRoutes);

const TEST_TAG_SLUG = 'vitest-tag-paper';
const TEST_PAPERS = [
  {
    slug: 'vitest-paper-001',
    title: '聚变论文测试一',
    authors: 'Tester One',
    year: 2023,
    venue: 'Fusion Test Journal',
    url: 'https://example.com/paper-001',
    abstract: '测试摘要 1',
    sortOrder: 5,
  },
  {
    slug: 'vitest-paper-002',
    title: '聚变论文测试二',
    authors: 'Tester Two',
    year: 2024,
    venue: 'Fusion Test Journal',
    url: 'https://example.com/paper-002',
    abstract: '测试摘要 2',
    sortOrder: 4,
  },
];

describe('GET /api/papers', () => {
  beforeAll(async () => {
    await prisma.paperTag.create({
      data: {
        slug: TEST_TAG_SLUG,
        name: '测试标签',
      },
    });

    for (const paper of TEST_PAPERS) {
      await prisma.paper.create({
        data: {
          ...paper,
          tags: {
            connect: {
              slug: TEST_TAG_SLUG,
            },
          },
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.paper.deleteMany({
      where: {
        slug: {
          in: TEST_PAPERS.map((paper) => paper.slug),
        },
      },
    });
    await prisma.paperTag.deleteMany({
      where: {
        slug: TEST_TAG_SLUG,
      },
    });
  });

  it('返回默认论文列表', async () => {
    const res = await request(app).get('/api/papers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((item) => item.slug === TEST_PAPERS[0].slug)).toBe(true);
  });

  it('支持关键词搜索', async () => {
    const res = await request(app).get('/api/papers').query({ search: '测试一' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].slug).toBe(TEST_PAPERS[0].slug);
  });

  it('支持标签筛选', async () => {
    const res = await request(app).get('/api/papers').query({ tag: TEST_TAG_SLUG });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((item) =>
      item.tags.some((tag) => tag.slug === TEST_TAG_SLUG),
    )).toBe(true);
  });
});
