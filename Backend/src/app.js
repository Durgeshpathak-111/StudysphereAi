// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

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

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:5174',
//   process.env.CLIENT_URL,
// ].filter(Boolean);

// // frameguard: false ensures X-Frame-Options doesn't block localhost:5173 iframe from embedding localhost:5000 PDFs
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: 'cross-origin' },
//     contentSecurityPolicy: false,
//     frameguard: false,
//   })
// );

// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

// // Recursively locate requested PDF inside any uploads folder or subfolder
// const findFileRecursively = (dir, targetFileName) => {
//   if (!fs.existsSync(dir)) return null;
//   const entries = fs.readdirSync(dir, { withFileTypes: true });
//   for (const entry of entries) {
//     const fullPath = path.join(dir, entry.name);
//     if (entry.isDirectory()) {
//       const found = findFileRecursively(fullPath, targetFileName);
//       if (found) return found;
//     } else if (entry.name === targetFileName) {
//       return fullPath;
//     }
//   }
//   return null;
// };

// // Smart /uploads route: finds and serves PDF inline regardless of subfolder
// app.get('/uploads/*', (req, res, next) => {
//   const requestedFile = path.basename(decodeURIComponent(req.path));
//   const candidateRoots = [
//     path.join(process.cwd(), 'uploads'),
//     path.join(__dirname, 'uploads'),
//     path.join(__dirname, '..', 'uploads'),
//     path.join(__dirname, '..', '..', 'uploads'),
//   ];

//   for (const root of candidateRoots) {
//     const foundPath = findFileRecursively(root, requestedFile);
//     if (foundPath) {
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', 'inline');
//       return res.sendFile(foundPath);
//     }
//   }
//   next();
// });

// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     service: 'studysphere-node-backend',
//     timestamp: new Date().toISOString(),
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
import fs from 'fs';
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

// Allow all origins (localhost + Vercel live) cleanly with credentials
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options('*', cors({ origin: true, credentials: true }));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    frameguard: false,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Recursively locate requested PDF inside any uploads folder or subfolder
const findFileRecursively = (dir, targetFileName) => {
  if (!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFileRecursively(fullPath, targetFileName);
      if (found) return found;
    } else if (entry.name === targetFileName) {
      return fullPath;
    }
  }
  return null;
};

// Smart /uploads route: finds and serves PDF inline regardless of subfolder
app.get('/uploads/*', (req, res, next) => {
  const requestedFile = path.basename(decodeURIComponent(req.path));
  const candidateRoots = [
    path.join(process.cwd(), 'uploads'),
    path.join(__dirname, 'uploads'),
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', '..', 'uploads'),
  ];

  for (const root of candidateRoots) {
    const foundPath = findFileRecursively(root, requestedFile);
    if (foundPath) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return res.sendFile(foundPath);
    }
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'studysphere-node-backend',
    timestamp: new Date().toISOString(),
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