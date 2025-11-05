import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import linksRoutes from '../src/routes/links.js';
import { prisma } from '../src/prisma/client.js';

const app = express();
app.use(express.json());
app.use('/api/links', linksRoutes);

const TEST_SECTION_SLUG = 'vitest-section';
const TEST_GROUP_SLUG = 'vitest-group';
const TEST_LINK_SLUG = 'vitest-link';

describe('GET /api/links', () => {
  beforeAll(async () => {
    const section = await prisma.linkSection.create({
      data: {
        slug: TEST_SECTION_SLUG,
        title: '测试分类',
        sortOrder: 99,
      },
    });

    const group = await prisma.linkGroup.create({
      data: {
        slug: TEST_GROUP_SLUG,
        title: '测试分组',
        sortOrder: 88,
        sectionId: section.id,
      },
    });

    await prisma.link.create({
      data: {
        slug: TEST_LINK_SLUG,
        name: '测试链接',
        url: 'https://example.com/fusion',
        description: '用于测试的链接描述',
        sortOrder: 77,
        groupId: group.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.link.deleteMany({
      where: { slug: TEST_LINK_SLUG },
    });
    await prisma.linkGroup.deleteMany({
      where: { slug: TEST_GROUP_SLUG },
    });
    await prisma.linkSection.deleteMany({
      where: { slug: TEST_SECTION_SLUG },
    });
  });

  it('返回链接嵌套结构', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const targetSection = res.body.data.find((section) => section.slug === TEST_SECTION_SLUG);
    expect(targetSection).toBeDefined();
    expect(targetSection.groups[0].links[0].slug).toBe(TEST_LINK_SLUG);
  });

  it('返回统计元数据', async () => {
    const res = await request(app).get('/api/links');
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.sectionCount).toBeGreaterThan(0);
    expect(res.body.meta.groupCount).toBeGreaterThan(0);
    expect(res.body.meta.linkCount).toBeGreaterThan(0);
  });
});
