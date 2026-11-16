// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';

// import authRoutes from './routes/authRoutes.js';
// import dashboardRoutes from './routes/dashboardRoutes.js';
// import subjectRoutes from './routes/subjectRoutes.js';
// import documentRoutes from './routes/documentRoutes.js';
// import chatRoutes from './routes/chatRoutes.js';
// import notesRoutes from './routes/notesRoutes.js';
// import quizRoutes from './routes/quizRoutes.js';
// import pyqRoutes from './routes/pyqRoutes.js';
// import analyticsRoutes from './routes/analyticsRoutes.js';
// import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';



// const app = express();

// app.use(helmet());
// app.use(
//   cors({
//     origin: ['http://localhost:5173', 'http://localhost:5174', process.env.CLIENT_URL].filter(Boolean),
//     credentials: true
//   })
// );
// app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     service: 'studysphere-node-backend',
//     timestamp: new Date().toISOString()
//   });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/subjects', subjectRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/notes', notesRoutes);
// app.use('/api/quizzes', quizRoutes);
// app.use('/api/pyq', pyqRoutes);
// app.use('/api/analytics', analyticsRoutes);

// app.use(notFoundHandler);
// app.use(errorHandler);

// export default app;


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Allow iframe embedding & serve PDFs from all upload locations
const allowFrame = (req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
};

app.use('/uploads', allowFrame, express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads', allowFrame, express.static(path.join(process.cwd(), 'uploads', 'documents')));
app.use('/uploads', allowFrame, express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', allowFrame, express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'studysphere-node-backend',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;