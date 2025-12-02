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

function parseYear(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseTags(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }
  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveSort(sortParam = 'year_desc') {
  const value = String(sortParam).toLowerCase();

  if (value === 'year_asc') {
    return [
      { year: 'asc' },
      { sortOrder: 'desc' },
      { id: 'desc' },
    ];
  }

  if (value === 'name_asc') {
    return [
      { title: 'asc' },
      { year: 'desc' },
      { id: 'desc' },
    ];
  }

  if (value === 'name_desc') {
    return [
      { title: 'desc' },
      { year: 'desc' },
      { id: 'desc' },
    ];
  }

  return [
    { year: 'desc' },
    { sortOrder: 'desc' },
    { id: 'desc' },
  ];
}

function buildWhereClause({ year, yearFrom, yearTo, tags, search }) {
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

  if (yearFrom) {
    conditions.push({ year: { gte: yearFrom } });
  }

  if (yearTo) {
    conditions.push({ year: { lte: yearTo } });
  }

  if (tags && tags.length > 0) {
    conditions.push({
      AND: tags.map((tagValue) => ({
        tags: {
          some: {
            OR: [
              { slug: tagValue },
              { name: tagValue },
            ],
          },
        },
      })),
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
    const tagParam = req.query.tags ?? req.query.tag ?? req.query.tagSlug ?? null;
    const tags = parseTags(tagParam);
    const yearFrom = parseYear(req.query.yearFrom);
    const yearTo = parseYear(req.query.yearTo);

    if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
      return res.status(400).json({
        message: 'Invalid year range: yearFrom must be less than or equal to yearTo',
        error: { code: 400, message: 'Bad Request' },
      });
    }

    const sort = resolveSort(req.query.sort);

    const where = buildWhereClause({
      year: req.query.year,
      yearFrom,
      yearTo,
      tags,
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
        orderBy: sort,
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
        pageSize: limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
