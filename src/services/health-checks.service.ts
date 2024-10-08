import { db } from '../db/firebase-service';
import { HealthCheckDTO } from '../models/health-checks.models';
import { catchErrorHandler } from '../utils/errors/catch-error-handlers';
import { HttpError } from '../utils/errors/http-error';

export class HealthCheckService {
  public static ping(): HealthCheckDTO['pingResponse'] {
    return { message: 'pong' };
  }

  public static async pingDb(): Promise<HealthCheckDTO['pingDbResponse']> {
    try {
      const docRef = db.collection('token').doc('ping-db-response');
      const doc = await docRef.get();
      const result = doc.data();
      if (!result) {
        throw new HttpError(404, 'pingDb: firebase fetch error.');
      }
      return { result };
    } catch (error: unknown) {
      return catchErrorHandler('pingDb', error);
    }
  }
}
