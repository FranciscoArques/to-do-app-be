import type { DocumentData } from 'firebase/firestore';
import type { Address } from '../utils/send-email';

export interface HealthCheckDTO {
  pingResponse: PingResponseDTO;
  pingDbResponse: PingDbResponseDTO;
  pingSendEmailResponseDTO: PingSendEmailResponseDTO;
}

type PingResponseDTO = {
  message: string;
};

type PingSendEmailResponseDTO = {
  accepted: (string | Address)[];
  rejected: (string | Address)[];
};

type PingDbResponseDTO = {
  data?: DocumentData | '';
};
