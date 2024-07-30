import crypto from 'crypto';
import { config } from '../secrets/envs-manager';
import { HttpError } from '../errors/http-error';
import { catchErrorHandler } from '../errors/catch-error-handlers';

type EncyptData = {
  iv: string;
  encryptedData: string;
};

export const encyptData = (data: object): EncyptData => {
  if (!data || !config.encryptSecretKey) {
    throw new HttpError(400, 'encryptData: missing parameters.');
  }
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(config.encryptSecretKey, 'utf-8').digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    return { iv: iv.toString('base64'), encryptedData: encrypted };
  } catch (error) {
    return catchErrorHandler('encyptData', error);
  }
};

export const decryptData = (iv: string, encryptedData: string) => {
  if (!iv || !encryptedData || !config.encryptSecretKey) {
    throw new HttpError(400, 'decryptData: missing parameters.');
  }
  try {
    const iv64 = Buffer.from(iv, 'base64');
    const key = crypto.createHash('sha256').update(config.encryptSecretKey, 'utf-8').digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv64);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return JSON.parse(decrypted);
  } catch (error) {
    return catchErrorHandler('decryptData', error);
  }
};
