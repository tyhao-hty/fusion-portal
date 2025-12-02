import express from 'express';
import { prisma } from '../prisma/client.js';
import { authenticateToken, authenticateTokenOptional } from '../middleware/auth.js';

const router = express.Router();

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_STATUS = 'published';
const ARTICLE_STATUSES = new Set(['draft', 'review', 'published']);
const STATUS_ALL = 'all';

const parseIntOrNull = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseDateOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildYearRange = (year) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { gte: start, lt: end };
};

const slugify = (text) => {
  const base = (text || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `article-${Date.now()}`;
};

// 获取文章列表（分页、搜索、过滤）
router.get('/', authenticateTokenOptional, async (req, res, next) => {
  try {
    const page = Math.max(1, parseIntOrNull(req.query.page) || 1);
    const pageSizeRaw = parseIntOrNull(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const tags =
      typeof req.query.tags === 'string'
        ? req.query.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
    const statusRaw = typeof req.query.status === 'string' ? req.query.status.trim() : DEFAULT_STATUS;
    const status =
      statusRaw === STATUS_ALL
        ? STATUS_ALL
        : ARTICLE_STATUSES.has(statusRaw)
          ? statusRaw
          : DEFAULT_STATUS;
    const year = parseIntOrNull(req.query.year);
    const yearFrom = parseIntOrNull(req.query.yearFrom);
    const yearTo = parseIntOrNull(req.query.yearTo);
    const sortParam = typeof req.query.sort === 'string' ? req.query.sort : 'published_desc';

    const sortMap = {
      published_desc: [{ publishedAt: 'desc' }, { id: 'desc' }],
      published_asc: [{ publishedAt: 'asc' }, { id: 'asc' }],
      title_asc: [{ title: 'asc' }, { id: 'asc' }],
      title_desc: [{ title: 'desc' }, { id: 'desc' }],
    };
    const orderBy = sortMap[sortParam] || sortMap.published_desc;

    const where = {};

    if (status && status !== STATUS_ALL) {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (tags.length > 0) {
      where.tags = { some: { slug: { in: tags } } };
    }

    const yearFilters = [];
    if (year !== null) {
      yearFilters.push({ timelineYear: year }, { publishedAt: buildYearRange(year) });
    } else if (yearFrom !== null || yearTo !== null) {
      const lower = yearFrom ?? yearTo;
      const upper = yearTo ?? yearFrom;
      const timelineYearRange = {};
      if (lower !== null) timelineYearRange.gte = lower;
      if (upper !== null) timelineYearRange.lte = upper;
      if (Object.keys(timelineYearRange).length > 0) {
        yearFilters.push({ timelineYear: timelineYearRange });
      }
      const hasLower = lower !== null;
      const hasUpper = upper !== null;
      if (hasLower && hasUpper) {
        const start = Math.min(lower, upper);
        const end = Math.max(lower, upper) + 1;
        yearFilters.push({ publishedAt: { gte: new Date(start, 0, 1), lt: new Date(end, 0, 1) } });
      } else if (hasLower) {
        yearFilters.push({ publishedAt: { gte: new Date(lower, 0, 1) } });
      } else if (hasUpper) {
        yearFilters.push({ publishedAt: { lt: new Date(upper + 1, 0, 1) } });
      }
    }

    if (yearFilters.length > 0) {
      where.AND = where.AND || [];
      where.AND.push({ OR: yearFilters });
    }

    const [total, data] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, email: true } },
          category: { select: { id: true, slug: true, name: true } },
          tags: { select: { id: true, slug: true, name: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.json({
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取单篇文章（按 slug 优先，兼容数字 ID）
router.get('/:slugOrId', async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const id = Number.parseInt(slugOrId, 10);
    const where = Number.isNaN(id) ? { slug: slugOrId } : { OR: [{ slug: slugOrId }, { id }] };

    const article = await prisma.article.findFirst({
      where,
      include: {
        author: { select: { id: true, email: true } },
        category: { select: { id: true, slug: true, name: true } },
        tags: { select: { id: true, slug: true, name: true } },
        timelineEvents: {
          select: { id: true, slug: true, yearLabel: true, yearValue: true, title: true },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
});

// 创建文章（需登录）
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, slug, status, publishedAt, excerpt, coverImageUrl, readingTime, timelineYear, categoryId, tagIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容为必填项' });
    }

    const finalSlug = typeof slug === 'string' && slug.trim() ? slug.trim() : slugify(title);
    const finalStatus = ARTICLE_STATUSES.has(status) ? status : 'draft';

    const article = await prisma.article.create({
      data: {
        title,
        content,
        slug: finalSlug,
        status: finalStatus,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        excerpt: excerpt ?? null,
        coverImageUrl: coverImageUrl ?? null,
        readingTime: parseIntOrNull(readingTime),
        timelineYear: parseIntOrNull(timelineYear),
        categoryId: parseIntOrNull(categoryId),
        authorId: req.user.id,
        tags:
          Array.isArray(tagIds) && tagIds.length > 0
            ? {
                connect: tagIds
                  .map((id) => parseIntOrNull(id))
                  .filter((id) => typeof id === 'number')
                  .map((id) => ({ id })),
              }
            : undefined,
      },
    });
    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

// 更新文章（需作者或管理员）
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: '文章 ID 无效' });
    }

    const {
      title,
      content,
      slug,
      status,
      publishedAt,
      excerpt,
      coverImageUrl,
      readingTime,
      timelineYear,
      categoryId,
      tagIds,
    } = req.body;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    const isAuthor = article.authorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: '无权编辑该文章' });
    }

    const data = {};
    if (typeof title === 'string') data.title = title;
    if (typeof content === 'string') data.content = content;
    if (typeof slug === 'string' && slug.trim()) data.slug = slug.trim();
    if (typeof excerpt === 'string') data.excerpt = excerpt;
    if (typeof coverImageUrl === 'string') data.coverImageUrl = coverImageUrl;

    if (ARTICLE_STATUSES.has(status)) {
      data.status = status;
    }

    const parsedPublishedAt = publishedAt === null ? null : parseDateOrNull(publishedAt);
    if (publishedAt !== undefined) {
      data.publishedAt = parsedPublishedAt;
    }
    if (data.status === 'published' && data.publishedAt === undefined && !article.publishedAt) {
      data.publishedAt = new Date();
    }

    const parsedReadingTime = parseIntOrNull(readingTime);
    if (readingTime !== undefined) data.readingTime = parsedReadingTime;

    const parsedTimelineYear = parseIntOrNull(timelineYear);
    if (timelineYear !== undefined) data.timelineYear = parsedTimelineYear;

    const parsedCategoryId = parseIntOrNull(categoryId);
    if (categoryId !== undefined) data.categoryId = parsedCategoryId;

    if (Array.isArray(tagIds)) {
      const connectIds = tagIds
        .map((t) => parseIntOrNull(t))
        .filter((num) => typeof num === 'number')
        .map((num) => ({ id: num }));
      data.tags = { set: connectIds };
    }

    const updated = await prisma.article.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, email: true } },
        category: { select: { id: true, slug: true, name: true } },
        tags: { select: { id: true, slug: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// 删除文章（仅作者本人）
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: '文章 ID 无效' });
    }

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    if (article.authorId !== req.user.id) {
      return res.status(403).json({ message: '无权删除此文章' });
    }

    await prisma.article.delete({ where: { id } });
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
