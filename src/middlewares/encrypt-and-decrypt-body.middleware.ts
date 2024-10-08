import { Request, Response, NextFunction } from 'express';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';
import { catchErrorHandlerController } from '../utils/errors/catch-error-handlers';

export class EncryptDecryptBodyMiddleware {
  public static encryptBody = <T>(req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = (body: T) => {
      if (body) {
        try {
          const { iv, encryptedData } = EncryptationProcesses.encyptData(body);
          res.setHeader('iv', iv);
          return originalJson.apply(res, [{ data: encryptedData }]);
        } catch (error) {
          next(catchErrorHandlerController(error));
        }
      }
      return originalJson.apply(res, [body]);
    };

    next();
  };
}
