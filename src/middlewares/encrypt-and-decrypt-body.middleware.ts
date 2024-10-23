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
          res.setHeader('encrypt-body-iv', iv);
          return originalJson.apply(res, [{ data: encryptedData }]);
        } catch (error) {
          next(catchErrorHandlerController(error));
        }
      }
      return originalJson.apply(res, [body]);
    };

    next();
  };

  public static decryptBody = <T>(req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.body).length) {
      const encryptedData = req.body.data || '';
      const iv = req.header('decrypt-body-iv') || '';
      try {
        const decryptedData = EncryptationProcesses.decryptData(iv, encryptedData);
        req.body = decryptedData as T;
      } catch (error) {
        next(catchErrorHandlerController(error));
      }
    }

    next();
  };
}
