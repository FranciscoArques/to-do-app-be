import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MainRoutes } from './src/index';
import { TokenMiddleware } from './src/middlewares/token.middleware';
import { Documentation } from './documentation/documentation.routes';
import { EncryptDecryptBodyMiddleware } from './src/middlewares/encrypt-and-decrypt-body.middleware';
import { errorHandler } from './src/middlewares/error-handler.middleware';
import { logger } from './src/middlewares/logger.middleware';
import { HttpError } from './src/utils/errors/http-error';
import { Config } from './src/utils/secrets/envs-manager';

class App {
  public app: express.Application;
  private PORT: string;
  private tokenMiddleware: TokenMiddleware;
  private mainRoutes: MainRoutes;
  private documentation: Documentation;

  constructor() {
    this.app = express();
    this.PORT = Config.port;
    this.tokenMiddleware = new TokenMiddleware();
    this.mainRoutes = new MainRoutes();
    this.documentation = new Documentation();

    this.initializeDocumentation();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeDocumentation(): void {
    this.app.use('/api-docs', this.documentation.router);
  }

  private initializeMiddlewares(): void {
    this.app.use(logger());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(EncryptDecryptBodyMiddleware.encryptBody);
    this.app.use('/token', EncryptDecryptBodyMiddleware.decryptBody, this.tokenMiddleware.router);
    this.app.use(bodyParser.json());
    this.app.use(this.tokenMiddleware.isTokenAuthenticated());
  }

  private initializeRoutes(): void {
    this.app.use('/api', EncryptDecryptBodyMiddleware.decryptBody, this.mainRoutes.router);
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
