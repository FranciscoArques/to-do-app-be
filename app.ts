import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { MainRoutes } from './src/index';
import { errorHandler } from './src/middlewares/error-handler.middleware';
import { logger } from './src/middlewares/logger.middleware';
import { HttpError } from './src/utils/errors/http-error';
import { config } from './src/utils/secrets/envs-manager';

const app = express();
const PORT = config.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger());

const mainRoutes = new MainRoutes();
app.use('/api', mainRoutes.router);

app.use((req: Request, res: Response, next: NextFunction) => {
  return next(new HttpError(404, 'Route does not exists.'));
});

app.use(errorHandler);

app.listen(PORT);
