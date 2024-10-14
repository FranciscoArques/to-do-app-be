import { db } from '../db/firebase-service';
import { HealthCheckDTO } from '../models/health-checks.models';
import { Config } from '../utils/secrets/envs-manager';
import { sendEmailInstances } from '../utils/send-email';
import { catchErrorHandler } from '../utils/errors/catch-error-handlers';

export class HealthCheckService {
  public static ping(): HealthCheckDTO['pingResponse'] {
    return { message: 'pong' };
  }

  public static async pingSendEmail(): Promise<HealthCheckDTO['pingSendEmailResponseDTO']> {
    const { accepted, rejected } = await sendEmailInstances('ping-send-email', Config.senderEmail);
    return { accepted, rejected };
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
