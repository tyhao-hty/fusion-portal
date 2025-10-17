import express from 'express';
import { prisma } from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取所有文章
router.get('/', async (req, res, next) => {
  try {
    const articles = await prisma.article.findMany({
      include: { author: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// 获取单篇文章
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: '文章 ID 无效' });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: { select: { id: true, email: true } } },
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
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容为必填项' });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        authorId: req.user.id,
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

    const { title, content } = req.body;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    const isAuthor = article.authorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: '无权编辑该文章' });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: title ?? article.title,
        content: content ?? article.content,
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
