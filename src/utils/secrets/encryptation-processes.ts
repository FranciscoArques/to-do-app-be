import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Config } from './envs-manager';
import { HttpError } from '../errors/http-error';
import { catchErrorHandler } from '../errors/catch-error-handlers';

type EncyptData = {
  iv: string;
  encryptedData: string;
};

export class EncryptationProcesses {
  public static encyptData = (data: object): EncyptData => {
    if (!data || !Config.encryptSecretKey) {
      throw new HttpError(400, 'encryptData: missing parameters.');
    }
    try {
      const iv = crypto.randomBytes(16);
      const key = crypto.createHash('sha256').update(Config.encryptSecretKey, 'utf-8').digest();
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'base64');
      encrypted += cipher.final('base64');
      return { iv: iv.toString('base64'), encryptedData: encrypted };
    } catch (error) {
      return catchErrorHandler('encyptData', error);
    }
  };

  public static decryptData = (iv: string, encryptedData: string) => {
    if (!iv || !encryptedData || !Config.encryptSecretKey) {
      throw new HttpError(400, 'decryptData: missing parameters.');
    }
    try {
      const iv64 = Buffer.from(iv, 'base64');
      const key = crypto.createHash('sha256').update(Config.encryptSecretKey, 'utf-8').digest();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv64);
      let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
      decrypted += decipher.final('utf-8');
      return JSON.parse(decrypted);
    } catch (error) {
      return catchErrorHandler('decryptData', error);
    }
  };

  public static hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    try {
      const hashedPassword = await bcrypt.hash(`${password}${Config.hashPasswordSecretKey}`, saltRounds);
      return hashedPassword;
    } catch (error) {
      return catchErrorHandler('hashPassword', error);
    }
  };

  public static comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
      const match = await bcrypt.compare(`${password}${Config.hashPasswordSecretKey}`, hashedPassword);
      return match;
    } catch (error) {
      return catchErrorHandler('comparePassword', error);
    }
  };
}
