import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { MainRoutes } from './src/index';
import { TokenMiddleware } from './src/middlewares/token.middleware';
import { errorHandler } from './src/middlewares/error-handler.middleware';
import { logger } from './src/middlewares/logger.middleware';
import { HttpError } from './src/utils/errors/http-error';
import { config } from './src/utils/secrets/envs-manager';

class App {
  public app: express.Application;
  private PORT: string | number;

  constructor() {
    this.app = express();
    this.PORT = config.port;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    const tokenMiddleware = new TokenMiddleware();
    this.app.use('/api', tokenMiddleware.router);
    this.app.use(bodyParser.json());
    this.app.use(logger());
    this.app.use(tokenMiddleware.isTokenAuthenticated());
  }

  private initializeRoutes(): void {
    const mainRoutes = new MainRoutes();
    this.app.use('/api', mainRoutes.router);
  }

  private initializeErrorHandling(): void {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(new HttpError(404, 'Route does not exist.'));
    });
    
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.PORT);
  }
}

const server = new App();
server.listen();
