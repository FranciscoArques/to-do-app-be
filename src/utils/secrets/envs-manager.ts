import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: string;
  firebaseAdminCredentials: string;
  jwtSecretKey: string;
  encryptSecretKey: string;
  hashPasswordSecretKey: string;
  senderEmail: string;
  senderEmailPassword: string;
}

export const Config: Config = {
  port: process.env.PORT || '3001',
  firebaseAdminCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  jwtSecretKey: process.env.JWT_SECRET_KEY || '',
  encryptSecretKey: process.env.ENCRYPTION_PROCESS_SECRET_KEY || '',
  hashPasswordSecretKey: process.env.HASH_PASSWORD_SECRET_KEY || '',
  senderEmail: process.env.SENDER_EMAIL || '',
  senderEmailPassword: process.env.SENDER_EMAIL_PASSWORD || ''
};

export const Regex = {
  userName: process.env.REGEX_USER_NAME ? new RegExp(`^${process.env.REGEX_USER_NAME}$`) : /^[a-zA-Z\d]{2,16}$/,
  userPassword: process.env.REGEX_USER_PASSWORD ? new RegExp(`^${process.env.REGEX_USER_PASSWORD}$`) : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/,
  userEmail: process.env.REGEX_USER_EMAIL ? new RegExp(`^${process.env.REGEX_USER_EMAIL}$`) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
