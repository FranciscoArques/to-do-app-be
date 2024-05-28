import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { HttpError } from './errors/HttpError';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ping', (req: Request, res: Response) => {
  res.send({ message: 'pong' });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  return next(
      new HttpError(404, 'Route does not exists.')
  );
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
