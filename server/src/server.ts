import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authService } from './services/auth.service';

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use('/api/config', express.static('../config-json'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await authService.initAdminUser();

    app.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API docs: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
