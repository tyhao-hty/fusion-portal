import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import timelineRoutes from '../src/routes/timeline.js';
import { prisma } from '../src/prisma/client.js';

const app = express();
app.use(express.json());
app.use('/api/timeline', timelineRoutes);

describe('GET /api/timeline', () => {
  beforeAll(async () => {
    await prisma.timelineEvent.createMany({
      data: [
        {
          slug: 'timeline-2000',
          yearLabel: '2000年',
          yearValue: 2000,
          title: '测试事件 2000',
          description: '测试描述 2000',
          sortOrder: 2,
        },
        {
          slug: 'timeline-1990',
          yearLabel: '1990年',
          yearValue: 1990,
          title: '测试事件 1990',
          description: '测试描述 1990',
          sortOrder: 1,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.timelineEvent.deleteMany({
      where: {
        slug: {
          in: ['timeline-2000', 'timeline-1990'],
        },
      },
    });
  });

  it('返回默认分页结果', async () => {
    const res = await request(app).get('/api/timeline');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBeGreaterThan(0);
  });

  it('支持年份筛选', async () => {
    const res = await request(app).get('/api/timeline').query({ year: '1990' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].yearLabel).toContain('1990');
  });

  it('处理非法参数', async () => {
    const res = await request(app).get('/api/timeline').query({ limit: 'abc' });
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBeGreaterThan(0);
  });
});
