import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function sanitizeLimit(value) {
  return Math.min(Math.max(value, 1), MAX_LIMIT);
}

function buildWhereClause({ year }) {
  if (!year) {
    return {};
  }
  const numericYear = Number.parseInt(year, 10);
  if (Number.isNaN(numericYear)) {
    return {
      OR: [
        { yearLabel: { contains: year } },
      ],
    };
  }
  return {
    OR: [
      { yearValue: numericYear },
      { yearLabel: { contains: String(numericYear) } },
    ],
  };
}

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInteger(req.query.page, DEFAULT_PAGE), 1);
    const limit = sanitizeLimit(parseInteger(req.query.limit ?? req.query.pageSize, DEFAULT_LIMIT));
    const order = String(req.query.order ?? req.query.sort ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = buildWhereClause({ year: req.query.year });

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
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        order,
        hasNext: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
