import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const view = String(req.query.view ?? 'nested').toLowerCase();
    const sectionFilter = req.query.section ?? req.query.sectionSlug ?? null;
    const groupFilter = req.query.group ?? req.query.groupSlug ?? null;
    const keyword = req.query.q ?? req.query.search ?? null;

    const linkWhere = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { url: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const sectionsWhere = sectionFilter ? { slug: sectionFilter } : undefined;
    const groupsWhere = groupFilter ? { slug: groupFilter } : undefined;

    const sections = await prisma.linkSection.findMany({
      where: sectionsWhere,
      orderBy: [
        { sortOrder: 'desc' },
        { id: 'desc' },
      ],
      include: {
        groups: {
          where: groupsWhere,
          orderBy: [
            { sortOrder: 'desc' },
            { id: 'desc' },
          ],
          include: {
            links: {
              where: linkWhere,
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

    const filtered = data
      .map((section) => ({
        ...section,
        groups: section.groups.filter((group) => group.links.length > 0 || (!keyword && !groupFilter)),
      }))
      .filter((section) => section.groups.length > 0 || (!keyword && !groupFilter));

    const flatLinks = filtered.flatMap((section) =>
      section.groups.flatMap((group) =>
        group.links.map((link) => ({
          ...link,
          section: {
            slug: section.slug,
            title: section.title,
          },
          group: {
            slug: group.slug,
            title: group.title,
          },
        })),
      ),
    );

    const meta = {
      sectionCount: filtered.length,
      groupCount: filtered.reduce((sum, section) => sum + section.groups.length, 0),
      linkCount: filtered.reduce(
        (sum, section) =>
          sum + section.groups.reduce((groupSum, group) => groupSum + group.links.length, 0),
        0,
      ),
      filters: {
        section: sectionFilter,
        group: groupFilter,
        keyword: keyword ?? null,
        view,
      },
    };

    if (view === 'flat') {
      return res.json({ data: flatLinks, meta: { ...meta, linkCount: flatLinks.length } });
    }

    res.json({ data: filtered, meta });
  } catch (error) {
    next(error);
  }
});

export default router;
