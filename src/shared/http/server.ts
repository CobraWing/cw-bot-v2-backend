import 'reflect-metadata';
import 'dotenv/config';
import log from 'heroku-logger';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import 'express-async-errors';
import AppError from '@shared/errors/AppError';
import routes from './routes';

import '@shared/typeorm';
import '@shared/providers';
import '@modules/discord';
import '@modules/jobs';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errors());

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    log.error('Error', err);
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      message_ptbr: err.message_ptbr,
    });
  }

  log.error('An error occurs', err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  log.info(`🚀 Server started on port ${port}!`);
});
