import nodemailer from 'nodemailer';
import { Config } from './secrets/envs-manager';
import { HttpError } from './errors/http-error';

type SendEmailResponseDTO = {
  acceptedEmail: number;
  rejectedEmail: number;
};

const sendEmail = async (to: string, subject: string, body: string): Promise<SendEmailResponseDTO> => {
  const transporter = nodemailer.createTransport({
    // TODO change it to mailtrap
    service: 'gmail',
    auth: {
      user: Config.senderEmail,
      pass: Config.senderEmailPassword
    }
  });

  const mailOptions = {
    from: Config.senderEmail,
    to,
    subject,
    body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (!info) {
      throw new HttpError(500, 'sendEmail: bad request in transporter');
    }
    return { acceptedEmail: info.accepted.length || 0, rejectedEmail: info.rejected.length || 0 };
  } catch (error) {
    throw new HttpError(500, `sendEmail catch error: ${error}`);
  }
};

export const sendEmailInstances = async (instance: string, to: string) => {
  switch (instance) {
    case 'ping-send-email':
      return await sendEmail(to, subjectsEmail.pingSendEmail, bodiesEmail.pingSendEmail);
    case 'register-user':
      return await sendEmail(to, subjectsEmail.registerUser, bodiesEmail.registerUser);
    case 'send-email-change-password-user':
      return await sendEmail(to, subjectsEmail.emailChangePassword, bodiesEmail.emailChangePassword);
    default:
      throw new HttpError(404, 'sendEmailInstances: no instance correctly declared');
  }
};

const subjectsEmail = {
  pingSendEmail: 'Ping Send Email Try Out',
  registerUser: 'Welcome New User!',
  emailChangePassword: 'Change Password!'
};

const bodiesEmail = {
  pingSendEmail: 'Pong',
  registerUser: 'You have been successfully registered in the app!',
  emailChangePassword: 'Change your password here: etc etc...'
};
