import { db } from '../db/firebase-service';
import { HealthCheckDTO } from '../models/health-checks.models';
import { catchErrorHandler } from '../utils/errors/catch-error-handlers';

export class HealthCheckService {
  public static ping(): HealthCheckDTO['pingResponse'] {
    return { message: 'pong' };
  }

  public static async pingDb(): Promise<HealthCheckDTO['pingDbResponse']> {
    try {
      const data = await db
        .collection('token')
        .doc('ping-db-response')
        .get()
        .then((doc) => (doc.exists ? doc.data() : ''));
      return { data };
    } catch (error: unknown) {
      return catchErrorHandler('pingDb', error);
    }
  }
}
