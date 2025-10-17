import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client.js';
import { signToken } from '../utils/jwt.js';

const router = express.Router();
const SALT_ROUNDS = 10;

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码为必填项' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role && typeof role === 'string' ? role : undefined,
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码为必填项' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: '密码错误' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

export default router;
