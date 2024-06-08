import express from 'express';
import morgan, { TokenIndexer } from 'morgan';

type LogTokens = TokenIndexer<express.Request, express.Response>;

export const logger: () => express.RequestHandler = () => {
  const loggerMiddleware: express.RequestHandler = morgan(
    (tokens: LogTokens, req: express.Request, res: express.Response) => {
      const method = tokens.method(req, res);
      const url = tokens.url(req, res);
      const status = tokens.status(req, res);
      const responseTime = tokens['response-time'](req, res);
      const remoteAddress = req.ip;
      return `${remoteAddress} - ${method} ${url} ${status} ${responseTime}ms`;
    }
  );
  return loggerMiddleware;
};
