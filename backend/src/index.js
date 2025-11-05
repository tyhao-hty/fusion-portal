import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import timelineRoutes from './routes/timeline.js';
import papersRoutes from './routes/papers.js';
import linksRoutes from './routes/links.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('Fusion Portal API running'));
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/papers', papersRoutes);
app.use('/api/links', linksRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
