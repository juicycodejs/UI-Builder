import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { setupSocketServer } from './lib/socket';
import { setupYjsServer } from './lib/yjsServer';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ui-builder';
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');

  setupSocketServer(server);
  setupYjsServer(server);

  const port = process.env.PORT || 4000;
  server.listen(port, () => console.log(`Backend running on port ${port}`));
}

start().catch(console.error);
