import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function sanitizeLimit(value) {
  return Math.min(Math.max(value, 1), MAX_LIMIT);
}

function buildWhereClause({ year, tag, search }) {
  const conditions = [];

  if (year) {
    const numericYear = Number.parseInt(year, 10);
    if (!Number.isNaN(numericYear)) {
      conditions.push({ year: numericYear });
    } else {
      conditions.push({
        OR: [
          { venue: { contains: year, mode: 'insensitive' } },
          { title: { contains: year, mode: 'insensitive' } },
        ],
      });
    }
  }

  if (tag) {
    conditions.push({
      tags: {
        some: {
          OR: [
            { slug: tag },
            { name: tag },
          ],
        },
      },
    });
  }

  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { authors: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (conditions.length === 0) {
    return {};
  }

  return { AND: conditions };
}

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInteger(req.query.page, DEFAULT_PAGE), 1);
    const limit = sanitizeLimit(parseInteger(req.query.limit ?? req.query.pageSize, DEFAULT_LIMIT));
    const search = req.query.search ?? req.query.q ?? null;
    const tag = req.query.tag ?? req.query.tagSlug ?? null;
    const where = buildWhereClause({
      year: req.query.year,
      tag,
      search,
    });

    const [total, items] = await Promise.all([
      prisma.paper.count({ where }),
      prisma.paper.findMany({
        where,
        include: {
          tags: {
            orderBy: { name: 'asc' },
          },
        },
        orderBy: [
          { year: 'desc' },
          { sortOrder: 'desc' },
          { id: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      data: items.map((item) => ({
        slug: item.slug,
        title: item.title,
        authors: item.authors,
        year: item.year,
        venue: item.venue,
        url: item.url,
        abstract: item.abstract,
        sortOrder: item.sortOrder,
        tags: item.tags.map((tagItem) => ({
          slug: tagItem.slug,
          name: tagItem.name,
        })),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
