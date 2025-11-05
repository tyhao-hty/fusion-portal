import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const sections = await prisma.linkSection.findMany({
      orderBy: [
        { sortOrder: 'desc' },
        { id: 'desc' },
      ],
      include: {
        groups: {
          orderBy: [
            { sortOrder: 'desc' },
            { id: 'desc' },
          ],
          include: {
            links: {
              orderBy: [
                { sortOrder: 'desc' },
                { id: 'desc' },
              ],
            },
          },
        },
      },
    });

    const data = sections.map((section) => ({
      slug: section.slug,
      title: section.title,
      sortOrder: section.sortOrder,
      groups: section.groups.map((group) => ({
        slug: group.slug,
        title: group.title,
        sortOrder: group.sortOrder,
        links: group.links.map((link) => ({
          slug: link.slug,
          name: link.name,
          url: link.url,
          description: link.description,
          sortOrder: link.sortOrder,
        })),
      })),
    }));

    const meta = {
      sectionCount: data.length,
      groupCount: data.reduce((sum, section) => sum + section.groups.length, 0),
      linkCount: data.reduce(
        (sum, section) =>
          sum + section.groups.reduce((groupSum, group) => groupSum + group.links.length, 0),
        0,
      ),
    };

    res.json({ data, meta });
  } catch (error) {
    next(error);
  }
});

export default router;
