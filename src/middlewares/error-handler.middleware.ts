import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors/http-error';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ status, message });
};
