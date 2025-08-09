import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import { authenticateToken } from './middleware/authMiddleware';
import userRoutes from './routes/user';
import projectsRoutes from './routes/projects';

const app = express();

// Security + Logging
app.use(helmet());
app.use(morgan('dev'));

// JSON parsing
app.use(express.json());

// CORS (only once, with correct settings)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'PeerFusion API running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected data!', user: (req as any).user });
});
app.use('/api/users', userRoutes);
app.use('/api/projects', projectsRoutes);

export default app;
