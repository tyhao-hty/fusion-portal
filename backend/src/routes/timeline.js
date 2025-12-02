import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function sanitizeLimit(value) {
  return Math.min(Math.max(value, 1), MAX_LIMIT);
}

function buildWhereClause({ year, yearFrom, yearTo, q }) {
  const conditions = [];

  if (year) {
    const numericYear = Number.parseInt(year, 10);
    if (Number.isNaN(numericYear)) {
      conditions.push({
        OR: [
          { yearLabel: { contains: year, mode: 'insensitive' } },
        ],
      });
    } else {
      conditions.push({
        OR: [
          { yearValue: numericYear },
          { yearLabel: { contains: String(numericYear), mode: 'insensitive' } },
        ],
      });
    }
  }

  if (yearFrom) {
    conditions.push({ yearValue: { gte: yearFrom } });
  }
  if (yearTo) {
    conditions.push({ yearValue: { lte: yearTo } });
  }

  if (q) {
    conditions.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
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
    const order = String(req.query.order ?? req.query.sort ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const yearFrom = parseInteger(req.query.yearFrom, null);
    const yearTo = parseInteger(req.query.yearTo, null);
    if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
      return res.status(400).json({
        message: 'Invalid year range: yearFrom must be less than or equal to yearTo',
        error: { code: 400, message: 'Bad Request' },
      });
    }

    const where = buildWhereClause({
      year: req.query.year,
      yearFrom,
      yearTo,
      q: req.query.q ?? req.query.search ?? null,
    });

    const [total, items] = await Promise.all([
      prisma.timelineEvent.count({ where }),
      prisma.timelineEvent.findMany({
        where,
        orderBy: [
          { sortOrder: order },
          { id: order },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      data: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        yearLabel: item.yearLabel,
        yearValue: item.yearValue,
        title: item.title,
        description: item.description,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      meta: {
        page,
        limit,
        pageSize: limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        order,
        hasNext: page * limit < total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
