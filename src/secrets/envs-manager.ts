import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: string | number,
  firebaseAdminCredentials: string,
  jwtSecretKey: string,
  encryptSecretKey: string
};

export const config: Config = {
  port: process.env.PORT || 3001,
  firebaseAdminCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  jwtSecretKey: process.env.JWT_SECRET_KEY || '',
  encryptSecretKey: process.env.ENCRYPTION_PROCESS_SECRET_KEY || ''
};