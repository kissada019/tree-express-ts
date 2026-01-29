import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { AppError, NotFoundError } from '@errors/app.error';
import adminRoutes from '@src/routes/admin.routes';
import authRoutes from '@src/routes/auth.routes';
import usersRoutes from '@src/routes/users.routes';
// import v1Routes from '@routes/v1.routes';
// import adminRoutes from '@routes/admin.routes';
// import webhookRoutes from '@routes/webhook.routes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
    ...(process.env.NODE_ENV === 'development' ? {
        contentSecurityPolicy: false
    } : {})
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/v1', v1Routes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
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