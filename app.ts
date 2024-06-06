import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

import { MainRoutes } from './src/index';
import { errorHandler } from './src/middleware/errorHandler';
import { HttpError } from './src/errors/HttpError';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mainRoutes = new MainRoutes();
app.use('/api', mainRoutes.router);

app.use((req: Request, res: Response, next: NextFunction) => {
  return next(
      new HttpError(404, 'Route does not exists.')
  );
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
