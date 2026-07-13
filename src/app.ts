import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { AppError, NotFoundError } from '@errors/app.error';
import adminRoutes from '@src/routes/admin.routes';
import authRoutes from '@src/routes/auth.routes';
import cartRoutes from '@src/routes/cart.routes';
import dashboardRoutes from '@src/routes/dashboard.routes';
import ordersRoutes from '@src/routes/orders.routes';
import treesRoutes from '@src/routes/trees.routes';
import usersRoutes from '@src/routes/users.routes';
// import v1Routes from '@routes/v1.routes';
// import adminRoutes from '@routes/admin.routes';
// import webhookRoutes from '@routes/webhook.routes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    ...(process.env.NODE_ENV === 'development' ? {
        contentSecurityPolicy: false
    } : {})
}));

app.set('trust proxy', 1);

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    skip: (req: Request) => req.method === 'OPTIONS'
}));
app.options("/{*splat}", cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
// app.use('/v1', v1Routes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/trees', treesRoutes);
app.use('/api/users', usersRoutes);
// app.use('/webhook', webhookRoutes);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
});

// 404 handling
app.use((_req: Request, res: Response, _next: NextFunction) => {
    throw new NotFoundError('Not Found');
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            statusCode: err.statusCode,
            errors: err.errors || undefined,
            ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
        });
    }

    console.error('Unhandled Exception:', JSON.stringify(err));
    return res.status(500).json({
        message: 'Internal Server Error',
        statusCode: 500,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
