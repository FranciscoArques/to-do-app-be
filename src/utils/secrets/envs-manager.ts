import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: string;
  firebaseAdminCredentials: string;
  jwtSecretKey: string;
  encryptSecretKey: string;
  hashPasswordSecretKey: string;
}

export const config: Config = {
  port: process.env.PORT || '3001',
  firebaseAdminCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  jwtSecretKey: process.env.JWT_SECRET_KEY || '',
  encryptSecretKey: process.env.ENCRYPTION_PROCESS_SECRET_KEY || '',
  hashPasswordSecretKey: process.env.HASH_PASSWORD_SECRET_KEY || ''
};
