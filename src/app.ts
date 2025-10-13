import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(routes);

app.use((_req, res) => {
  res.status(404).json({ error: 'API do FullStack Mini Projeto rodando 🚀' });
});

app.use(errorMiddleware);

export default app;
