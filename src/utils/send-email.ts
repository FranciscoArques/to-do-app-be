import nodemailer from 'nodemailer';
import { Config } from './secrets/envs-manager';
import { HttpError } from './errors/http-error';

export interface Address {
  name: string;
  address: string;
}

type SendEmailResponseDTO = {
  accepted: (string | Address)[];
  rejected: (string | Address)[];
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
    return { accepted: info.accepted, rejected: info.rejected };
  } catch (error) {
    throw new HttpError(500, `sendEmail catch error: ${error}`);
  }
};

export const sendEmailInstances = async (instance: string, to: string) => {
  switch (instance) {
    case 'ping-send-email':
      return await sendEmail(to, subjectsEmail.pingSendEmail, bodiesEmail.pingSendEmail);
    default:
      throw new HttpError(404, 'sendEmailInstances: no instance correctly declared');
  }
};

const subjectsEmail = {
  pingSendEmail: 'Ping Send Email Try Out'
};

const bodiesEmail = {
  pingSendEmail: 'pong'
};
