import { Request, Response, NextFunction } from 'express';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';
import { catchErrorHandlerController } from '../utils/errors/catch-error-handlers';

export class EncryptDecryptBodyMiddleware {

  public static encryptBody = (req: Request, res: Response, next: NextFunction) => {

    if(res.statusCode >= 200 && res.statusCode < 300) {
      const originalJson = res.json;
      res.json = (body: any) => {

        if (body) {
          try {
            const { iv, encryptedData } = EncryptationProcesses.encyptData(body);
            const encryptedBody = `${iv}:${encryptedData}`;
            return originalJson.apply(res, [{ data: encryptedBody }]);
          } catch (error) {
            next(catchErrorHandlerController(error))
          }
        }

        return originalJson.apply(res, [body]);

      };
    }

    next();
  };

};
