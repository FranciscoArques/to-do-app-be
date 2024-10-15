import type { DocumentData } from 'firebase/firestore';

export interface HealthCheckDTO {
  pingResponse: PingResponseDTO;
  pingDbResponse: PingDbResponseDTO;
  pingSendEmailResponseDTO: PingSendEmailResponseDTO;
}

type PingResponseDTO = {
  message: string;
};

type PingSendEmailResponseDTO = {
  acceptedEmail: number;
  rejectedEmail: number;
};

type PingDbResponseDTO = {
  data?: DocumentData | '';
};
